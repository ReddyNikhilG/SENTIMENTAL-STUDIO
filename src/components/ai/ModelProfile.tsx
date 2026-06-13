import { motion } from "framer-motion";
import { BrainCircuit, Cpu, Zap, Activity, Info } from "lucide-react";
import { Tilt3DCard } from "./Tilt3DCard";

const CARDS = [
    {
        name: "VADER Analyzer",
        arch: "Rule-Based Lexicon",
        transformer: "None (Stateless Lexicons)",
        attention: "None (Grammar Modifiers)",
        parameters: "N/A",
        memory: "< 1 MB",
        accuracy: "Baseline Heuristic",
        bestUse: "Real-time feeds, short posts, social reviews",
        color: "oklch(0.72 0.2 240)", // blue
        desc: "Uses a rule-based engine mapping words to valence scores. Ideal for immediate processing on low-spec architectures."
    },
    {
        name: "DeBERTa-v3 Small",
        arch: "Encoder Transformer",
        transformer: "deberta-v3-xsmall-zeroshot",
        attention: "Disentangled Attention",
        parameters: "≈ 22 Million",
        memory: "≈ 142 MB",
        accuracy: "High Accuracy (~89.0%)",
        bestUse: "General sentiment, product reviews, mixed statements",
        color: "oklch(0.7 0.22 270)", // purple
        desc: "A highly optimized transformer balancing performance and speed. Excels at zero-shot context recognition."
    },
    {
        name: "DeBERTa-v3 Base",
        arch: "Encoder Transformer",
        transformer: "deberta-v3-base-zeroshot",
        attention: "Disentangled Attention",
        parameters: "≈ 86 Million",
        memory: "≈ 370 MB",
        accuracy: "Maximum (~92.4% SST-2)",
        bestUse: "Nuanced context, complex sentence structures, reports",
        color: "oklch(0.82 0.18 200)", // cyan
        desc: "Our flagship zero-shot model. Leverages state-of-the-art disentangled attention weight matrices for deep language semantics."
    }
];

export function ModelProfile() {
    return (
        <section id="technology" className="relative py-24">
            <div className="container mx-auto px-6">
                <div className="mb-12 text-center select-none">
                    <div className="mb-3 inline-flex rounded-full glass px-3 py-1 text-xs font-semibold text-muted-foreground border border-white/5">
                        Model Architecture
                    </div>
                    <h2 className="text-gradient text-3xl font-bold md:text-5xl font-display">Deep Classifier Profiles</h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        Inspect the memory size, parameter counts, and benchmarks of our active NLP sentiment engines.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {CARDS.map((c, i) => (
                        <Tilt3DCard key={c.name} intensity={6}>
                            <motion.div
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                className="group relative overflow-hidden rounded-3xl glass-strong p-6 border border-white/10 flex flex-col justify-between h-[520px] transition-all duration-300 hover:border-white/20"
                                style={{
                                    boxShadow: `0 15px 45px -10px rgba(0,0,0,0.6), 0 0 1px 1px ${c.color}15`
                                }}
                            >
                                {/* Active neon glow background hover circle */}
                                <div
                                    className="absolute -right-12 -top-12 size-36 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                                    style={{ background: `radial-gradient(circle, ${c.color}, transparent 70%)` }}
                                />

                                <div>
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div 
                                            className="size-10 rounded-xl border flex items-center justify-center"
                                            style={{ backgroundColor: `${c.color}15`, borderColor: `${c.color}35` }}
                                        >
                                            <BrainCircuit className="size-5" style={{ color: c.color }} />
                                        </div>
                                        <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground font-mono">
                                            Stage {i + 1}
                                        </span>
                                    </div>

                                    {/* Name & Desc */}
                                    <h4 className="text-xl font-bold text-white group-hover:text-primary transition duration-300">
                                        {c.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
                                        {c.desc}
                                    </p>
                                </div>

                                {/* Model Specifications */}
                                <div className="space-y-2.5 my-6 text-[11px] font-medium text-muted-foreground border-t border-b border-white/5 py-4">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><Cpu className="size-3 text-white/50" /> Architecture</span>
                                        <span className="text-white font-mono">{c.arch}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><Info className="size-3 text-white/50" /> Transformer</span>
                                        <span className="text-white font-mono text-right max-w-[160px] truncate">{c.transformer}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><Zap className="size-3 text-white/50" /> Attention</span>
                                        <span className="text-white font-mono">{c.attention}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><Activity className="size-3 text-white/50" /> Parameters</span>
                                        <span className="text-white font-mono">{c.parameters}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><Zap className="size-3 text-white/50" /> Memory Weight</span>
                                        <span className="text-white font-mono" style={{ color: c.color }}>{c.memory}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><Activity className="size-3 text-white/50" /> Expected Accuracy</span>
                                        <span className="text-white font-mono font-bold" style={{ color: c.color }}>{c.accuracy}</span>
                                    </div>
                                </div>

                                {/* Footer use cases */}
                                <div>
                                    <div className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-1 select-none">
                                        Optimized Use Case
                                    </div>
                                    <div className="text-xs text-white font-medium bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-center truncate">
                                        {c.bestUse}
                                    </div>
                                </div>

                            </motion.div>
                        </Tilt3DCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
