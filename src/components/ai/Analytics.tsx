import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, type TrendPoint } from "@/lib/api";
import { Tilt3DCard } from "./Tilt3DCard";
import { TrendingUp, Activity } from "lucide-react";

const COLORS = {
    positive: "oklch(0.78 0.2 155)",
    negative: "oklch(0.7 0.25 25)",
    neutral: "oklch(0.72 0.2 240)",
};

export function Analytics() {
    const [data, setData] = useState<TrendPoint[]>([]);
    const [totals, setTotals] = useState({ positive: 0, negative: 0, neutral: 0 });
    const [isMounted, setIsMounted] = useState(false);
    const [activeChart, setActiveChart] = useState<"trend" | "distribution">("trend");

    useEffect(() => {
        const fetchAnalytics = () => {
            api.analytics().then((a) => { setData(a.trend); setTotals(a.totals); });
        };
        fetchAnalytics();
        setIsMounted(true);
        window.addEventListener("sentiment-analyzed", fetchAnalytics);
        return () => window.removeEventListener("sentiment-analyzed", fetchAnalytics);
    }, []);

    const totalCount = totals.positive + totals.negative + totals.neutral;
    const pieData = [
        { name: "Positive", value: totals.positive, color: COLORS.positive },
        { name: "Negative", value: totals.negative, color: COLORS.negative },
        { name: "Neutral", value: totals.neutral, color: COLORS.neutral },
    ];

    return (
        <section id="analytics" className="relative py-32">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="mb-12 text-center select-none"
                >
                    <div className="mb-3 inline-flex rounded-full glass px-3 py-1 text-xs font-semibold text-muted-foreground border border-white/5">
                        Historical Analytics
                    </div>
                    <h2 className="text-gradient text-4xl font-bold md:text-5xl font-display">Aggregate Sentiment Trends</h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        Real-time neural feedback curves compiled across all computed interactions.
                    </p>
                </motion.div>

                {/* ✅ Fixed: Proper labels instead of "Neural passes recorded" */}
                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 mb-10">
                    <Tilt3DCard intensity={8}>
                        <StatCard
                            label="Positive Analyses"
                            value={totals.positive}
                            total={totalCount}
                            color={COLORS.positive}
                            emoji="😊"
                        />
                    </Tilt3DCard>
                    <Tilt3DCard intensity={8}>
                        <StatCard
                            label="Negative Analyses"
                            value={totals.negative}
                            total={totalCount}
                            color={COLORS.negative}
                            emoji="😡"
                        />
                    </Tilt3DCard>
                    <Tilt3DCard intensity={8}>
                        <StatCard
                            label="Neutral Analyses"
                            value={totals.neutral}
                            total={totalCount}
                            color={COLORS.neutral}
                            emoji="😐"
                        />
                    </Tilt3DCard>
                </div>

                {/* Immersive Chart Card with tab toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="mx-auto max-w-6xl rounded-3xl glass-strong border border-white/10 p-6 shadow-card"
                >
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 select-none">
                        <div>
                            <h3 className="font-display text-lg font-bold text-white">
                                {activeChart === "trend" ? "Sentiment Trend Over Time" : "Overall Distribution"}
                            </h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                                {activeChart === "trend" ? "Last 14 Days" : `${totalCount} Total Analyses`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Chart toggle */}
                            <div className="flex items-center gap-1 rounded-full glass border border-white/10 p-1">
                                <button
                                    onClick={() => setActiveChart("trend")}
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                        activeChart === "trend"
                                            ? "bg-primary/20 text-primary border border-primary/30"
                                            : "text-muted-foreground hover:text-white"
                                    }`}
                                >
                                    <TrendingUp className="size-3" /> Trend
                                </button>
                                <button
                                    onClick={() => setActiveChart("distribution")}
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                        activeChart === "distribution"
                                            ? "bg-primary/20 text-primary border border-primary/30"
                                            : "text-muted-foreground hover:text-white"
                                    }`}
                                >
                                    <Activity className="size-3" /> Distribution
                                </button>
                            </div>
                            <div className="flex gap-4 text-xs font-semibold text-muted-foreground">
                                <Legend color={COLORS.positive} label="Positive" />
                                <Legend color={COLORS.negative} label="Negative" />
                                <Legend color={COLORS.neutral} label="Neutral" />
                            </div>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        {isMounted && activeChart === "trend" && (
                            <ResponsiveContainer>
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gpos" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={COLORS.positive} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={COLORS.positive} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gneg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={COLORS.negative} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={COLORS.negative} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gneu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={COLORS.neutral} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={COLORS.neutral} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="oklch(1 0 0 / 0.04)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "var(--font-mono)" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "var(--font-mono)" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "rgba(10, 10, 10, 0.85)",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            borderRadius: "16px",
                                            backdropFilter: "blur(20px)",
                                            boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
                                        }}
                                        labelStyle={{ color: "#ffffff", fontWeight: "bold", fontFamily: "var(--font-mono)" }}
                                    />
                                    <Area type="monotone" dataKey="positive" stroke={COLORS.positive} strokeWidth={2.5} fill="url(#gpos)" activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: COLORS.positive }} isAnimationActive animationDuration={1500} />
                                    <Area type="monotone" dataKey="negative" stroke={COLORS.negative} strokeWidth={2.5} fill="url(#gneg)" activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: COLORS.negative }} isAnimationActive animationDuration={1500} />
                                    <Area type="monotone" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={2.5} fill="url(#gneu)" activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: COLORS.neutral }} isAnimationActive animationDuration={1500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}

                        {/* ✅ Distribution pie chart view */}
                        {isMounted && activeChart === "distribution" && (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={130}
                                        paddingAngle={4}
                                        dataKey="value"
                                        isAnimationActive
                                        animationDuration={1000}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: "rgba(10, 10, 10, 0.85)",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            borderRadius: "16px",
                                            backdropFilter: "blur(20px)",
                                            boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
                                        }}
                                        labelStyle={{ color: "#ffffff", fontWeight: "bold" }}
                                        formatter={(value: number, name: string) => [
                                            `${value} (${totalCount > 0 ? ((value / totalCount) * 100).toFixed(1) : 0}%)`,
                                            name
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function StatCard({ label, value, total, color, emoji }: { label: string; value: number; total: number; color: string; emoji: string }) {
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
    return (
        <div
            className="relative overflow-hidden rounded-3xl glass-strong p-6 border border-white/10 select-none group w-full h-[160px] flex flex-col justify-between"
            style={{ boxShadow: `0 10px 40px -10px rgba(0,0,0,0.5), 0 0 1px 1px ${color}10` }}
        >
            <div
                className="absolute -right-10 -top-10 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
                style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
            />
            <div className="relative flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{label}</div>
                    <span className="text-lg">{emoji}</span>
                </div>
                <div className="flex items-end gap-2">
                    <div className="font-display text-5xl font-black transition-transform duration-300 group-hover:scale-105" style={{ color }}>
                        {value}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1.5 font-mono">{pct}%</div>
                </div>
                {/* Mini progress bar */}
                <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                    />
                </div>
            </div>
        </div>
    );
}

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-2 select-none">
            <span className="size-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
            {label}
        </span>
    );
}
