import { motion, AnimatePresence } from "framer-motion";
import type { SentimentResult } from "@/lib/api";
import { useState } from "react";

const COLOR: Record<string, string> = {
    Positive: "oklch(0.78 0.2 155)",  // green
    Negative: "oklch(0.7 0.25 25)",   // red
    Neutral: "oklch(0.72 0.2 240)",    // cyan/blue
};

const SHADOW: Record<string, string> = {
    Positive: "0 0 20px oklch(0.78 0.2 155 / 0.6)",
    Negative: "0 0 20px oklch(0.7 0.25 25 / 0.6)",
    Neutral: "0 0 20px oklch(0.72 0.2 240 / 0.6)",
};

export function ModelOutput({ result }: { result: SentimentResult | null }) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const data =
        result?.scores ||
        [
            { label: "Positive", value: 0.33 },
            { label: "Negative", value: 0.33 },
            { label: "Neutral", value: 0.34 },
        ];

    // ✅ Bug fix: include result data in key so bars re-animate on every new result
    const animKey = result
        ? `${result.sentiment}-${result.confidence.toFixed(4)}`
        : "default";

    return (
        <div className="rounded-3xl glass p-6 border border-white/10 shadow-card flex flex-col justify-between h-[380px]">
            <div>
                <div className="flex items-center justify-between mb-1 select-none">
                    <h3 className="font-display text-lg font-bold text-white">Softmax Distribution</h3>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Model Outputs</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6 select-none leading-relaxed">
                    Output probability distribution extracted from the classification logits layer.
                </p>
            </div>

            <div className="space-y-6 flex-1 flex flex-col justify-center">
                {/* ✅ Key on the whole list container forces re-mount & re-animation on new results */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={animKey}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {data.map((d, i) => {
                            const color = COLOR[d.label] || "oklch(0.7 0.22 270)";
                            const shadow = SHADOW[d.label] || "0 0 15px rgba(139, 92, 246, 0.4)";
                            const isHovered = hoveredIdx === i;

                            return (
                                <div
                                    key={d.label}
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                    className="relative group cursor-help transition-all duration-300 rounded-xl p-2 -mx-2 hover:bg-white/[0.03] border border-transparent hover:border-white/5"
                                >
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="font-semibold text-white/90 flex items-center gap-2">
                                            <span className="size-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                                            {d.label}
                                        </span>
                                        <span className="font-mono font-bold" style={{ color }}>
                                            {(d.value * 100).toFixed(1)}%
                                        </span>
                                    </div>

                                    {/* Visual Progress Track */}
                                    <div className="relative h-4 rounded-full bg-white/[0.04] border border-white/5 overflow-hidden">
                                        {/* ✅ Bug fix: key on this motion.div forces fresh animation each result */}
                                        <motion.div
                                            key={`${animKey}-${d.label}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${d.value * 100}%` }}
                                            transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                                            className="absolute inset-y-0 left-0 rounded-full"
                                            style={{
                                                background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 70%, white))`,
                                                boxShadow: isHovered ? shadow : `0 0 8px ${color}`,
                                            }}
                                        />

                                        {/* Shimmer overlay */}
                                        <motion.div
                                            animate={{ x: ["-100%", "200%"] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none skew-x-12"
                                        />
                                    </div>

                                    {/* Floating Neon Tooltip */}
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] text-white/90 shadow-xl z-10 pointer-events-none font-mono whitespace-nowrap"
                                        >
                                            Value: <span className="font-bold text-white">{d.value.toFixed(4)}</span> | Weight Class: <span className="font-bold" style={{ color }}>{d.label}</span>
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="text-[10px] text-muted-foreground text-center select-none pt-2 border-t border-white/5 font-mono">
                Logits values are normalized through a softmax function · Total: {data.reduce((s, d) => s + d.value, 0).toFixed(2)}
            </div>
        </div>
    );
}
