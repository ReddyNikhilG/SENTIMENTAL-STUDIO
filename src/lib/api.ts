// API client for the Sentiment Studio Python backend.
// Configure via VITE_API_BASE_URL. Defaults assume a local dev server.

const BASE =
    (import.meta.env.VITE_API_BASE_URL as string) ||
    (import.meta.env.DEV ? "http://localhost:8500" : "");

export interface SentimentResult {
    sentiment: "positive" | "negative" | "neutral" | string;
    score: number; // -1..1 or 0..1 depending on backend; UI normalizes
    confidence: number; // 0..1
    emoji?: string;
    keywords?: { word: string; weight: number }[];
    scores?: { label: string; value: number }[]; // model output breakdown
    text?: string;
}

export interface HistoryItem {
    id: string;
    date: string;
    text: string;
    sentiment: string;
    score: number;
    emoji?: string;
    confidence: number;
}

export interface TrendPoint {
    date: string;
    positive: number;
    negative: number;
    neutral: number;
}

async function safeJson<T>(url: string, init?: RequestInit, fallback?: T): Promise<T> {
    try {
        const res = await fetch(url, init);
        if (!res.ok) throw new Error(`${res.status}`);
        return (await res.json()) as T;
    } catch (e) {
        if (fallback !== undefined) return fallback;
        throw e;
    }
}

const EMOJI: Record<string, string> = { positive: "😊", negative: "😡", neutral: "😐" };

export const api = {
    base: BASE,

    async predict(text: string, model?: string): Promise<SentimentResult> {
        const result = await safeJson<SentimentResult>(
            `${BASE}/predict`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, model }),
            },
            // Demo fallback so UI works without backend
            mockPredict(text),
        );
        if (!result.emoji) result.emoji = EMOJI[result.sentiment?.toLowerCase()] || "🤖";
        if (!result.scores) {
            result.scores = [
                { label: "Positive", value: result.sentiment === "positive" ? result.confidence : 1 - result.confidence },
                { label: "Negative", value: result.sentiment === "negative" ? result.confidence : (1 - result.confidence) * 0.5 },
                { label: "Neutral", value: result.sentiment === "neutral" ? result.confidence : (1 - result.confidence) * 0.5 },
            ];
        }
        return result;
    },

    async extractPdf(file: File): Promise<{ text: string }> {
        const fd = new FormData();
        fd.append("file", file);
        return safeJson<{ text: string }>(
            `${BASE}/pdf/extract`,
            { method: "POST", body: fd },
            { text: `[Demo extraction from ${file.name}]\n\nConnect your backend at VITE_API_BASE_URL to see real extracted PDF text.` },
        );
    },

    async history(): Promise<HistoryItem[]> {
        return safeJson<HistoryItem[]>(`${BASE}/history`, undefined, mockHistory());
    },

    async analytics(): Promise<{ trend: TrendPoint[]; totals: { positive: number; negative: number; neutral: number } }> {
        return safeJson(`${BASE}/analytics`, undefined, mockAnalytics());
    },

    csvUrl: `${BASE}/export/csv`,
    reportUrl: `${BASE}/report`,
};

function mockPredict(text: string): SentimentResult {
    const t = text.toLowerCase();
    const pos = (t.match(/good|great|love|amazing|excellent|happy|awesome|fantastic|wonderful|best|brilliant|superb|perfect/g) || []).length;
    const neg = (t.match(/bad|hate|terrible|awful|worst|sad|angry|poor|horrible|dreadful|awful|disappointing/g) || []).length;
    let sentiment: "positive" | "negative" | "neutral" = "neutral";
    let score = 0;
    if (pos > neg) { sentiment = "positive"; score = Math.min(0.95, 0.4 + pos * 0.15); }
    else if (neg > pos) { sentiment = "negative"; score = -Math.min(0.95, 0.4 + neg * 0.15); }
    const confidence = Math.min(0.99, 0.6 + Math.abs(score) * 0.4);
    const words = text.split(/\s+/).filter((w) => w.length > 3).slice(0, 8);

    // Build properly normalized scores that always sum to 1.0
    let posScore = 0.1, negScore = 0.1, neuScore = 0.8;
    if (sentiment === "positive") {
        posScore = confidence;
        negScore = (1 - confidence) * 0.3;
        neuScore = (1 - confidence) * 0.7;
    } else if (sentiment === "negative") {
        negScore = confidence;
        posScore = (1 - confidence) * 0.3;
        neuScore = (1 - confidence) * 0.7;
    } else {
        neuScore = confidence;
        posScore = (1 - confidence) * 0.5;
        negScore = (1 - confidence) * 0.5;
    }

    return {
        sentiment,
        score,
        confidence,
        emoji: EMOJI[sentiment],
        keywords: words.map((w, i) => ({ word: w.replace(/[^a-zA-Z]/g, ""), weight: Math.max(0.1, 1 - i * 0.12) })).filter((k) => k.word.length > 2),
        scores: [
            { label: "Positive", value: Math.round(posScore * 10000) / 10000 },
            { label: "Negative", value: Math.round(negScore * 10000) / 10000 },
            { label: "Neutral", value: Math.round(neuScore * 10000) / 10000 },
        ],
        text,
    };
}

function mockHistory(): HistoryItem[] {
    const samples = [
        { text: "The new product launch exceeded all our expectations!", s: "positive" as const, sc: 0.92 },
        { text: "Customer service was unhelpful and slow.", s: "negative" as const, sc: -0.78 },
        { text: "The quarterly report contains standard financial data.", s: "neutral" as const, sc: 0.05 },
        { text: "I'm absolutely thrilled with the team's performance.", s: "positive" as const, sc: 0.88 },
        { text: "The system crashed during the demo, very disappointing.", s: "negative" as const, sc: -0.81 },
        { text: "Meeting scheduled for next Tuesday at 3pm.", s: "neutral" as const, sc: 0.02 },
    ];
    return samples.map((x, i) => ({
        id: `h${i}`,
        date: new Date(Date.now() - i * 3600_000 * 7).toISOString(),
        text: x.text,
        sentiment: x.s,
        score: x.sc,
        emoji: EMOJI[x.s],
        confidence: 0.7 + Math.random() * 0.3,
    }));
}

function mockAnalytics() {
    const days = 14;
    const trend: TrendPoint[] = Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        return {
            date: d.toISOString().slice(5, 10),
            positive: Math.round(20 + Math.random() * 30 + Math.sin(i / 2) * 8),
            negative: Math.round(8 + Math.random() * 14),
            neutral: Math.round(10 + Math.random() * 12),
        };
    });
    return {
        trend,
        totals: {
            positive: trend.reduce((s, x) => s + x.positive, 0),
            negative: trend.reduce((s, x) => s + x.negative, 0),
            neutral: trend.reduce((s, x) => s + x.neutral, 0),
        },
    };
}
