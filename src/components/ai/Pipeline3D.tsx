import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { ClientOnly } from "./ClientOnly";

const STEPS = [
    "Input",
    "Cleaning",
    "Tokenization",
    "Embedding",
    "VADER or DeBERTa",
    "Classification",
    "Confidence",
    "Result"
];

const COLORS = [
    "#60a5fa", // Input
    "#a78bfa", // Cleaning
    "#22d3ee", // Tokenization
    "#8b5cf6", // Embedding
    "#f472b6", // VADER / DeBERTa
    "#3b82f6", // Classification
    "#06b6d4", // Confidence
    "#10b981"  // Result
];

function PipelineNode({ position, label, index, activeStep }: { position: [number, number, number]; label: string; index: number; activeStep: number | null }) {
    const ref = useRef<THREE.Mesh>(null);
    const isActive = activeStep === index;

    useFrame((s) => {
        if (ref.current) {
            // Spin faster if active
            const speed = isActive ? 1.5 : 0.4;
            ref.current.rotation.y = s.clock.elapsedTime * speed + index;
            ref.current.rotation.x = Math.sin(s.clock.elapsedTime + index) * 0.15;
        }
    });

    const color = COLORS[index % COLORS.length];

    return (
        <Float speed={isActive ? 2.5 : 1.2} rotationIntensity={isActive ? 0.6 : 0.25} floatIntensity={isActive ? 0.7 : 0.3}>
            <group position={position}>
                {/* Core Node shape */}
                <mesh ref={ref} scale={isActive ? 1.4 : 1.0}>
                    <octahedronGeometry args={[0.42, 0]} />
                    <meshStandardMaterial 
                        color={color} 
                        emissive={color} 
                        emissiveIntensity={isActive ? 2.5 : 0.5} 
                        metalness={0.9} 
                        roughness={0.15} 
                        flatShading 
                    />
                </mesh>

                {/* Outer halo aura sphere */}
                <mesh scale={isActive ? 1.6 : 1.15}>
                    <sphereGeometry args={[0.62, 24, 24]} />
                    <meshBasicMaterial 
                        color={color} 
                        transparent 
                        opacity={isActive ? 0.22 : 0.04} 
                    />
                </mesh>

                {/* Label text rendered in DOM space — avoids CDN font loading */}
                <Html
                    position={[0, -1.1, 0]}
                    center
                    style={{ pointerEvents: "none" }}
                    distanceFactor={8}
                >
                    <div style={{
                        color: isActive ? "#ffffff" : "#94a3b8",
                        fontSize: "11px",
                        fontWeight: isActive ? 700 : 500,
                        fontFamily: "var(--font-sans, sans-serif)",
                        whiteSpace: "nowrap",
                        textShadow: isActive ? `0 0 10px ${COLORS[index % COLORS.length]}` : "none",
                        transition: "all 0.3s",
                        userSelect: "none",
                    }}>
                        {label}
                    </div>
                </Html>
            </group>
        </Float>
    );
}

function FlowingParticles({ from, to, color, offset, isActiveStep }: { from: THREE.Vector3; to: THREE.Vector3; color: string; offset: number; isActiveStep: boolean }) {
    const ref = useRef<THREE.Mesh>(null);
    
    useFrame((s) => {
        if (!ref.current) return;
        // Speed up particles if this is the active flowing pipeline stage
        const speedFactor = isActiveStep ? 1.8 : 0.55;
        const t = ((s.clock.elapsedTime * speedFactor + offset) % 1);
        
        ref.current.position.lerpVectors(from, to, t);
        const mat = ref.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.sin(t * Math.PI) * (isActiveStep ? 0.95 : 0.45);
    });

    return (
        <mesh ref={ref} scale={isActiveStep ? 1.45 : 1.0}>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshBasicMaterial color={color} transparent />
        </mesh>
    );
}

function PipelineScene({ activeStep }: { activeStep: number | null }) {
    const spacing = 2.0;
    const start = -((STEPS.length - 1) * spacing) / 2;
    
    const positions = useMemo(
        () => STEPS.map((_, i) => new THREE.Vector3(start + i * spacing, 0, 0)),
        [start]
    );

    return (
        <>
            <ambientLight intensity={0.45} />
            <pointLight position={[0, 4, 4]} intensity={1.8} color="#8b5cf6" />
            <pointLight position={[0, -3, 4]} intensity={1.1} color="#22d3ee" />

            {/* Central connection support beam */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.008, 0.008, (STEPS.length - 1) * spacing + 1.2, 12]} />
                <meshBasicMaterial color="#a78bfa" transparent opacity={0.15} />
            </mesh>

            {/* Render Stage Nodes */}
            {positions.map((p, i) => (
                <PipelineNode 
                    key={i} 
                    position={[p.x, p.y, p.z]} 
                    label={STEPS[i]} 
                    index={i} 
                    activeStep={activeStep}
                />
            ))}

            {/* Render Flowing Particles along steps */}
            {positions.slice(0, -1).map((p, i) => {
                const isActiveStep = activeStep === i;
                const flowColor = COLORS[i % COLORS.length];

                return (
                    <group key={`flow-${i}`}>
                        {[0, 0.33, 0.66].map((off, k) => (
                            <FlowingParticles
                                key={k}
                                from={p}
                                to={positions[i + 1]}
                                color={flowColor}
                                offset={off + i * 0.15}
                                isActiveStep={isActiveStep}
                            />
                        ))}
                    </group>
                );
            })}
        </>
    );
}

export function Pipeline3D() {
    const [activeStep, setActiveStep] = useState<number | null>(null);

    useEffect(() => {
        // Start animation listener
        const handleStart = () => {
            setActiveStep(0);
        };
        // Step progress listener
        const handleStep = (e: Event) => {
            const ce = e as CustomEvent;
            if (ce.detail !== undefined) {
                setActiveStep(ce.detail);
            }
        };
        // Completion listener
        const handleComplete = () => {
            setActiveStep(null);
        };

        window.addEventListener("nlp-pipeline-start", handleStart);
        window.addEventListener("nlp-pipeline-step", handleStep);
        window.addEventListener("nlp-pipeline-complete", handleComplete);

        return () => {
            window.removeEventListener("nlp-pipeline-start", handleStart);
            window.removeEventListener("nlp-pipeline-step", handleStep);
            window.removeEventListener("nlp-pipeline-complete", handleComplete);
        };
    }, []);

    return (
        <section id="pipeline" className="relative py-24">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-10 text-center"
                >
                    <div className="mb-3 inline-flex rounded-full glass px-3 py-1 text-xs font-semibold text-muted-foreground border border-white/5">
                        Interactive NLP Pipeline
                    </div>
                    <h2 className="text-gradient text-3xl font-bold md:text-5xl font-display">From Text to Emotional Insight</h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        Observe the lexical tokenization, projection vector embeddings, and semantic transformer attention stages in real-time.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative mx-auto h-[360px] max-w-7xl overflow-hidden rounded-3xl glass-strong border border-white/10 shadow-card"
                >
                    <ClientOnly fallback={<div className="size-full animate-pulse bg-primary/10 rounded-3xl" />}>
                        {/* Dark bg wrapper ensures no white shows if WebGL context is lost */}
                        <div className="absolute inset-0" style={{ background: "oklch(0.10 0.02 270)" }}>
                            <Canvas 
                                camera={{ position: [0, 0.4, 8], fov: 45 }} 
                                dpr={[1, 1.5]} 
                                gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
                                style={{ background: "transparent", display: "block" }}
                                onCreated={({ gl }) => {
                                    gl.setClearColor(0x000000, 0);
                                }}
                            >
                                <PipelineScene activeStep={activeStep} />
                            </Canvas>
                        </div>
                    </ClientOnly>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
                </motion.div>
            </div>
        </section>
    );
}
