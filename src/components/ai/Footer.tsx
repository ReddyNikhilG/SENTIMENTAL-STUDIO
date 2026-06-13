import { Brain, Github, Twitter, Linkedin, Mail, ExternalLink } from "lucide-react";

const TECH_STACK = [
    { label: "DeBERTa-v3", href: "https://huggingface.co/MoritzLaurer" },
    { label: "VADER NLP", href: "https://github.com/cjhutto/vaderSentiment" },
    { label: "FastAPI", href: "https://fastapi.tiangolo.com" },
    { label: "React 19", href: "https://react.dev" },
    { label: "Framer Motion", href: "https://www.framer.com/motion" },
];

const LINKS = [
    {
        group: "Platform",
        items: [
            { label: "Live Demo", href: "#demo" },
            { label: "Analytics", href: "#analytics" },
            { label: "PDF Analysis", href: "#pdf" },
            { label: "Technology", href: "#technology" },
        ],
    },
    {
        group: "Features",
        items: [
            { label: "VADER Sentiment", href: "#demo" },
            { label: "DeBERTa Small", href: "#demo" },
            { label: "DeBERTa Base", href: "#demo" },
            { label: "CSV Export", href: "#about" },
        ],
    },
];

export function Footer() {
    return (
        <footer className="relative border-t border-white/5 mt-8">
            {/* Gradient top glow line */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
                style={{ background: "linear-gradient(90deg, transparent, oklch(0.7 0.22 270 / 0.4), oklch(0.72 0.2 230 / 0.4), transparent)" }}
            />

            <div className="container mx-auto px-6 pt-16 pb-8">
                {/* Main footer grid */}
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
                    {/* Brand column */}
                    <div className="lg:col-span-2">
                        <a href="#home" className="inline-flex items-center gap-2.5 group mb-4">
                            <div className="relative size-9 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition" />
                                <Brain className="relative size-5 text-primary" />
                            </div>
                            <span className="font-display text-xl font-bold text-white group-hover:text-primary transition">
                                Sentiment Studio
                            </span>
                        </a>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
                            Enterprise-grade AI platform for intelligent sentiment analysis,
                            PDF understanding, and emotional insight extraction — powered by
                            state-of-the-art transformer models.
                        </p>

                        {/* Social links */}
                        <div className="flex items-center gap-3">
                            {[
                                { icon: Github, href: "https://github.com", label: "GitHub" },
                                { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                                { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
                                { icon: Mail, href: "mailto:hello@sentiment.studio", label: "Email" },
                            ].map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={label}
                                    className="size-9 flex items-center justify-center rounded-full glass border border-white/10 text-muted-foreground transition-all duration-200 hover:text-white hover:border-white/20 hover:bg-white/10 hover:scale-110"
                                >
                                    <Icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation groups */}
                    {LINKS.map((group) => (
                        <div key={group.group}>
                            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-4">
                                {group.group}
                            </div>
                            <ul className="space-y-2.5">
                                {group.items.map((item) => (
                                    <li key={item.label}>
                                        <a
                                            href={item.href}
                                            className="text-sm text-muted-foreground hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                                        >
                                            <span className="size-1 rounded-full bg-primary/40 group-hover:bg-primary transition" />
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Tech stack badges */}
                <div className="border-t border-white/5 pt-8 mb-6">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3">
                        Built with
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {TECH_STACK.map((t) => (
                            <a
                                key={t.label}
                                href={t.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full glass border border-white/8 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-white hover:border-white/15 hover:bg-white/5 transition-all duration-200"
                            >
                                {t.label}
                                <ExternalLink className="size-2.5 opacity-50" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/5 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} Sentiment Studio · Enterprise AI Platform
                    </p>
                    <div className="flex items-center gap-1.5">
                        <span className="size-1.5 animate-pulse rounded-full bg-positive" />
                        <span className="font-mono">All systems operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
