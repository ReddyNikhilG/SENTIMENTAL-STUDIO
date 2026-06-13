import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Icosahedron, Line, Html, Points, PointMaterial } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect, Component, type ReactNode } from "react";
import * as THREE from "three";
import { ClientOnly } from "./ClientOnly";

const MODEL_SPECS = {
    "VADER": {
        name: "VADER Analyzer",
        arch: "Rule-Based Lexicon",
        accuracy: "Baseline",
        speed: "Extremely Fast (< 1ms)",
        memory: "< 1 MB",
        bestUse: "Social media, short reviews, real-time streams",
        desc: "A highly optimized, lexicon-based engine utilizing grammatical rules and intensity modifiers."
    },
    "DeBERTa Small": {
        name: "DeBERTa-v3 Small",
        arch: "12-Layer Transformer (~22M params)",
        accuracy: "High Accuracy (~89.0%)",
        speed: "Fast (~30ms)",
        memory: "~142 MB",
        bestUse: "Mixed text reviews, product feedback",
        desc: "An efficient zero-shot classification transformer with disentangled attention mechanisms."
    },
    "DeBERTa Base": {
        name: "DeBERTa-v3 Base",
        arch: "12-Layer Transformer (~86M params)",
        accuracy: "Maximum (~92.4% SST-2)",
        speed: "Balanced (~120ms)",
        memory: "~370 MB",
        bestUse: "Complex prose, deep context, high-nuance extraction",
        desc: "A flagship zero-shot transformer delivering maximum linguistic nuance and semantic resolution."
    }
};

/* Orbiting model node inside the 3D scene */
interface ModelNodeProps {
    modelName: keyof typeof MODEL_SPECS;
    radius: number;
    speed: number;
    tiltX: number;
    tiltY: number;
    color: string;
    isSelected: boolean;
    onSelect: () => void;
}

function ModelNode({ modelName, radius, speed, tiltX, tiltY, color, isSelected, onSelect }: ModelNodeProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const lineRef = useRef<THREE.Line>(null);
    const [hovered, setHovered] = useState(false);
    const specs = MODEL_SPECS[modelName];

    // Node position calculation
    const [pos, setPos] = useState<[number, number, number]>([radius, 0, 0]);

    useFrame((state) => {
        const t = state.clock.elapsedTime * speed;
        // Calculate coordinates in the tilted orbital plane
        const rawX = Math.cos(t) * radius;
        const rawZ = Math.sin(t) * radius;
        const rawY = Math.sin(t * 1.5) * 0.3; // subtle wave

        // Apply tilts manually
        const temp = new THREE.Vector3(rawX, rawY, rawZ);
        temp.applyAxisAngle(new THREE.Vector3(1, 0, 0), tiltX);
        temp.applyAxisAngle(new THREE.Vector3(0, 1, 0), tiltY);

        setPos([temp.x, temp.y, temp.z]);

        if (meshRef.current) {
            meshRef.current.position.set(temp.x, temp.y, temp.z);
            // Spin the node mesh itself
            meshRef.current.rotation.y += 0.02;
        }
    });

    return (
        <group>
            {/* Pulsing connection line to brain center */}
            <Line
                points={[[0, 0, 0], pos]}
                color={hovered || isSelected ? color : "#8b5cf6"}
                lineWidth={hovered || isSelected ? 3 : 1}
                transparent
                opacity={hovered || isSelected ? 0.8 : 0.35}
            />

            {/* Orbit path ring visualizer */}
            <mesh rotation={[tiltX, tiltY, 0]}>
                <torusGeometry args={[radius, 0.006, 8, 120]} />
                <meshBasicMaterial color="#a78bfa" transparent opacity={0.08} />
            </mesh>

            {/* Orbiting mesh */}
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.style.cursor = "default";
                }}
                scale={isSelected ? 1.4 : hovered ? 1.25 : 1}
            >
                <icosahedronGeometry args={[0.22, 1]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isSelected ? 1.6 : hovered ? 1.1 : 0.4}
                    roughness={0.1}
                    metalness={0.9}
                    flatShading
                />

                {/* Ambient glow sphere around node */}
                <mesh scale={1.5}>
                    <sphereGeometry args={[0.22, 16, 16]} />
                    <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.18 : hovered ? 0.12 : 0.03} />
                </mesh>

                {/* Holographic Tooltip on Hover */}
                {hovered && (
                    <Html distanceFactor={6} position={[0.4, 0.4, 0]} style={{ pointerEvents: "none" }}>
                        <div className="glass-strong border border-white/20 p-4 rounded-2xl w-72 text-white text-xs leading-relaxed animate-fade-in shadow-2xl backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-display font-bold text-sm text-white">{specs.name}</span>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}33`, color }}>
                                    {specs.accuracy}
                                </span>
                            </div>
                            <div className="space-y-1 text-muted-foreground border-b border-white/10 pb-2 mb-2">
                                <div><strong className="text-white">Arch:</strong> {specs.arch}</div>
                                <div><strong className="text-white">Speed:</strong> {specs.speed}</div>
                                <div><strong className="text-white">Weight:</strong> {specs.memory}</div>
                                <div><strong className="text-white">Best Use:</strong> {specs.bestUse}</div>
                            </div>
                            <p className="text-[11px] leading-relaxed italic text-white/80">{specs.desc}</p>
                        </div>
                    </Html>
                )}
            </mesh>
        </group>
    );
}

/* Traveling energy particles flowing from nodes to the core */
function EnergyStream({ color, active }: { color: string; active: boolean }) {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 12;

    const [positions, setPositions] = useState<Float32Array>(() => new Float32Array(count * 3));
    const [progress, setProgress] = useState<number[]>(() => Array.from({ length: count }, (_, i) => -i / count));

    useFrame((_, dt) => {
        if (!active) return;
        const newPositions = new Float32Array(count * 3);
        const newProgress = [...progress];

        for (let i = 0; i < count; i++) {
            newProgress[i] += dt * 0.9;
            if (newProgress[i] > 1) {
                newProgress[i] = 0;
            }

            const activeProgress = Math.max(0, newProgress[i]);
            // linear flow to center (0,0,0)
            // assuming starting point is calculated or constant for stream representation
            const startDist = 2.5;
            const curDist = startDist * (1 - activeProgress);
            const angle = (i * Math.PI * 2) / count;

            newPositions[i * 3] = Math.cos(angle) * curDist;
            newPositions[i * 3 + 1] = Math.sin(angle) * 0.1 * curDist;
            newPositions[i * 3 + 2] = Math.sin(angle) * curDist;
        }

        setProgress(newProgress);
        setPositions(newPositions);
    });

    if (!active) return null;

    return (
        <Points ref={pointsRef} positions={positions} stride={3}>
            <PointMaterial color={color} size={0.08} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
        </Points>
    );
}

/* Holographic brain structure */
function BrainCore({ mouse, isFlashing }: { mouse: { x: number; y: number }; isFlashing: boolean }) {
    const coreRef = useRef<THREE.Mesh>(null);
    const outerRef = useRef<THREE.Mesh>(null);
    const distortRef = useRef<any>(null);

    useFrame((state, dt) => {
        const time = state.clock.getElapsedTime();
        if (coreRef.current) {
            coreRef.current.rotation.y += dt * 0.28;
            coreRef.current.rotation.x += (mouse.y * 0.35 - coreRef.current.rotation.x) * 0.06;
        }
        if (outerRef.current) {
            outerRef.current.rotation.y -= dt * 0.12;
            outerRef.current.rotation.z += dt * 0.05;
        }
        if (distortRef.current) {
            // Distort speed increases during flash/energy absorption
            distortRef.current.distort = isFlashing 
                ? 0.75 + Math.sin(time * 12) * 0.15 
                : 0.4 + Math.sin(time * 2) * 0.1;
        }
    });

    return (
        <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
            {/* Core distorted plasma brain sphere */}
            <Sphere ref={coreRef} args={[1.0, 64, 64]}>
                <MeshDistortMaterial
                    ref={distortRef}
                    color={isFlashing ? "#22d3ee" : "#7c3aed"}
                    emissive={isFlashing ? "#0ea5e9" : "#4c1d95"}
                    emissiveIntensity={isFlashing ? 1.8 : 0.65}
                    distort={0.45}
                    speed={2}
                    roughness={0.15}
                    metalness={0.8}
                />
            </Sphere>

            {/* Wireframe holographic overlay */}
            <Icosahedron ref={outerRef} args={[1.35, 3]}>
                <meshBasicMaterial 
                    color={isFlashing ? "#a78bfa" : "#22d3ee"} 
                    wireframe 
                    transparent 
                    opacity={isFlashing ? 0.65 : 0.3} 
                />
            </Icosahedron>

            {/* Volumetric outer glow ring */}
            <Sphere args={[1.5, 32, 32]}>
                <meshBasicMaterial 
                    color={isFlashing ? "#22d3ee" : "#8b5cf6"} 
                    transparent 
                    opacity={isFlashing ? 0.15 : 0.05} 
                    side={THREE.BackSide} 
                />
            </Sphere>
        </Float>
    );
}

/* Floating dust particle background */
function SpaceDust({ count = 250 }) {
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < arr.length; i += 3) {
            arr[i] = (Math.random() - 0.5) * 12;
            arr[i + 1] = (Math.random() - 0.5) * 12;
            arr[i + 2] = (Math.random() - 0.5) * 12;
        }
        return arr;
    }, [count]);

    const ref = useRef<THREE.Points>(null);
    useFrame((_, dt) => {
        if (ref.current) {
            ref.current.rotation.y += dt * 0.015;
            ref.current.rotation.x += dt * 0.005;
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3}>
            <PointMaterial transparent color="#22d3ee" size={0.03} sizeAttenuation depthWrite={false} opacity={0.6} />
        </Points>
    );
}

function Scene({ selectedModel, onSelectModel }: { selectedModel: string; onSelectModel: (m: string) => void }) {
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [isFlashing, setIsFlashing] = useState(false);
    const [pulsingStream, setPulsingStream] = useState<string | null>(null);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            setMouse({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: (e.clientY / window.innerHeight) * 2 - 1
            });
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    const handleSelectNode = (model: string) => {
        onSelectModel(model);
        setPulsingStream(model);
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 900);
        setTimeout(() => setPulsingStream(null), 1200);
    };

    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[6, 6, 6]} intensity={1.8} color="#8b5cf6" />
            <pointLight position={[-6, -4, -6]} intensity={1.2} color="#3b82f6" />
            <pointLight position={[0, -5, 6]} intensity={0.6} color="#22d3ee" />

            <BrainCore mouse={mouse} isFlashing={isFlashing} />
            
            {/* Floating Space Dust */}
            <SpaceDust />

            {/* VADER Model Orbit */}
            <ModelNode
                modelName="VADER"
                radius={2.1}
                speed={0.4}
                tiltX={Math.PI / 6}
                tiltY={Math.PI / 8}
                color="#60a5fa"
                isSelected={selectedModel === "VADER"}
                onSelect={() => handleSelectNode("VADER")}
            />

            {/* DeBERTa Small Model Orbit */}
            <ModelNode
                modelName="DeBERTa Small"
                radius={2.6}
                speed={0.28}
                tiltX={-Math.PI / 5}
                tiltY={Math.PI / 4}
                color="#a78bfa"
                isSelected={selectedModel === "DeBERTa Small"}
                onSelect={() => handleSelectNode("DeBERTa Small")}
            />

            {/* DeBERTa Base Model Orbit */}
            <ModelNode
                modelName="DeBERTa Base"
                radius={3.1}
                speed={0.18}
                tiltX={Math.PI / 4}
                tiltY={-Math.PI / 6}
                color="#22d3ee"
                isSelected={selectedModel === "DeBERTa Base"}
                onSelect={() => handleSelectNode("DeBERTa Base")}
            />

            {/* Energy Stream animation */}
            <EnergyStream color={selectedModel === "VADER" ? "#60a5fa" : selectedModel === "DeBERTa Small" ? "#a78bfa" : "#22d3ee"} active={!!pulsingStream} />
        </>
    );
}

// Error boundary to catch WebGL / Three.js crashes
class WebGLErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            // Beautiful CSS fallback that matches the design theme instead of a white box
            return (
                <div className="relative size-full flex items-center justify-center select-none overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-64 rounded-full opacity-60 animate-pulse" style={{
                            background: "radial-gradient(circle at 40% 40%, oklch(0.7 0.22 270 / 0.8), oklch(0.72 0.2 240 / 0.3) 50%, transparent 70%)",
                            boxShadow: "0 0 80px 30px oklch(0.7 0.22 270 / 0.25)",
                            filter: "blur(2px)"
                        }} />
                        <div className="absolute size-40 rounded-full border border-white/10" style={{
                            background: "radial-gradient(circle, oklch(0.72 0.2 240 / 0.15), transparent)",
                            animation: "spin 8s linear infinite"
                        }} />
                        <div className="absolute size-60 rounded-full border border-dashed border-white/5" style={{
                            animation: "spin 20s linear infinite reverse"
                        }} />
                    </div>
                    <div className="relative z-10 text-center">
                        <div className="text-5xl mb-3">🧠</div>
                        <div className="text-white/80 font-display font-bold text-lg">Neural Core</div>
                        <div className="text-white/40 text-xs mt-1">Enable hardware acceleration for 3D</div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export function HeroBrain() {
    const [selectedModel, setSelectedModel] = useState("VADER");

    useEffect(() => {
        // Sync model selection changes from outside (e.g. dropdown)
        const handleModelChange = (e: Event) => {
            const ce = e as CustomEvent;
            if (ce.detail) setSelectedModel(ce.detail);
        };
        window.addEventListener("model-changed", handleModelChange);
        return () => window.removeEventListener("model-changed", handleModelChange);
    }, []);

    const handleSelectModel = (model: string) => {
        setSelectedModel(model);
        // Sync choice to outside (e.g. dropdown in LiveAnalysis)
        window.dispatchEvent(new CustomEvent("model-changed", { detail: model }));
    };

    return (
        <ClientOnly fallback={
            <div className="relative size-full flex items-center justify-center">
                <div className="size-64 rounded-full opacity-60 animate-pulse" style={{
                    background: "radial-gradient(circle at 40% 40%, oklch(0.7 0.22 270 / 0.8), oklch(0.72 0.2 240 / 0.3) 50%, transparent 70%)",
                    boxShadow: "0 0 80px 30px oklch(0.7 0.22 270 / 0.25)"
                }} />
            </div>
        }>
            <WebGLErrorBoundary>
                {/* Dark bg wrapper — if WebGL context is lost the canvas renders white, this prevents that */}
                <div className="relative size-full" style={{ background: "oklch(0.06 0.02 270 / 0)" }}>
                    <Canvas
                        camera={{ position: [0, 0, 4.6], fov: 50 }}
                        dpr={[1, 1.5]}
                        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
                        style={{ background: "transparent", display: "block" }}
                        onCreated={({ gl }) => {
                            gl.setClearColor(0x000000, 0);
                        }}
                    >
                        <Scene selectedModel={selectedModel} onSelectModel={handleSelectModel} />
                    </Canvas>
                </div>
            </WebGLErrorBoundary>
        </ClientOnly>
    );
}
