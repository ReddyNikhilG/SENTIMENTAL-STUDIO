from __future__ import annotations

import csv
import json
import os
import re
import sys
from datetime import datetime, timedelta
from io import BytesIO, StringIO
from typing import Any, Dict, List, Optional

from collections import Counter
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pandas as pd
from pypdf import PdfReader
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Load model pipeline caches if transformers/torch are available
try:
    import torch
    from transformers import pipeline
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False

MODELS_CACHE: Dict[str, Any] = {}

def get_deberta_pipeline(model_id: str) -> Any:
    if not HAS_TRANSFORMERS:
        return None
    if model_id not in MODELS_CACHE:
        try:
            device = 0 if torch.cuda.is_available() else -1
            MODELS_CACHE[model_id] = pipeline(
                "zero-shot-classification",
                model=model_id,
                device=device
            )
        except Exception as e:
            print(f"Error loading model {model_id}: {e}")
            return None
    return MODELS_CACHE[model_id]

# Background preloading for DeBERTa Small model to prevent request timeouts
def preload_models():
    if HAS_TRANSFORMERS:
        try:
            print("Preloading DeBERTa Small zero-shot classification model in background...")
            get_deberta_pipeline("MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33")
            print("DeBERTa Small model preloaded successfully.")
        except Exception as e:
            print(f"Error preloading model: {e}")

import threading
threading.Thread(target=preload_models, daemon=True).start()

# Initialize VADER
ANALYZER = SentimentIntensityAnalyzer()
MAX_HISTORY = 50
MAX_CHARS = 5000

STOPWORDS = {
    "the", "is", "a", "an", "and", "to", "for", "of", "it", "this", "that", "was",
    "with", "but", "are", "in", "on", "at", "be", "as", "or", "by", "from", "we",
    "you", "they", "i", "me", "my", "our", "your", "have", "had", "has",
    "been", "will", "would", "could", "should", "its", "not",
}

# Short but sentiment-bearing words that should always be included despite length
SENTIMENT_WORDS = {
    "hate", "love", "good", "best", "bad", "poor", "best", "evil", "kind",
    "fear", "hope", "calm", "rage", "warm", "cold", "pain", "joy", "sad",
    "glad", "bold", "grim", "hurt", "nice", "sick", "dull", "fine", "dark",
}

# Persistent History JSON file
HISTORY_FILE = "history.json"
history_lock = threading.Lock()

def load_history() -> List[Dict[str, Any]]:
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading history: {e}")
            return []
    return []

def save_history(history: List[Dict[str, Any]]):
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving history: {e}")

HISTORY = load_history()

def push_history(record: Dict[str, Any]) -> None:
    global HISTORY
    # React frontend expects history items to have lowercase sentiment values
    history_item = {
        "id": f"h_{int(datetime.now().timestamp() * 1000)}",
        "date": datetime.now().isoformat(),
        "text": record["text"],
        "sentiment": record["sentiment"].lower(),
        "score": record["score"],
        "emoji": record["emoji"],
        "confidence": record["confidence"],
        "engine": record.get("engine", "VADER")
    }
    with history_lock:
        HISTORY = [history_item, *HISTORY]
        HISTORY = HISTORY[:MAX_HISTORY]
        # ✅ Bug fix: save inside lock to prevent race condition with concurrent writes
        try:
            with open(HISTORY_FILE, "w", encoding="utf-8") as f:
                json.dump(HISTORY, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving history: {e}")

def get_keywords(text: str) -> List[Dict[str, Any]]:
    cleaned = re.sub(r"[^\w\s]|\d|_", "", text.lower())
    # ✅ Bug fix: include words >= 4 chars OR short sentiment-bearing words
    words = [
        w for w in cleaned.split()
        if (len(w) >= 4 or w in SENTIMENT_WORDS) and w not in STOPWORDS
    ]
    if not words:
        return []
    counts = Counter(words)
    max_count = max(counts.values())
    top_words = counts.most_common(12)
    return [{"word": word, "weight": round(count / max_count, 2)} for word, count in top_words]

def classify(compound: float) -> tuple[str, str]:
    if compound >= 0.05:
        return "positive", "😊"
    if compound <= -0.05:
        return "negative", "😡"
    return "neutral", "😐"

def analyze_vader(text: str) -> Dict[str, Any]:
    scores = ANALYZER.polarity_scores(text)
    compound = scores["compound"]
    sentiment, emoji = classify(compound)
    
    # ✅ Bug fix: Calculate cohesive class probabilities with proper clamping
    if compound >= 0.05:
        norm = (compound - 0.05) / 0.95
        pos_prob = 0.5 + 0.45 * norm
        neg_prob = max(0.01, 0.05 * (1.0 - norm))
        neu_prob = max(0.01, 1.0 - pos_prob - neg_prob)
        confidence = pos_prob
    elif compound <= -0.05:
        norm = (abs(compound) - 0.05) / 0.95
        neg_prob = 0.5 + 0.45 * norm
        pos_prob = max(0.01, 0.05 * (1.0 - norm))
        neu_prob = max(0.01, 1.0 - pos_prob - neg_prob)
        confidence = neg_prob
    else:
        # Neutral zone: compound is in (-0.05, 0.05)
        t = 1.0 - abs(compound) / 0.05  # 1.0 at compound=0, 0.0 at boundaries
        neu_prob = 0.5 + 0.45 * t
        remaining = 1.0 - neu_prob
        if compound >= 0:
            pos_prob = remaining * (0.5 + 0.5 * (compound / 0.05))
            neg_prob = remaining - pos_prob
        else:
            neg_prob = remaining * (0.5 + 0.5 * (abs(compound) / 0.05))
            pos_prob = remaining - neg_prob
        # Clamp to prevent floating point negatives
        pos_prob = max(0.01, pos_prob)
        neg_prob = max(0.01, neg_prob)
        neu_prob = max(0.01, 1.0 - pos_prob - neg_prob)
        confidence = neu_prob

    return {
        "text": text,
        "sentiment": sentiment,
        "score": compound,
        "emoji": emoji,
        "confidence": round(confidence, 4),
        "scores": [
            {"label": "Positive", "value": round(pos_prob, 4)},
            {"label": "Negative", "value": round(neg_prob, 4)},
            {"label": "Neutral", "value": round(neu_prob, 4)}
        ],
        "engine": "VADER"
    }

def analyze_deberta(text: str, model_id: str) -> Dict[str, Any]:
    classifier = get_deberta_pipeline(model_id)
    if classifier is None:
        res = analyze_vader(text)
        res["engine"] = "VADER (Fallback)"
        return res

    candidate_labels = ["positive", "neutral", "negative"]
    hypothesis_template = "The sentiment of this text is {}."
    
    try:
        result = classifier(
            text,
            candidate_labels=candidate_labels,
            hypothesis_template=hypothesis_template,
            truncation=True
        )
        scores_dict = dict(zip(result["labels"], result["scores"]))
        pos_prob = scores_dict.get("positive", 0.0)
        neu_prob = scores_dict.get("neutral", 0.0)
        neg_prob = scores_dict.get("negative", 0.0)
        
        # Determine sentiment based on the highest probability class to avoid classification discrepancies
        max_prob = max(pos_prob, neu_prob, neg_prob)
        if max_prob == pos_prob:
            sentiment = "positive"
            emoji = "😊"
        elif max_prob == neg_prob:
            sentiment = "negative"
            emoji = "😡"
        else:
            sentiment = "neutral"
            emoji = "😐"
            
        compound = pos_prob - neg_prob
        confidence = max_prob
        
        return {
            "text": text,
            "sentiment": sentiment,
            "score": compound,
            "emoji": emoji,
            "confidence": round(confidence, 4),
            "scores": [
                {"label": "Positive", "value": round(pos_prob, 4)},
                {"label": "Negative", "value": round(neg_prob, 4)},
                {"label": "Neutral", "value": round(neu_prob, 4)}
            ],
            "engine": "DeBERTa Small" if "xsmall" in model_id else "DeBERTa Base"
        }
    except Exception as e:
        print(f"Error classifying with DeBERTa: {e}")
        res = analyze_vader(text)
        res["engine"] = "VADER (Fallback)"
        return res

# Initialize FastAPI App
app = FastAPI(title="Sentiment Studio API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    text: str
    model: Optional[str] = "VADER"

@app.post("/predict")
def predict(request: PredictRequest):
    text = request.text.strip()
    model = request.model or "VADER"
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    # Truncate text if it exceeds maximum character limit instead of throwing 400 error
    if len(text) > MAX_CHARS:
        text = text[:MAX_CHARS]

    if model == "DeBERTa Small" and HAS_TRANSFORMERS:
        res = analyze_deberta(text, "MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33")
    elif model == "DeBERTa Base" and HAS_TRANSFORMERS:
        res = analyze_deberta(text, "MoritzLaurer/deberta-v3-base-zeroshot-v1.1-all-33")
    else:
        res = analyze_vader(text)
        if model != "VADER":
            res["engine"] = "VADER (Fallback)"

    # Calculate keywords
    res["keywords"] = get_keywords(text)
    
    # Save to history list
    push_history(res)
    
    return res

@app.post("/pdf/extract")
async def extract_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    try:
        contents = await file.read()
        reader = PdfReader(BytesIO(contents))
        page_text = []
        for page in reader.pages:
            t = page.extract_text() or ""
            page_text.append(t)
        combined = "\n".join(part.strip() for part in page_text if part.strip()).strip()
        if not combined:
            raise HTTPException(status_code=400, detail="The PDF contains no extractable text. It might be empty or scanned.")
        return {"text": combined}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract PDF text: {str(e)}")

@app.get("/history")
def get_history():
    return HISTORY

@app.get("/analytics")
def get_analytics():
    # Calculate totals
    totals = {"positive": 0, "negative": 0, "neutral": 0}
    for item in HISTORY:
        sentiment = item["sentiment"].lower()
        if sentiment in totals:
            totals[sentiment] += 1

    # Base background stats for a premium initial dashboard experience if history is clean/empty
    if len(HISTORY) == 0:
        totals = {"positive": 24, "negative": 6, "neutral": 12}

    # Group counts by date
    history_counts = {}
    for item in HISTORY:
        try:
            dt = datetime.fromisoformat(item["date"])
            date_str = dt.strftime("%m-%d")
            if date_str not in history_counts:
                history_counts[date_str] = {"positive": 0, "negative": 0, "neutral": 0}
            sentiment = item["sentiment"].lower()
            if sentiment in history_counts[date_str]:
                history_counts[date_str][sentiment] += 1
        except Exception:
            continue

    # Generate 14-day trend data
    trend = []
    for i in range(13, -1, -1):
        dt = datetime.now() - timedelta(days=i)
        date_str = dt.strftime("%m-%d")
        
        pos_count = history_counts.get(date_str, {}).get("positive", 0)
        neg_count = history_counts.get(date_str, {}).get("negative", 0)
        neu_count = history_counts.get(date_str, {}).get("neutral", 0)

        # Supplement with beautiful trend waves if history is empty
        if len(HISTORY) == 0:
            import math
            pos_count = int(12 + 6 * math.sin(i / 2.0) + (i % 2) * 2)
            neg_count = int(3 + (i % 3))
            neu_count = int(6 + (i % 2) * 2)

        trend.append({
            "date": date_str,
            "positive": pos_count,
            "negative": neg_count,
            "neutral": neu_count
        })

    return {
        "trend": trend,
        "totals": totals
    }

@app.get("/export/csv")
def export_csv():
    output = StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=["created_at", "sentiment", "score", "emoji", "confidence_text", "text"],
    )
    writer.writeheader()
    for item in HISTORY:
        try:
            dt = datetime.fromisoformat(item["date"])
            created_at = dt.strftime("%d %b %Y, %I:%M %p")
        except Exception:
            created_at = item["date"]
            
        writer.writerow({
            "created_at": created_at,
            "sentiment": item["sentiment"].capitalize(),
            "score": round(item["score"], 2),
            "emoji": item.get("emoji", "🤖"),
            "confidence_text": f"{round(item['confidence'] * 100)}%",
            "text": item["text"]
        })
    csv_content = output.getvalue()
    
    return StreamingResponse(
        BytesIO(csv_content.encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sentiment-history.csv"}
    )

@app.get("/report")
def export_report():
    if not HISTORY:
        report_content = "Sentiment Studio Report\n\nNo analyses recorded yet."
    else:
        latest = HISTORY[0]
        try:
            dt = datetime.fromisoformat(latest["date"])
            created_at = dt.strftime("%d %b %Y, %I:%M %p")
        except Exception:
            created_at = latest["date"]
        report_content = (
            f"Sentiment Studio Report\n\n"
            f"Latest Analysis:\n"
            f"Generated: {created_at}\n"
            f"Text: {latest['text']}\n"
            f"Sentiment: {latest['sentiment'].capitalize()}\n"
            f"Score: {latest['score']:.2f}\n"
            f"Confidence: {latest['confidence'] * 100:.0f}%\n"
        )
        
    return StreamingResponse(
        BytesIO(report_content.encode("utf-8")),
        media_type="text/plain",
        headers={"Content-Disposition": "attachment; filename=sentiment-report.txt"}
    )

# Serve index.html for frontend SPA routing (deep links)
@app.get("/{catchall:path}")
async def serve_spa(catchall: str):
    # If it looks like a request for a static asset file, skip and let StaticFiles return 404
    if "." in catchall.split("/")[-1]:
        raise HTTPException(status_code=404, detail="Not Found")
    for build_dir in ["dist/client", "dist", ".output/public"]:
        index_path = os.path.join(build_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="Not Found")

# Serve static frontend files in production
for build_dir in ["dist/client", "dist", ".output/public"]:
    if os.path.exists(build_dir):
        app.mount("/", StaticFiles(directory=build_dir, html=True), name="static")
        print(f"Serving built static React app from {build_dir}")
        break

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8500))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
