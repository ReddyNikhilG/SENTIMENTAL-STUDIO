import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Points, PointMaterial, Stars, Icosahedron, MeshDistortMaterial, Trail, Sphere } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

/* ---------- helpers ---------- */
function useMouse() {
    const [m, setM] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const on = (e: MouseEvent) => setM({ x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 });
        window.addEventListener("mousemove", on);
        return () => window.removeEventListener("mousemove", on);
    }, []);
    return m;
}

function useScrollProgress() {
    const [p, setP] = useState(0);
    useEffect(() => {
        const on = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            setP(h > 0 ? window.scrollY / h : 0);
        };
        on();
        window.addEventListener("scroll", on, { passive: true });
        return () => window.removeEventListener("scroll", on);
    }, []);
    return p;
}

/* ---------- atoms ---------- */
function GalaxyParticles({ count = 1500 }: { count?: number }) {
    const ref = useRef<THREE.Points>(null);
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < arr.length; i += 3) {
            const r = 6 + Math.random() * 18;
            const t = Math.random() * Math.PI * 2;
            const p = Math.acos(2 * Math.random() - 1);
            arr[i] = r * Math.sin(p) * Math.cos(t);
            arr[i + 1] = r * Math.sin(p) * Math.sin(t) * 0.6;
            arr[i + 2] = r * Math.cos(p);
        }
        return arr;
    }, [count]);
    useFrame((_, dt) => {
        if (ref.current) {
            ref.current.rotation.y += dt * 0.03;
            ref.current.rotation.x += dt * 0.008;
        }
    });
    return (
        <Points ref={ref} positions={positions} stride={3}>
            <PointMaterial transparent color="#a78bfa" size={0.04} sizeAttenuation depthWrite={false} opacity={0.7} />
        </Points>
    );
}

function NeuralNet({ count = 28, radius = 2.2 }: { count?: number; radius?: number }) {
    const group = useRef<THREE.Group>(null);
    const { nodes, segments } = useMemo(() => {
        const ns: THREE.Vector3[] = [];
        for (let i = 0; i < count; i++) {
            const r = radius * (0.85 + Math.random() * 0.3);
            const t = Math.random() * Math.PI * 2;
            const p = Math.acos(2 * Math.random() - 1);
            ns.push(new THREE.Vector3(r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), r * Math.cos(p)));
        }
        const segs: [THREE.Vector3, THREE.Vector3, number][] = [];
        for (let i = 0; i < ns.length; i++) {
            for (let j = i + 1; j < ns.length; j++) {
                const d = ns[i].distanceTo(ns[j]);
                if (d < radius * 0.9) segs.push([ns[i], ns[j], d]);
            }
        }
        return { nodes: ns, segments: segs };
    }, [count, radius]);

    useFrame((_, dt) => { if (group.current) group.current.rotation.y += dt * 0.18; });

    return (
        <group ref={group}>
            {nodes.map((n, i) => (
                <mesh key={`n-${i}`} position={n}>
                    <sphereGeometry args={[0.04, 12, 12]} />
                    <meshBasicMaterial color={i % 3 === 0 ? "#60a5fa" : i % 3 === 1 ? "#a78bfa" : "#22d3ee"} />
                </mesh>
            ))}
            {segments.map(([a, b], i) => {
                const geom = new THREE.BufferGeometry().setFromPoints([a, b]);
                const mat = new THREE.LineBasicMaterial({
                    color: i % 2 ? "#8b5cf6" : "#3b82f6",
                    transparent: true,
                    opacity: 0.25,
                });
                return <primitive key={`l-${i}`} object={new THREE.Line(geom, mat)} />;
            })}
        </group>
    );
}

/* Animated data orbs that follow circular paths around the brain */
function DataOrbs() {
    const orbits = useMemo(
        () =>
            Array.from({ length: 6 }, (_, i) => ({
                r: 2.6 + i * 0.25,
                speed: 0.4 + i * 0.15,
                offset: Math.random() * Math.PI * 2,
                tilt: Math.random() * Math.PI,
                color: ["#60a5fa", "#a78bfa", "#22d3ee", "#f472b6", "#8b5cf6", "#3b82f6"][i % 6],
            })),
        [],
    );
    const refs = useRef<(THREE.Mesh | null)[]>([]);
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        orbits.forEach((o, i) => {
            const m = refs.current[i];
            if (!m) return;
            const a = t * o.speed + o.offset;
            const x = Math.cos(a) * o.r;
            const z = Math.sin(a) * o.r;
            m.position.set(x, Math.sin(a + o.tilt) * 0.4, z);
        });
    });
    return (
        <>
            {orbits.map((o, i) => (
                <Trail key={i} width={0.6} length={6} color={o.color} attenuation={(w) => w * w}>
                    <mesh ref={(el) => { refs.current[i] = el; }}>
                        <sphereGeometry args={[0.06, 16, 16]} />
                        <meshBasicMaterial color={o.color} />
                    </mesh>
                </Trail>
            ))}
        </>
    );
}

/* Holographic brain with multiple layers */
function HoloBrain() {
    const inner = useRef<THREE.Mesh>(null);
    const outer = useRef<THREE.Mesh>(null);
    useFrame((_, dt) => {
        if (inner.current) inner.current.rotation.y += dt * 0.4;
        if (outer.current) {
            outer.current.rotation.y -= dt * 0.15;
            outer.current.rotation.x += dt * 0.08;
        }
    });
    return (
        <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.5}>
            {/* core */}
            <Sphere ref={inner} args={[1.1, 96, 96]}>
                <MeshDistortMaterial
                    color="#7c3aed"
                    emissive="#4c1d95"
                    emissiveIntensity={0.7}
                    distort={0.55}
                    speed={2.2}
                    roughness={0.15}
                    metalness={0.85}
                />
            </Sphere>
            {/* wireframe shell */}
            <Icosahedron ref={outer} args={[1.55, 3]}>
                <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.35} />
            </Icosahedron>
            {/* glow sphere */}
            <Sphere args={[1.8, 32, 32]}>
                <meshBasicMaterial color="#8b5cf6" transparent opacity={0.05} side={THREE.BackSide} />
            </Sphere>
        </Float>
    );
}

function RotatingRing({ radius, tilt, color, speed }: { radius: number; tilt: [number, number, number]; color: string; speed: number }) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * speed; });
    return (
        <mesh ref={ref} rotation={tilt}>
            <torusGeometry args={[radius, 0.012, 16, 200]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
    );
}

/* ---------- the full scene ---------- */
function Scene() {
    const root = useRef<THREE.Group>(null);
    const cam = useRef<THREE.Group>(null);
    const mouse = useMouse();
    const scroll = useScrollProgress();

    useFrame(() => {
        if (root.current) {
            root.current.rotation.y += (mouse.x * 0.45 - root.current.rotation.y) * 0.04;
            root.current.rotation.x += (mouse.y * 0.25 - root.current.rotation.x) * 0.04;
        }
        if (cam.current) {
            // Scroll-driven parallax: drift the whole rig back/up as user scrolls
            cam.current.position.x = mouse.x * 0.4;
            cam.current.position.y = -scroll * 4 + mouse.y * 0.3;
            cam.current.position.z = scroll * 6;
            cam.current.rotation.x = -scroll * 0.35;
        }
    });

    return (
        <group ref={cam}>
            <ambientLight intensity={0.25} />
            <pointLight position={[6, 6, 6]} intensity={2} color="#8b5cf6" />
            <pointLight position={[-6, -4, -6]} intensity={1.3} color="#3b82f6" />
            <pointLight position={[0, -4, 6]} intensity={0.8} color="#22d3ee" />

            <Stars radius={60} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />

            <group ref={root}>
                <HoloBrain />
                <NeuralNet />
                <DataOrbs />
                <RotatingRing radius={2.3} tilt={[Math.PI / 2.2, 0, 0]} color="#a78bfa" speed={0.4} />
                <RotatingRing radius={2.6} tilt={[Math.PI / 3, Math.PI / 4, 0]} color="#60a5fa" speed={-0.3} />
                <RotatingRing radius={2.9} tilt={[Math.PI / 2.5, -Math.PI / 6, 0]} color="#22d3ee" speed={0.25} />
                <GalaxyParticles />
            </group>
        </group>
    );
}

export function SceneBackground() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10">
            <Canvas
                camera={{ position: [0, 0, 6], fov: 55 }}
                dpr={[1, 1.6]}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
                <Scene />
            </Canvas>
        </div>
    );
}
