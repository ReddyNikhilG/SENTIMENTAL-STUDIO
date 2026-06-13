import { motion } from "framer-motion";
import { FileInput, FileText, Wand2, BrainCircuit, Target, Gauge, BarChart3 } from "lucide-react";

const STEPS = [
    { icon: FileInput, label: "Input" },
    { icon: FileText, label: "PDF Extraction" },
    { icon: Wand2, label: "Text Cleaning" },
    { icon: BrainCircuit, label: "DeBERTa" },
    { icon: Target, label: "Prediction" },
    { icon: Gauge, label: "Confidence" },
    { icon: BarChart3, label: "Visualization" },
];

export function Pipeline() {
    return (
        <section className="relative py-24">
            <div className="container mx-auto px-6">
                <div className="mb-10 text-center">
                    <h2 className="text-gradient text-3xl font-bold md:text-4xl">The pipeline</h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        Every analysis flows through seven precision stages.
                    </p>
                </div>

                <div className="relative mx-auto max-w-6xl rounded-3xl glass-strong p-6 md:p-10">
                    {/* Flowing particles bar */}
                    <div className="relative mb-8 h-1.5 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                            className="absolute inset-y-0 w-1/3 rounded-full"
                            style={{ background: "linear-gradient(90deg, transparent, var(--neon-purple), var(--neon-blue), transparent)" }}
                            animate={{ x: ["-100%", "300%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-7 md:gap-2">
                        {STEPS.map((s, i) => (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -4 }}
                                className="group relative flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-4 text-center transition hover:bg-white/10"
                            >
                                <div
                                    className="flex size-12 items-center justify-center rounded-xl"
                                    style={{ background: "var(--gradient-primary)", boxShadow: "0 0 16px oklch(0.7 0.22 270 / 0.5)" }}
                                >
                                    <s.icon className="size-5 text-primary-foreground" />
                                </div>
                                <div className="text-xs font-medium">{s.label}</div>
                                {i < STEPS.length - 1 && (
                                    <div className="absolute right-0 top-1/2 hidden h-[1px] w-4 -translate-y-1/2 translate-x-1/2 bg-gradient-to-r from-primary/50 to-transparent md:block" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
