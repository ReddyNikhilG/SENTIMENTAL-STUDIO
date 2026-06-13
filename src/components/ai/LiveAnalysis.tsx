import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Sparkles, Eraser, ThumbsUp, Loader2, Cpu } from "lucide-react";
import { api, type SentimentResult } from "@/lib/api";
import { ResultPanel } from "./ResultPanel";
import { ModelOutput } from "./ModelOutput";
import { Keywords } from "./Keywords";
import { toast } from "sonner";

const SAMPLES = [
    { label: "Product review (positive)", text: "Absolutely love this product. The build quality is excellent and customer support was amazing!" },
    { label: "Service complaint (negative)", text: "Terrible experience. The service was slow, the staff was rude, and the product arrived broken." },
    { label: "Neutral statement", text: "The quarterly meeting is scheduled for Tuesday at 3pm in conference room B." },
    { label: "Mixed feedback", text: "The interface looks beautiful but the performance is disappointing during heavy usage." },
];

const POSITIVE_SAMPLE = "I'm thrilled with the results — this exceeded every expectation we had!";

const PIPELINE_STAGES = [
    { name: "Data Acquisition", desc: "Ingesting text sequence into memory buffers..." },
    { name: "Lexical Normalization", desc: "Cleaning punctuations, adjusting casings, and filtering stop words..." },
    { name: "Tokenization", desc: "Segmenting sentences into input token identifiers..." },
    { name: "Vector Embedding", desc: "Mapping token IDs into high-dimensional semantic spaces..." },
    { name: "Attention Encoders", desc: "Propagating self-attention weights through deep layers..." },
    { name: "Logit Classification", desc: "Computing sentiment category classification scores..." },
    { name: "Softmax Distribution", desc: "Calculating model confidence values from output logits..." },
    { name: "Vector Visualization", desc: "Structuring metrics, token weights, and graph outputs..." }
];

export function LiveAnalysis() {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [result, setResult] = useState<SentimentResult | null>(null);
    const [model, setModel] = useState("VADER");
    const [sampleKey, setSampleKey] = useState(0); // reset dropdown key on clear

    // Track whether prediction has resolved so animation loop knows when to stop
    const predictionDone = useRef(false);

    // Sync model choice with the 3D Hero scene
    useEffect(() => {
        const handleModelChange = (e: Event) => {
            const ce = e as CustomEvent;
            if (ce.detail) setModel(ce.detail);
        };
        window.addEventListener("model-changed", handleModelChange);
        return () => window.removeEventListener("model-changed", handleModelChange);
    }, []);

    const handleModelSelect = (selected: string) => {
        setModel(selected);
        window.dispatchEvent(new CustomEvent("model-changed", { detail: selected }));
    };

    const handleSampleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const s = SAMPLES.find((x) => x.label === e.target.value);
        if (s) {
            setText(s.text);
            setResult(null); // ✅ Bug fix: clear previous result when sample changes
        }
    };

    const analyze = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setResult(null);
        predictionDone.current = false;

        // Notify 3D pipeline that process has started
        window.dispatchEvent(new CustomEvent("nlp-pipeline-start", { detail: { text, model } }));

        // Start prediction in the background immediately
        const predictionPromise = api.predict(text, model).finally(() => {
            predictionDone.current = true;
        });

        // ✅ Bug fix: animate pipeline stages in a loop until the prediction resolves
        let step = 0;
        const animateLoop = async () => {
            while (!predictionDone.current) {
                setActiveStep(step % PIPELINE_STAGES.length);
                window.dispatchEvent(new CustomEvent("nlp-pipeline-step", { detail: step % PIPELINE_STAGES.length }));
                await new Promise((resolve) => setTimeout(resolve, 150));
                step++;
            }
            setActiveStep(null);
        };
        animateLoop();

        try {
            const r = await predictionPromise;
            setResult(r);
            toast.success("Analysis complete!", {
                description: `Sentiment: ${r.sentiment} · Confidence: ${(r.confidence * 100).toFixed(0)}%`,
            });
            // Notify other panels to refresh history and charts
            window.dispatchEvent(new CustomEvent("sentiment-analyzed"));
        } catch (err) {
            console.error("Analysis error:", err);
            toast.error("Sentiment analysis failed. Please try again.");
        } finally {
            setLoading(false);
            window.dispatchEvent(new CustomEvent("nlp-pipeline-complete"));
        }
    };

    const handleClear = () => {
        setText("");
        setResult(null);
        setSampleKey((k) => k + 1); // ✅ Reset sample dropdown to default
    };

    return (
        <section id="demo" className="relative py-32">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="mb-12 text-center"
                >
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
                        <Sparkles className="size-3 text-primary animate-pulse" /> Live Analysis Lab
                    </div>
                    <h2 className="text-gradient text-4xl font-bold md:text-5xl">Try it now</h2>
                    <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                        Select a model, type text, and witness real-time vector processing.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="mx-auto max-w-5xl space-y-6"
                >
                    <div className="rounded-3xl glass-strong p-6 md:p-8 shadow-card border border-white/10 relative overflow-hidden">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                                    <Cpu className="size-4 text-primary" /> Active Model:
                                </label>
                                <select
                                    value={model}
                                    onChange={(e) => handleModelSelect(e.target.value)}
                                    className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark] *:bg-neutral-900 cursor-pointer hover:bg-white/10 transition"
                                >
                                    <option value="VADER">VADER Sentiment</option>
                                    <option value="DeBERTa Small">DeBERTa Small (Zero-Shot)</option>
                                    <option value="DeBERTa Base">DeBERTa Base (Zero-Shot)</option>
                                </select>
                            </div>
                            <select
                                key={sampleKey}
                                onChange={handleSampleSelect}
                                defaultValue=""
                                className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted-foreground border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark] *:bg-neutral-900 cursor-pointer hover:bg-white/10 transition"
                            >
                                <option value="" disabled>Choose a sample…</option>
                                {SAMPLES.map((s) => (
                                    <option key={s.label} value={s.label}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Enhanced Visual Textarea with Focus Glow */}
                        <div className="relative group">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => {
                                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                        e.preventDefault();
                                        if (!loading && text.trim()) analyze();
                                    }
                                }}
                                placeholder="Type or paste feedback text to initiate computational analysis... (Ctrl+Enter to analyze)"
                                rows={6}
                                className="w-full resize-none rounded-2xl bg-black/40 p-4 font-sans text-base placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/80 focus:shadow-[0_0_25px_oklch(0.7_0.22_270_/_0.25)] border border-white/10 transition-all duration-300 text-white font-medium"
                                style={{ caretColor: "var(--primary)" }}
                            />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="text-xs text-muted-foreground font-mono">{text.length} / 5000 characters</div>
                                {text.length > 4500 && (
                                    <span className="text-xs text-yellow-400 font-mono font-bold">⚠ Near limit</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => { setText(POSITIVE_SAMPLE); setResult(null); }}
                                    className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-semibold hover:bg-white/10"
                                >
                                    <ThumbsUp className="size-3.5" /> Positive sample
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={handleClear}
                                    className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-semibold hover:bg-white/10"
                                >
                                    <Eraser className="size-3.5" /> Clear
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    disabled={loading || !text.trim()}
                                    onClick={analyze}
                                    className="inline-flex items-center gap-2 rounded-full px-6 py-2 text-xs font-bold text-primary-foreground transition disabled:opacity-50"
                                    style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                                >
                                    {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                                    {loading ? "Processing..." : "Analyze Sentiment"}
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* NLP Pipeline Stepper Loader */}
                    <AnimatePresence>
                        {loading && activeStep !== null && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                className="overflow-hidden"
                            >
                                <div
                                    className="glass-strong border border-primary/20 p-6 rounded-3xl shadow-[0_0_30px_oklch(0.7_0.22_270_/_0.2)]"
                                >
                                    {/* Pipeline progress bar */}
                                    <div className="w-full h-1 bg-white/5 rounded-full mb-5 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: "var(--gradient-primary)" }}
                                            animate={{ width: `${((activeStep + 1) / 8) * 100}%` }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="relative flex size-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shrink-0">
                                            <Loader2 className="size-6 animate-spin text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary font-mono">
                                                    Neural Pipeline · Stage {activeStep + 1} of 8
                                                </span>
                                                <span className="text-[10px] font-mono text-muted-foreground">
                                                    {Math.round(((activeStep + 1) / 8) * 100)}%
                                                </span>
                                            </div>
                                            <div className="text-lg font-bold text-white mt-0.5 truncate">
                                                {PIPELINE_STAGES[activeStep].name}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed truncate">
                                                {PIPELINE_STAGES[activeStep].desc}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Stage dots */}
                                    <div className="flex items-center gap-1.5 mt-4 justify-center">
                                        {PIPELINE_STAGES.map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="rounded-full"
                                                animate={{
                                                    width: i === activeStep ? 16 : 6,
                                                    background: i <= activeStep ? "oklch(0.7 0.22 270)" : "oklch(1 0 0 / 0.1)"
                                                }}
                                                style={{ height: 6 }}
                                                transition={{ duration: 0.2 }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <ResultPanel result={result} charCount={text.length} />

                    <div className="grid gap-6 md:grid-cols-2">
                        <ModelOutput result={result} />
                        <Keywords result={result} />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
