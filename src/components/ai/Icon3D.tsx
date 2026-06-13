import { motion } from "framer-motion";
import { BrainCircuit, ShieldCheck, Network, Compass, Sparkles, TrendingUp } from "lucide-react";
import { ClientOnly } from "./ClientOnly";

type Shape = "brain" | "ring" | "octa" | "knot" | "wobble" | "shield";

const SHAPE_CONFIG = {
    brain: {
        icon: BrainCircuit,
        color: "oklch(0.7 0.22 270)",       // neon purple
    },
    ring: {
        icon: Compass,
        color: "oklch(0.78 0.2 155)",       // positive green
    },
    octa: {
        icon: TrendingUp,
        color: "oklch(0.82 0.18 200)",      // neon cyan
    },
    knot: {
        icon: Network,
        color: "oklch(0.72 0.2 240)",       // neon blue
    },
    wobble: {
        icon: Sparkles,
        color: "oklch(0.7 0.2 340)",        // pink
    },
    shield: {
        icon: ShieldCheck,
        color: "oklch(0.65 0.22 285)",      // deep purple/indigo
    },
};

export function Icon3D({ shape }: { shape: Shape }) {
    const config = SHAPE_CONFIG[shape] || SHAPE_CONFIG.brain;
    const IconComponent = config.icon;

    return (
        <ClientOnly fallback={<div className="size-full animate-pulse rounded-2xl bg-primary/10" />}>
            <motion.div
                className="relative size-full flex items-center justify-center select-none overflow-visible"
                animate={{ y: [-3, 3, -3] }}
                transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut",
                }}
            >
                {/* Neon Glow Backdrop */}
                <div
                    className="absolute size-16 rounded-full blur-2xl opacity-25 transition-all duration-500 group-hover:opacity-50 group-hover:scale-125 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`,
                    }}
                />

                {/* 3D Orbit Ring 1 (Dashed) */}
                <motion.div
                    className="absolute size-20 rounded-full border border-dashed opacity-35 pointer-events-none transition-all duration-500 group-hover:opacity-60 group-hover:scale-110"
                    style={{
                        borderColor: config.color,
                        rotateX: 70,
                        rotateY: 15,
                    }}
                    animate={{ rotateZ: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 10,
                        ease: "linear",
                    }}
                />

                {/* 3D Orbit Ring 2 (Solid/Double) */}
                <motion.div
                    className="absolute size-24 rounded-full border border-double opacity-15 pointer-events-none transition-all duration-500 group-hover:opacity-35 group-hover:scale-105"
                    style={{
                        borderColor: config.color,
                        rotateX: 60,
                        rotateY: -25,
                    }}
                    animate={{ rotateZ: -360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 15,
                        ease: "linear",
                    }}
                />

                {/* Orbiting particle indicators */}
                <motion.div
                    className="absolute size-2 rounded-full pointer-events-none"
                    style={{
                        backgroundColor: config.color,
                        boxShadow: `0 0 10px ${config.color}`,
                        x: 0,
                        y: 0,
                    }}
                    animate={{
                        x: [36, 0, -36, 0, 36],
                        y: [0, 12, 0, -12, 0],
                        zIndex: [0, 10, 0, -10, 0],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 5,
                        ease: "easeInOut",
                    }}
                />

                {/* Icon Container with Glassmorphism */}
                <div
                    className="relative size-16 rounded-2xl flex items-center justify-center border transition-all duration-500 backdrop-blur-md bg-white/5 border-white/10 group-hover:border-white/20 group-hover:bg-white/10 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    style={{
                        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.15)",
                    }}
                >
                    <IconComponent
                        className="size-8 transition-all duration-500 group-hover:scale-110"
                        style={{
                            color: config.color,
                            filter: `drop-shadow(0 0 8px ${config.color})`,
                        }}
                    />
                </div>
            </motion.div>
        </ClientOnly>
    );
}
