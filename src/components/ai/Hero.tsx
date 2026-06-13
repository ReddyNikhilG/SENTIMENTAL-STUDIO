import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Github } from "lucide-react";
import { HeroBrain } from "./HeroBrain";

export function Hero() {
    return (
        <section id="home" className="relative flex min-h-screen items-center justify-center overflow-hidden pt-28 pb-16">
            <div className="container relative mx-auto px-6">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
                    
                    {/* Left text column */}
                    <div className="lg:col-span-6 text-left flex flex-col justify-center space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex self-start items-center gap-2 rounded-full glass-strong px-4 py-1.5 text-xs font-semibold text-muted-foreground border border-white/10"
                        >
                            <span className="size-1.5 animate-pulse rounded-full bg-positive" />
                            Multi-Model AI Sentiment Intelligence
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="text-gradient font-display text-5xl font-bold leading-[1.05] tracking-tighter md:text-7xl lg:text-[5.5rem]"
                            style={{ filter: "drop-shadow(0 0 35px oklch(0.7 0.22 270 / 0.35))" }}
                        >
                            Sentiment<br />Studio
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.25 }}
                            className="text-base text-muted-foreground md:text-lg max-w-xl leading-relaxed"
                        >
                            Enterprise-grade AI platform for intelligent sentiment analysis, PDF understanding, and emotional insight extraction. Orbiting models are clickable to toggle the prediction engine.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-wrap items-center gap-3 pt-4"
                        >
                            <a
                                href="#demo"
                                className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-primary-foreground transition hover:scale-105 hover:shadow-[0_0_25px_oklch(0.7_0.22_270_/_0.55)]"
                                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                            >
                                Analyze Text
                                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                            </a>
                            <a
                                href="#analytics"
                                className="inline-flex items-center gap-2 rounded-full glass-strong px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
                            >
                                <BarChart3 className="size-4" />
                                Explore Analytics
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full glass-strong px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
                            >
                                <Github className="size-4" />
                                GitHub
                            </a>
                        </motion.div>
                    </div>
                    
                    {/* Right column: Interactive 3D Holographic Scene */}
                    <div className="lg:col-span-6 h-[480px] sm:h-[520px] lg:h-[600px] w-full flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-transparent blur-3xl rounded-full" />
                        <HeroBrain />
                    </div>
                    
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground hidden lg:block"
            >
                <div className="flex flex-col items-center gap-2">
                    <span>Scroll to explore</span>
                    <motion.div
                        animate={{ scaleY: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-8 w-[1px] origin-top bg-gradient-to-b from-primary to-transparent"
                    />
                </div>
            </motion.div>
        </section>
    );
}
