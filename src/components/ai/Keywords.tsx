import { motion, AnimatePresence } from "framer-motion";
import type { SentimentResult } from "@/lib/api";

const PLACEHOLDER_KEYWORDS = [
    { word: "intelligence", weight: 0.9 },
    { word: "sentiment", weight: 0.78 },
    { word: "analytics", weight: 0.65 },
    { word: "processing", weight: 0.55 },
    { word: "vector", weight: 0.45 },
    { word: "model", weight: 0.38 },
    { word: "nuance", weight: 0.3 },
];

function getColorForWeight(weight: number) {
    // Interpolate from muted blue to vibrant purple based on weight
    const hue = 240 + weight * 55; // 240 (blue) → 295 (purple)
    const chroma = 0.12 + weight * 0.15;
    const lightness = 0.65 + weight * 0.15;
    return `oklch(${lightness.toFixed(2)} ${chroma.toFixed(2)} ${hue.toFixed(0)})`;
}

export function Keywords({ result }: { result: SentimentResult | null }) {
    const keywords = result?.keywords?.length ? result.keywords : PLACEHOLDER_KEYWORDS;
    const isPlaceholder = !result?.keywords?.length;

    // Animate key changes on new result
    const animKey = result
        ? keywords.map((k) => k.word).join("-")
        : "placeholder";

    return (
        <div className="rounded-3xl glass p-6 border border-white/10 relative overflow-hidden h-[380px] shadow-card flex flex-col">
            <div className="mb-4 select-none shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-white">Keyword Focus</h3>
                    {isPlaceholder ? (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 border border-white/5 rounded-full px-2 py-0.5">
                            Awaiting input
                        </span>
                    ) : (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 rounded-full px-2 py-0.5">
                            {keywords.length} extracted
                        </span>
                    )}
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Semantic Density Weight</p>
            </div>

            {/* ✅ Fixed: tag cloud layout instead of absolute-positioned bubbles */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={animKey}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-wrap content-start gap-2 p-1"
                    >
                        {keywords.slice(0, 12).map((k, i) => {
                            const color = getColorForWeight(k.weight);
                            const fontSize = Math.max(0.68, Math.min(1.05, 0.68 + k.weight * 0.5));
                            const paddingX = Math.round(10 + k.weight * 8);

                            return (
                                <motion.div
                                    key={`${k.word}-${i}`}
                                    initial={{ opacity: 0, scale: 0.7, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: i * 0.05,
                                        type: "spring",
                                        stiffness: 120,
                                        damping: 14
                                    }}
                                    whileHover={{
                                        scale: 1.08,
                                        boxShadow: `0 0 20px ${color}55`,
                                        transition: { duration: 0.15 }
                                    }}
                                    className="relative cursor-default select-none rounded-full border transition-all duration-200"
                                    style={{
                                        fontSize: `${fontSize}rem`,
                                        paddingLeft: `${paddingX}px`,
                                        paddingRight: `${paddingX}px`,
                                        paddingTop: "5px",
                                        paddingBottom: "5px",
                                        background: `color-mix(in oklab, ${color} 12%, transparent)`,
                                        borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
                                        color,
                                        boxShadow: `0 0 12px ${color}20`,
                                        fontFamily: "var(--font-display)",
                                        fontWeight: 600,
                                    }}
                                    title={`Semantic weight: ${k.weight.toFixed(2)}`}
                                >
                                    {k.word}
                                    <span
                                        className="ml-1.5 font-mono"
                                        style={{ fontSize: "0.65rem", opacity: 0.6, fontWeight: 400 }}
                                    >
                                        {k.weight.toFixed(2)}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                {/* Fade mask at bottom to hint overflow */}
                <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                    style={{ background: "linear-gradient(to top, oklch(0.13 0.03 270 / 0.8), transparent)" }} />
            </div>

            <div className="text-[10px] text-muted-foreground text-center select-none pt-3 border-t border-white/5 font-mono shrink-0">
                Tag size & color intensity indicate relative semantic relevance
            </div>
        </div>
    );
}
