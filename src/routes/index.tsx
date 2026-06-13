import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@/components/ai/ClientOnly";
import { Background } from "@/components/ai/Background";
import { Navbar } from "@/components/ai/Navbar";
import { Hero } from "@/components/ai/Hero";
import { Features } from "@/components/ai/Features";
import { LiveAnalysis } from "@/components/ai/LiveAnalysis";
import { PdfUpload } from "@/components/ai/PdfUpload";
import { Pipeline3D } from "@/components/ai/Pipeline3D";
import { ModelProfile } from "@/components/ai/ModelProfile";
import { Analytics } from "@/components/ai/Analytics";
import { HistoryTable } from "@/components/ai/HistoryTable";
import { Footer } from "@/components/ai/Footer";

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { title: "Sentiment Studio — Enterprise AI Sentiment Analysis" },
            { name: "description", content: "Enterprise-grade AI platform for intelligent sentiment analysis, PDF understanding, and emotional insight extraction." },
            { property: "og:title", content: "Sentiment Studio" },
            { property: "og:description", content: "Enterprise-grade AI platform for intelligent sentiment analysis and PDF understanding." },
        ],
    }),
    component: Index,
});

function Index() {
    return (
        <div className="dark relative min-h-screen text-foreground">
            {/* Persistent ambient backdrop */}
            <Background />


            <Navbar />
            <main className="relative">
                <Hero />
                <Features />
                <LiveAnalysis />
                <PdfUpload />
                <Pipeline3D />
                <ModelProfile />
                <Analytics />
                <HistoryTable />
            </main>
            <Footer />
        </div>
    );
}
