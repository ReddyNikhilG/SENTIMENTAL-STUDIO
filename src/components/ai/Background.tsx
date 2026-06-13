import { useEffect, useRef } from "react";

export function Background() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        // Resize handler
        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        // 1. Particle definitions (floating neon spheres)
        const particlesCount = 35;
        const particles: Array<{
            x: number;
            y: number;
            r: number;
            vx: number;
            vy: number;
            color: string;
            alpha: number;
        }> = [];

        const colors = [
            "oklch(0.7 0.22 270)", // primary neon purple
            "oklch(0.72 0.2 240)", // neon blue
            "oklch(0.82 0.18 200)", // neon cyan
        ];

        for (let i = 0; i < particlesCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 6 + 2,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                color: colors[i % colors.length],
                alpha: Math.random() * 0.35 + 0.15,
            });
        }

        // 2. Binary rain definitions
        const fontSize = 11;
        const columns = Math.floor(width / 32);
        const drops: number[] = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100; // start offset above screen
        }

        // 3. Twinkling stars definitions
        const starsCount = 80;
        const stars: Array<{
            x: number;
            y: number;
            r: number;
            twinkleSpeed: number;
            phase: number;
        }> = [];

        for (let i = 0; i < starsCount; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 1.2 + 0.4,
                twinkleSpeed: 0.01 + Math.random() * 0.02,
                phase: Math.random() * Math.PI * 2,
            });
        }

        // Animation Loop
        const draw = () => {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Draw deep background gradient
            ctx.fillStyle = "oklch(0.08 0.02 270)";
            ctx.fillRect(0, 0, width, height);

            // Volumetric ambient light beams (linear gradients)
            const time = Date.now() * 0.0002;
            const gradient1 = ctx.createRadialGradient(
                width * (0.5 + Math.sin(time) * 0.25),
                0,
                0,
                width * 0.5,
                0,
                width * 0.6
            );
            gradient1.addColorStop(0, "oklch(0.7 0.22 270 / 0.07)");
            gradient1.addColorStop(0.5, "oklch(0.72 0.2 240 / 0.03)");
            gradient1.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = gradient1;
            ctx.fillRect(0, 0, width, height);

            const gradient2 = ctx.createRadialGradient(
                width * (0.2 + Math.cos(time * 0.8) * 0.15),
                height,
                0,
                width * 0.3,
                height,
                width * 0.5
            );
            gradient2.addColorStop(0, "oklch(0.82 0.18 200 / 0.05)");
            gradient2.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = gradient2;
            ctx.fillRect(0, 0, width, height);

            // 1. Draw Twinkling Stars
            stars.forEach((s) => {
                s.phase += s.twinkleSpeed;
                const alpha = 0.2 + Math.sin(s.phase) * 0.5 + 0.3; // oscillate transparency
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();
            });

            // 2. Draw Subtle Falling Binary Rain
            ctx.fillStyle = "oklch(0.82 0.18 200 / 0.025)"; // extremely faint cyan matrix code
            ctx.font = `${fontSize}px var(--font-mono)`;
            for (let i = 0; i < drops.length; i++) {
                const text = Math.random() > 0.5 ? "1" : "0";
                const x = i * 32 + 8;
                const y = drops[i] * fontSize;

                if (y > 0 && y < height + 50) {
                    ctx.fillText(text, x, y);
                }

                // increment and wrap
                drops[i] += 0.15; // slow drip
                if (drops[i] * fontSize > height && Math.random() > 0.985) {
                    drops[i] = 0;
                }
            }

            // 3. Draw Floating Particles with connecting neon threads
            particles.forEach((p) => {
                // Move particle
                p.x += p.vx;
                p.y += p.vy;

                // Wrap screen edges
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;
                if (p.y < -10) p.y = height + 10;
                if (p.y > height + 10) p.y = -10;

                // Render particle circle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                ctx.fill();
                ctx.shadowBlur = 0; // reset
                ctx.globalAlpha = 1.0; // reset
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-background">
            <canvas ref={canvasRef} className="absolute inset-0 size-full" />
            
            {/* Subtle grid backdrop for depth */}
            <div 
                className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                style={{
                    backgroundImage: `linear-gradient(to right, oklch(0.7 0.22 270) 1px, transparent 1px),
                                      linear-gradient(to bottom, oklch(0.7 0.22 270) 1px, transparent 1px)`,
                    backgroundSize: "6rem 6rem"
                }}
            />
        </div>
    );
}
