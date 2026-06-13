import { motion } from "framer-motion";
import { Tilt3DCard } from "./Tilt3DCard";
import { Icon3D } from "./Icon3D";

const features = [
    { shape: "brain" as const, title: "Real-Time Sentiment Analysis", desc: "Instant polarity, confidence and emotional tone scoring." },
    { shape: "shield" as const, title: "PDF Intelligence", desc: "Extract and analyze text from any PDF document." },
    { shape: "knot" as const, title: "DeBERTa Transformer", desc: "State-of-the-art zero-shot language model." },
    { shape: "ring" as const, title: "Confidence Estimation", desc: "Per-prediction probability calibration." },
    { shape: "wobble" as const, title: "Keyword Extraction", desc: "Surface signal words driving the model's decision." },
    { shape: "octa" as const, title: "Trend Analytics", desc: "Track sentiment shifts across time windows." },
    { shape: "ring" as const, title: "History Tracking", desc: "Persistent timeline of every analysis run." },
    { shape: "octa" as const, title: "CSV Export", desc: "One-click structured data export." },
    { shape: "shield" as const, title: "Report Generation", desc: "Beautifully formatted insight reports." },
];

export function Features() {
    return (
        <section id="features" className="relative py-32">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-gradient text-4xl font-bold md:text-5xl">Everything you need</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                        Nine production-grade capabilities packed into one cohesive AI workflow.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.06 }}
                        >
                            <Tilt3DCard className="group relative h-full overflow-hidden rounded-3xl glass-strong p-6 shadow-card">
                                <div
                                    className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
                                    style={{ background: "radial-gradient(circle, var(--neon-purple), transparent 70%)" }}
                                />
                                <div className="relative" style={{ transform: "translateZ(40px)" }}>
                                    <div className="mb-4 h-28 w-28">
                                        <Icon3D shape={f.shape} />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                                </div>
                                <div
                                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
                                    style={{ background: "linear-gradient(90deg, transparent, var(--neon-purple), transparent)" }}
                                />
                            </Tilt3DCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
