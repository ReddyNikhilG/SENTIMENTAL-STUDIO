import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Download, FileBarChart, Search, ArrowUpDown, Trash2, AlertTriangle } from "lucide-react";
import { api, type HistoryItem } from "@/lib/api";
import { toast } from "sonner";

type SortKey = "date" | "sentiment" | "score" | "confidence";

export function HistoryTable() {
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [q, setQ] = useState("");
    const [sort, setSort] = useState<SortKey>("date");
    const [dir, setDir] = useState<"asc" | "desc">("desc");
    const [confirmClear, setConfirmClear] = useState(false);

    useEffect(() => {
        const fetchHistory = () => { api.history().then(setItems); };
        fetchHistory();
        window.addEventListener("sentiment-analyzed", fetchHistory);
        return () => window.removeEventListener("sentiment-analyzed", fetchHistory);
    }, []);

    const rows = useMemo(() => {
        const filtered = items.filter((x) =>
            x.text.toLowerCase().includes(q.toLowerCase()) || x.sentiment.toLowerCase().includes(q.toLowerCase()),
        );
        return [...filtered].sort((a, b) => {
            const av = a[sort] as string | number;
            const bv = b[sort] as string | number;
            const cmp = av < bv ? -1 : av > bv ? 1 : 0;
            return dir === "asc" ? cmp : -cmp;
        });
    }, [items, q, sort, dir]);

    const toggleSort = (k: SortKey) => {
        if (k === sort) setDir(dir === "asc" ? "desc" : "asc");
        else { setSort(k); setDir("desc"); }
    };

    const color = (s: string) => {
        const k = s?.toLowerCase();
        if (k === "positive") return "oklch(0.78 0.2 155)";
        if (k === "negative") return "oklch(0.7 0.25 25)";
        return "oklch(0.72 0.2 240)";
    };

    const handleClearHistory = async () => {
        try {
            await fetch(`${api.base}/history/clear`, { method: "DELETE" });
            setItems([]);
            setConfirmClear(false);
            toast.success("History cleared successfully");
        } catch {
            // If endpoint not available, just clear the UI
            setItems([]);
            setConfirmClear(false);
            toast.info("History cleared from view");
        }
    };

    return (
        <section id="about" className="relative py-24 select-none">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="mb-8 flex flex-wrap items-end justify-between gap-6"
                >
                    <div>
                        <div className="mb-3 inline-flex rounded-full glass px-3 py-1 text-xs font-semibold text-muted-foreground border border-white/5">
                            Data Archival
                        </div>
                        <h2 className="text-gradient text-4xl font-bold md:text-5xl font-display">Recent Analyses</h2>
                        <p className="mt-2 text-muted-foreground">Every processed model inference, recorded and structured.</p>
                    </div>

                    {/* Glowing Download Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <a
                            href={api.csvUrl}
                            className="inline-flex items-center gap-2 rounded-full glass border border-white/10 px-5 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-[0_0_15px_oklch(0.72_0.2_240_/_0.2)]"
                        >
                            <Download className="size-3.5 text-primary" /> Download CSV
                        </a>
                        <a
                            href={api.reportUrl}
                            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_oklch(0.7_0.22_270_/_0.5)]"
                            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                        >
                            <FileBarChart className="size-3.5" /> Download Report
                        </a>

                        {/* Clear history with confirmation */}
                        <AnimatePresence mode="wait">
                            {confirmClear ? (
                                <motion.div
                                    key="confirm"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center gap-2 rounded-full glass border border-red-500/30 px-4 py-2.5"
                                >
                                    <AlertTriangle className="size-3.5 text-red-400" />
                                    <span className="text-xs text-red-300 font-semibold">Clear all?</span>
                                    <button
                                        onClick={handleClearHistory}
                                        className="text-xs font-bold text-red-400 hover:text-red-300 transition ml-1"
                                    >
                                        Yes
                                    </button>
                                    <button
                                        onClick={() => setConfirmClear(false)}
                                        className="text-xs font-bold text-muted-foreground hover:text-white transition"
                                    >
                                        No
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="trash"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => setConfirmClear(true)}
                                    className="inline-flex items-center gap-2 rounded-full glass border border-white/10 px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-all duration-300 hover:text-red-400 hover:border-red-500/30 hover:bg-red-950/20"
                                >
                                    <Trash2 className="size-3.5" /> Clear
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="overflow-hidden rounded-3xl glass-strong border border-white/10 shadow-card backdrop-blur-xl"
                >
                    {/* Glowing Search Bar */}
                    <div className="flex items-center gap-3 border-b border-white/10 p-4 bg-black/20 group">
                        <Search className="size-4 text-muted-foreground group-focus-within:text-primary transition" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search predictions by content keywords or sentiment types..."
                            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60 text-white focus:outline-none"
                        />
                        <span className="text-xs font-mono text-muted-foreground font-semibold bg-white/5 border border-white/5 rounded-md px-2 py-0.5">
                            {rows.length} logs
                        </span>
                    </div>

                    <div className="overflow-x-auto max-h-[480px]">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-neutral-950/90 border-b border-white/10 z-10 select-none">
                                <tr className="text-left text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                    {[
                                        { k: "date" as const, label: "Timestamp" },
                                        { k: "sentiment" as const, label: "Sentiment" },
                                        { k: "score" as const, label: "Score" },
                                        { k: "confidence" as const, label: "Certainty" },
                                    ].map((c) => {
                                        const isSorted = sort === c.k;
                                        return (
                                            <th
                                                key={c.k}
                                                onClick={() => toggleSort(c.k)}
                                                className="cursor-pointer px-5 py-4 font-bold hover:text-white transition"
                                            >
                                                <span className="inline-flex items-center gap-1.5">
                                                    {c.label}
                                                    <ArrowUpDown
                                                        className={`size-3 transition ${isSorted ? "text-primary opacity-100 scale-105" : "opacity-40"}`}
                                                    />
                                                </span>
                                            </th>
                                        );
                                    })}
                                    <th className="px-5 py-4 font-bold">Engine</th>
                                    <th className="px-5 py-4 font-bold">Input Text Snippet</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* ✅ Bug fix: AnimatePresence children must be direct motion elements */}
                                <AnimatePresence initial={false}>
                                    {rows.map((r, i) => {
                                        const sentimentColor = color(r.sentiment);
                                        return (
                                            <motion.tr
                                                key={r.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10, height: 0 }}
                                                transition={{ delay: Math.min(6, i) * 0.04 }}
                                                className="border-t border-white/5 transition duration-200 hover:bg-white/[0.03]"
                                            >
                                                {/* Timestamp */}
                                                <td className="whitespace-nowrap px-5 py-3.5 text-xs font-mono text-muted-foreground">
                                                    {new Date(r.date).toLocaleString(undefined, {
                                                        month: "short",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </td>
                                                {/* Sentiment Badge */}
                                                <td className="px-5 py-3.5">
                                                    <span
                                                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider select-none"
                                                        style={{
                                                            background: `color-mix(in oklab, ${sentimentColor} 14%, transparent)`,
                                                            color: sentimentColor,
                                                            border: `1px solid color-mix(in oklab, ${sentimentColor} 25%, transparent)`,
                                                            boxShadow: `0 0 10px ${sentimentColor}10`
                                                        }}
                                                    >
                                                        <span className="text-xs">{r.emoji}</span> {r.sentiment}
                                                    </span>
                                                </td>
                                                {/* Score */}
                                                <td className="px-5 py-3.5 font-mono text-xs font-bold text-white/95">
                                                    {r.score.toFixed(3)}
                                                </td>
                                                {/* Confidence */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-500"
                                                                style={{
                                                                    width: `${r.confidence * 100}%`,
                                                                    background: sentimentColor
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="font-mono text-xs font-bold" style={{ color: sentimentColor }}>
                                                            {(r.confidence * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* Engine */}
                                                <td className="px-5 py-3.5">
                                                    <span className="text-[9px] font-mono font-bold text-muted-foreground/70 bg-white/5 border border-white/5 rounded-md px-2 py-0.5 whitespace-nowrap">
                                                        {(r as any).engine || "VADER"}
                                                    </span>
                                                </td>
                                                {/* Text snippet */}
                                                <td className="max-w-xs px-5 py-3.5 text-xs text-muted-foreground/80 truncate">
                                                    {r.text}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>

                                {/* ✅ Bug fix: empty state is a regular tr, not inside AnimatePresence */}
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground select-none font-medium">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="size-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                                                    <Search className="size-5 text-muted-foreground/50" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white/60">No analyses found</div>
                                                    <div className="text-xs mt-1 text-muted-foreground/60">
                                                        {q ? "Try a different search term" : "Run your first analysis above to see results here"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
