import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Loader2, CheckCircle2, CloudUpload, AlertTriangle, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import { Tilt3DCard } from "./Tilt3DCard";
import { toast } from "sonner";

const MODEL_OPTIONS = [
    { value: "VADER", label: "VADER Sentiment" },
    { value: "DeBERTa Small", label: "DeBERTa Small" },
    { value: "DeBERTa Base", label: "DeBERTa Base" },
];

function colorFor(s: string) {
    const k = s?.toLowerCase();
    if (k === "positive") return "oklch(0.78 0.2 155)";
    if (k === "negative") return "oklch(0.7 0.25 25)";
    return "oklch(0.72 0.2 240)";
}

export function PdfUpload() {
    const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
    const [filename, setFilename] = useState<string | null>(null);
    const [extracted, setExtracted] = useState<string>("");
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [selectedModel, setSelectedModel] = useState("VADER");

    const onDrop = useCallback(async (files: File[]) => {
        const file = files[0];
        if (!file) return;
        setFilename(file.name);
        setStatus("uploading");
        setAnalysisResult(null);
        setExtracted("");
        try {
            const r = await api.extractPdf(file);
            setExtracted(r.text);
            setStatus("done");
            toast.success("PDF extracted successfully!", {
                description: `${r.text.length.toLocaleString()} characters parsed from ${file.name}`,
            });
        } catch (err: any) {
            console.error(err);
            setStatus("error"); // ✅ Bug fix: show error state
            setFilename(null); // ✅ Bug fix: clear stale filename
            toast.error("PDF extraction failed", {
                description: err?.message || "The file may be scanned or password-protected.",
            });
        }
    }, []);

    const analyzePdfText = async () => {
        if (!extracted) return;
        setAnalyzing(true);
        try {
            // ✅ Bug fix: use selectedModel instead of hardcoded "VADER"
            const r = await api.predict(extracted, selectedModel);
            setAnalysisResult(r);
            window.dispatchEvent(new CustomEvent("sentiment-analyzed"));
            toast.success("PDF analysis complete!", {
                description: `Sentiment: ${r.sentiment} · Confidence: ${(r.confidence * 100).toFixed(0)}%`,
            });
        } catch (err: any) {
            console.error(err);
            toast.error("Analysis failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleReset = () => {
        setStatus("idle");
        setFilename(null);
        setExtracted("");
        setAnalysisResult(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
        disabled: status === "uploading",
    });

    return (
        <section id="pdf" className="relative py-20">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-55px" }}
                    className="mx-auto max-w-5xl"
                >
                    <div className="mb-8 select-none">
                        <div className="mb-3 inline-flex rounded-full glass px-3 py-1 text-xs font-semibold text-muted-foreground border border-white/5">
                            PDF Intelligence
                        </div>
                        <h3 className="font-display text-3xl font-bold md:text-5xl text-white">Document Extraction</h3>
                        <p className="mt-2 text-muted-foreground">Upload text-based PDF files to parse structure and isolate sentiment polarity.</p>
                    </div>

                    {/* Futuristic Upload Portal wrapped in a 3D Mouse-Tilt container */}
                    <Tilt3DCard intensity={6}>
                        <div
                            {...getRootProps()}
                            className={`relative cursor-pointer overflow-hidden rounded-3xl border p-16 text-center transition-all duration-500 shadow-card ${
                                status === "error"
                                    ? "border-red-500/40 bg-red-950/20"
                                    : isDragActive
                                    ? "border-primary/50"
                                    : "border-white/10 hover:border-primary/30"
                            }`}
                            style={{
                                background: status === "error"
                                    ? "rgba(220, 38, 38, 0.05)"
                                    : "color-mix(in oklab, var(--card) 60%, transparent)",
                                boxShadow: isDragActive ? "0 0 30px oklch(0.7 0.22 270 / 0.15)" : undefined
                            }}
                        >
                            <input {...getInputProps()} />

                            {/* Volumetric Holographic rings background inside portal */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 opacity-20">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute size-80 rounded-full border border-dashed border-primary/40"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                    className="absolute size-[400px] rounded-full border border-dashed border-accent/30"
                                />
                            </div>

                            {/* Laser scanner line sweep animation when uploading */}
                            {status === "uploading" && (
                                <motion.div
                                    animate={{ top: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_oklch(0.7_0.22_270_/_0.8)] pointer-events-none z-10"
                                />
                            )}

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={`mx-auto mb-6 inline-flex size-20 items-center justify-center rounded-3xl border ${
                                    status === "error" ? "border-red-500/30 bg-red-500/10" : "border-white/10"
                                }`}
                                style={status !== "error" ? {
                                    background: "var(--gradient-primary)",
                                    boxShadow: "var(--shadow-glow)"
                                } : {}}
                            >
                                {status === "uploading" ? (
                                    <Loader2 className="size-9 animate-spin text-primary-foreground" />
                                ) : status === "done" ? (
                                    <CheckCircle2 className="size-9 text-primary-foreground" />
                                ) : status === "error" ? (
                                    <AlertTriangle className="size-9 text-red-400" />
                                ) : (
                                    <CloudUpload className="size-9 text-primary-foreground" />
                                )}
                            </motion.div>

                            <div className="text-xl font-bold text-white">
                                {status === "uploading"
                                    ? "Dissolving PDF into vectors..."
                                    : status === "done"
                                    ? "Extraction complete"
                                    : status === "error"
                                    ? "Extraction failed — try another file"
                                    : isDragActive
                                    ? "Drop document in the portal"
                                    : "Drag & drop a PDF, or click to browse"
                                }
                            </div>

                            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed select-none">
                                {status === "error"
                                    ? "The PDF may be scanned, password-protected, or contain no extractable text."
                                    : "Drag PDF inside the portal core to initialize natural language normalization."
                                }
                            </p>

                            {filename && status !== "error" && (
                                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/15 px-4 py-1.5 text-xs text-white font-mono">
                                    <FileText className="size-3.5 text-primary" /> {filename}
                                </div>
                            )}

                            {/* Reset button for error state */}
                            {status === "error" && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/15 px-4 py-1.5 text-xs text-white font-semibold hover:bg-white/10 transition"
                                >
                                    <RotateCcw className="size-3.5" /> Try again
                                </button>
                            )}
                        </div>
                    </Tilt3DCard>

                    <AnimatePresence>
                        {extracted && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 overflow-hidden rounded-2xl glass"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
                                    <span className="text-xs font-mono text-muted-foreground uppercase font-bold tracking-widest">
                                        Parsed Text Buffer · {extracted.length.toLocaleString()} chars
                                    </span>
                                    <div className="flex items-center gap-3">
                                        {/* ✅ Bug fix: Model selector for PDF analysis */}
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white border border-white/10 focus:outline-none [color-scheme:dark] *:bg-neutral-900 cursor-pointer hover:bg-white/10 transition"
                                        >
                                            {MODEL_OPTIONS.map((m) => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={analyzePdfText}
                                            disabled={analyzing}
                                            className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                                            style={{ boxShadow: "var(--shadow-glow)" }}
                                        >
                                            {analyzing ? (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Loader2 className="size-3 animate-spin" /> Analyzing...
                                                </span>
                                            ) : "Analyze Extracted Text"}
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            className="rounded-full glass border border-white/10 px-3 py-2 text-xs text-muted-foreground hover:text-white hover:bg-white/10 transition"
                                            title="Upload a different file"
                                        >
                                            <RotateCcw className="size-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {analysisResult && (
                                    <div className="border-b border-white/10 bg-white/5 p-6">
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3">
                                            PDF Sentiment Analysis Result
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className="text-4xl">{analysisResult.emoji}</span>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <span
                                                        className="text-xl font-black capitalize"
                                                        style={{ color: colorFor(analysisResult.sentiment) }}
                                                    >
                                                        {analysisResult.sentiment}
                                                    </span>
                                                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] text-white font-mono font-bold">
                                                        Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
                                                    </span>
                                                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] text-white font-mono font-bold">
                                                        Score: {analysisResult.score.toFixed(3)}
                                                    </span>
                                                    <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] text-muted-foreground font-mono">
                                                        via {analysisResult.engine || selectedModel}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Score breakdown bars */}
                                        {analysisResult.scores && (
                                            <div className="mt-4 space-y-2">
                                                {analysisResult.scores.map((s: { label: string; value: number }) => (
                                                    <div key={s.label} className="flex items-center gap-3">
                                                        <span className="text-[10px] text-muted-foreground w-16 font-mono">{s.label}</span>
                                                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${s.value * 100}%` }}
                                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                                className="h-full rounded-full"
                                                                style={{ background: colorFor(s.label.toLowerCase()) }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">
                                                            {(s.value * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <pre className="max-h-80 overflow-auto whitespace-pre-wrap p-5 font-mono text-sm leading-relaxed text-muted-foreground/80">
                                    {extracted}
                                </pre>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}
