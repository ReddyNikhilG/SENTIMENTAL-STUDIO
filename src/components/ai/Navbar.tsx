import { motion, AnimatePresence } from "framer-motion";
import { Brain, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
    { id: "home", label: "Home" },
    { id: "features", label: "Features" },
    { id: "demo", label: "Demo" },
    { id: "analytics", label: "Analytics" },
    { id: "technology", label: "Technology" },
    { id: "about", label: "About" },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20);

            // Active section observer
            const scrollPos = window.scrollY + 120;
            for (const l of links) {
                const el = document.getElementById(l.id);
                if (el) {
                    const top = el.offsetTop;
                    const height = el.offsetHeight;
                    if (scrollPos >= top && scrollPos < top + height) {
                        setActiveSection(l.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Prevent body scroll when mobile menu open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    const handleNavClick = (id: string) => {
        setMobileOpen(false);
        setTimeout(() => {
            const el = document.getElementById(id);
            el?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    return (
        <>
            <motion.nav
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`fixed left-1/2 top-4 z-50 -translate-x-1/2 transition-all duration-500 ${
                    scrolled ? "w-[min(920px,92vw)]" : "w-[min(1080px,94vw)]"
                }`}
            >
                <div
                    className="glass-strong flex items-center justify-between rounded-full px-3 py-2 border border-white/10 transition-all duration-500"
                    style={{
                        boxShadow: scrolled
                            ? "0 10px 30px -10px rgba(0,0,0,0.5), 0 0 15px 1px oklch(0.7 0.22 270 / 0.15)"
                            : "var(--shadow-card)"
                    }}
                >
                    <a href="#home" className="flex items-center gap-2 pl-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-primary/40 blur-md transition group-hover:scale-110" />
                            <Brain className="relative size-6 text-primary transition-transform duration-500 group-hover:rotate-[360deg]" />
                        </div>
                        <span className="font-display text-base font-semibold tracking-tight text-white group-hover:text-primary transition">
                            Sentiment Studio
                        </span>
                    </a>

                    {/* Desktop nav links */}
                    <div className="hidden items-center gap-1 md:flex">
                        {links.map((l) => {
                            const isActive = l.id === activeSection;
                            return (
                                <a
                                    key={l.id}
                                    href={`#${l.id}`}
                                    className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-300 ${
                                        isActive ? "text-white" : "text-muted-foreground hover:text-white"
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active-capsule"
                                            className="absolute inset-0 -z-10 rounded-full bg-white/5 border border-white/10 shadow-[0_0_12px_oklch(0.7_0.22_270_/_0.1)]"
                                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                        />
                                    )}
                                    {l.label}
                                </a>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href="#demo"
                            className="hidden md:inline-flex rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_oklch(0.7_0.22_270_/_0.5)]"
                            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                        >
                            Try Demo
                        </a>

                        {/* Mobile hamburger button */}
                        <button
                            onClick={() => setMobileOpen((v) => !v)}
                            className="md:hidden flex items-center justify-center size-9 rounded-full glass border border-white/10 transition hover:bg-white/10"
                            aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {mobileOpen ? (
                                    <motion.div
                                        key="x"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <X className="size-4 text-white" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Menu className="size-4 text-white" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile full-screen menu overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-40 md:hidden"
                        style={{
                            background: "oklch(0.06 0.02 270 / 0.97)",
                            backdropFilter: "blur(28px)",
                        }}
                        onClick={() => setMobileOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: 0.05 }}
                            className="flex flex-col items-center justify-center h-full gap-3 px-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-2 mb-8">
                                <Brain className="size-7 text-primary" />
                                <span className="font-display text-xl font-semibold text-white">Sentiment Studio</span>
                            </div>

                            {links.map((l, i) => (
                                <motion.button
                                    key={l.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 + i * 0.06, duration: 0.3 }}
                                    onClick={() => handleNavClick(l.id)}
                                    className={`w-full max-w-xs rounded-2xl px-6 py-4 text-center text-lg font-semibold transition-all duration-200 ${
                                        activeSection === l.id
                                            ? "bg-primary/15 text-white border border-primary/30"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                                    }`}
                                >
                                    {l.label}
                                </motion.button>
                            ))}

                            <motion.a
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 + links.length * 0.06, duration: 0.3 }}
                                href="#demo"
                                onClick={() => setMobileOpen(false)}
                                className="mt-6 w-full max-w-xs rounded-2xl px-6 py-4 text-center text-lg font-bold text-primary-foreground transition-all hover:scale-[1.02]"
                                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                            >
                                Try Demo
                            </motion.a>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
