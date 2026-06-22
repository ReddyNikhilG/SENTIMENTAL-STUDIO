# 🌟 Sentiment Studio

**Sentiment Studio** is a modern, full-stack application for performing advanced text sentiment analysis. Upgraded from its original Streamlit roots, the platform now features a blazing-fast Python FastAPI backend paired with a beautiful React frontend powered by TanStack Start, Tailwind CSS, and Radix UI.

## ✨ Features

- **Multi-Model Support**: 
  - 🧠 **DeBERTa Zero-Shot Classification**: High accuracy contextual sentiment analysis using Hugging Face transformers (DeBERTa Small & Base).
  - ⚡ **VADER Sentiment**: Lightning-fast, rule-based fallback model.
- **Rich User Interface**: Built with React, Framer Motion, and Tailwind CSS for a premium, responsive experience.
- **PDF Extraction**: Upload a PDF document and instantly extract and analyze its text sentiment.
- **Analytics Dashboard**: Real-time trend analysis tracking sentiment distributions over time.
- **History Tracking**: Local session-based history management.
- **Export Capabilities**: Download sentiment reports in `.csv` or text format.
- **Background Preloading**: Asynchronous model loading ensures quick response times without cold starts.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [TanStack Start](https://tanstack.com/start) / React 19
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.x)
- **NLP Models**: 
  - `Transformers` (Hugging Face DeBERTa-v3)
  - `vaderSentiment`
- **Utilities**: `pandas`, `pypdf` for data processing and PDF parsing

## 🚀 Getting Started

### Prerequisites
- Node.js & npm (or Bun)
- Python 3.8+ 

### 1. Backend Setup

Navigate to the project root and create a virtual environment:

```bash
# Create virtual environment
python -m venv .venv

# Activate it (Windows)
.venv\Scripts\activate
# Activate it (Mac/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup

Install the Node.js dependencies:

```bash
npm install
# or
bun install
```

### 3. Running the App locally

The project is structured to run the backend and frontend concurrently or serve the built frontend via FastAPI.

**To run the frontend dev server:**
```bash
npm run dev
```

**To run the backend server:**
```bash
uvicorn app:app --host 0.0.0.0 --port 8500 --reload
```
*(The FastAPI app is also configured to serve the frontend from `dist/client` if built for production).*

## 🌐 API Endpoints

- `POST /predict` - Accepts JSON with `text` and `model` (VADER, DeBERTa Small, DeBERTa Base).
- `POST /pdf/extract` - Upload a PDF and extract text for analysis.
- `GET /history` - Fetch recent analysis history.
- `GET /analytics` - Get aggregation and trend metrics.
- `GET /export/csv` - Download history as CSV.
- `GET /report` - Download latest report as TXT.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you'd like to improve Sentiment Studio.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
