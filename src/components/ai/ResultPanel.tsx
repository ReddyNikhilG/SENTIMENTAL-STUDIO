import { motion, AnimatePresence } from "framer-motion";
import type { SentimentResult } from "@/lib/api";

function colorFor(s: string) {
    const k = s?.toLowerCase();
    if (k === "positive") return "oklch(0.78 0.2 155)"; // Positive green
    if (k === "negative") return "oklch(0.7 0.25 25)";  // Negative red
    return "oklch(0.72 0.2 240)";                       // Neutral neon blue
}

function CircularProgress({ value, color }: { value: number; color: string }) {
    const r = 52;
    const c = 2 * Math.PI * r;
    const v = Math.max(0, Math.min(1, value));

    return (
        <div className="relative size-36 flex items-center justify-center">
            {/* Pulsing glow background sphere */}
            <motion.div 
                animate={{ scale: [0.94, 1.04, 0.94], opacity: [0.08, 0.15, 0.08] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute size-28 rounded-full blur-xl -z-10"
                style={{ backgroundColor: color }}
            />

            <svg className="size-36 -rotate-90" viewBox="0 0 140 140">
                <defs>
                    <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor="color-mix(in oklab, white 30%, var(--primary))" />
                    </linearGradient>
                </defs>
                
                {/* Background Track ring */}
                <circle cx="70" cy="70" r={r} stroke="oklch(1 0 0 / 0.06)" strokeWidth="8" fill="none" />
                
                {/* Main Progress ring */}
                <motion.circle
                    cx="70" cy="70"
                    r={r}
                    stroke="url(#ring-grad)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${c}` }}
                    animate={{ strokeDasharray: `${v * c} ${c}` }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                />

                {/* Layered glowing blur ring */}
                <motion.circle
                    cx="70" cy="70"
                    r={r}
                    stroke={color}
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${c}` }}
                    animate={{ strokeDasharray: `${v * c} ${c}` }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                    style={{
                        filter: "blur(6px)",
                        opacity: 0.5
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                <span className="text-3xl font-bold font-display text-white">
                    {Math.round(v * 100)}<span className="text-base text-muted-foreground">%</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">confidence</span>
            </div>
        </div>
    );
}

export function ResultPanel({ result, charCount }: { result: SentimentResult | null; charCount: number }) {
    const color = colorFor(result?.sentiment || "neutral");

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                key={result ? result.sentiment : "awaiting"}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="grid gap-6 md:grid-cols-2"
            >
                {/* Holographic Sentiment Card */}
                <div
                    className="relative overflow-hidden rounded-3xl glass-strong p-6 border border-white/10 transition-all duration-500"
                    style={{ 
                        boxShadow: result 
                            ? `0 20px 50px -15px rgba(0,0,0,0.6), 0 0 25px 2px ${color}25` 
                            : "var(--shadow-card)"
                    }}
                >
                    {/* Background dynamic colored blob */}
                    <div
                        className="absolute -right-24 -top-24 size-64 rounded-full opacity-15 blur-3xl transition-colors duration-500"
                        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
                    />
                    
                    <div className="relative flex items-center gap-5">
                        <motion.div
                            initial={{ scale: 0.6, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 220, damping: 20 }}
                            className="flex size-20 items-center justify-center rounded-2xl text-5xl border"
                            style={{ 
                                background: `${color}15`, 
                                borderColor: `${color}40`,
                                boxShadow: `inset 0 0 20px ${color}33, 0 0 15px ${color}22` 
                            }}
                        >
                            {result?.emoji || "🤖"}
                        </motion.div>
                        <div>
                            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Classification Engine</div>
                            <div className="mt-1 text-3xl font-extrabold capitalize tracking-tight" style={{ color }}>
                                {result?.sentiment || "Awaiting input"}
                            </div>
                            <div className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                                Polar Score: <span className="text-white font-bold">{result ? result.score.toFixed(2) : "—"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <Stat label="Sentiment score" value={result ? result.score.toFixed(2) : "—"} />
                        <Stat label="Characters" value={String(charCount)} />
                    </div>
                </div>

                {/* 3D Circular Confidence Indicator Card */}
                <div className="flex items-center justify-center rounded-3xl glass-strong p-6 border border-white/10 relative overflow-hidden shadow-card">
                    <div className="flex flex-col items-center gap-4">
                        <CircularProgress value={result?.confidence || 0} color={color} />
                        <div className="text-center">
                            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Model Certainty</div>
                            <div className="mt-1 text-xs font-semibold text-white">
                                {result
                                    ? result.confidence > 0.85
                                        ? "Extremely High Precision"
                                        : result.confidence > 0.6
                                            ? "Stable Context Certainty"
                                            : "Low Polarity Resolution"
                                    : "Run analysis to display neural metrics"}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col justify-center">
            <div className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">{label}</div>
            <div className="mt-1 font-mono text-xl text-white font-bold">{value}</div>
        </div>
    );
}
