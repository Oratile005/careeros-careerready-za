import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Languages, Sparkles, MessageSquare, BookOpen, Copy } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { AiLoading } from "@/components/Loading";
import { ResponsibleAI } from "@/components/ResponsibleAI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyText } from "@/components/AiOutput";
import { generateAI } from "@/lib/use-ai";
import { useCareer } from "@/lib/career-store";
import { toast } from "sonner";

export const Route = createFileRoute("/translator")({
  component: Translator,
});

type Decoded = {
  simple: string;
  meaning: string;
  replies: string[];
  context: string;
  terms: { term: string; explain: string }[];
};

function parseJson(raw: string): Decoded | null {
  try {
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1) return null;
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

const EXAMPLES = [
  "Can you circle back on the deliverables EOD?",
  "Let's take this offline and touch base tomorrow.",
  "Please action this ASAP and keep me in the loop.",
];

function Translator() {
  const { addXp, unlock } = useCareer();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Decoded | null>(null);
  const [loading, setLoading] = useState(false);

  const decode = async () => {
    if (!input.trim()) {
      toast.error("Paste something to decode first");
      return;
    }
    setLoading(true);
    try {
      const text = await generateAI(
        `You are CareerOS Workplace Translator. You decode South African corporate emails, HR policies, meeting notes, jargon and manager instructions for young professionals. Respond ONLY with JSON: {"simple":"<plain-language explanation>","meaning":"<what they actually mean>","replies":["<reply 1>","<reply 2>","<reply 3>"],"context":"<SA workplace context>","terms":[{"term":"","explain":""}]}`,
        `Decode this workplace message:\n\n${input}`,
      );
      const parsed = parseJson(text);
      if (!parsed) {
        toast.error("Could not decode, try again");
        return;
      }
      setResult(parsed);
      addXp(15, "Decoded corporate SA");
      unlock("corporate-ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Decode failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader icon={Languages} title="Decode Corporate SA" subtitle="Understand emails, jargon and manager-speak — and reply with confidence." />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="space-y-3">
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste an email, HR policy, meeting note or manager instruction…" className="min-h-[180px]" />
            <Button onClick={decode} disabled={loading} className="w-full gradient-primary text-white" size="lg">
              <Sparkles className="h-4 w-4" /> Decode
            </Button>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Try an example:</p>
              {EXAMPLES.map((ex) => (
                <button key={ex} onClick={() => setInput(ex)} className="block w-full rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground">
                  "{ex}"
                </button>
              ))}
            </div>
            <ResponsibleAI />
          </GlassCard>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <GlassCard><AiLoading label="Decoding the corporate speak…" /></GlassCard>
          ) : result ? (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <GlassCard className="border-success/25">
                  <h4 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-success"><BookOpen className="h-4 w-4" /> Simple explanation</h4>
                  <p className="text-sm text-foreground/90">{result.simple}</p>
                </GlassCard>
                <GlassCard>
                  <h4 className="mb-1 text-sm font-semibold">What they actually mean</h4>
                  <p className="text-sm text-foreground/90">{result.meaning}</p>
                </GlassCard>
                <GlassCard className="border-primary/20">
                  <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary"><MessageSquare className="h-4 w-4" /> Reply suggestions</h4>
                  <div className="space-y-2">
                    {result.replies?.map((r, i) => (
                      <div key={i} className="group flex items-start gap-2 rounded-xl border border-border bg-white/[0.02] p-3 text-sm">
                        <span className="flex-1">{r}</span>
                        <button onClick={() => copyText(r)} className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"><Copy className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </GlassCard>
                <GlassCard>
                  <h4 className="mb-1 text-sm font-semibold">SA workplace context</h4>
                  <p className="text-sm text-foreground/90">{result.context}</p>
                </GlassCard>
                {result.terms?.length > 0 && (
                  <GlassCard>
                    <h4 className="mb-2 text-sm font-semibold">Key terms explained</h4>
                    <div className="space-y-2">
                      {result.terms.map((t, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-semibold text-primary">{t.term}</span>
                          <span className="text-muted-foreground"> — {t.explain}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <GlassCard className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-3xl border border-primary/30 bg-primary/10">
                <Languages className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Corporate speak, decoded</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">Paste any confusing workplace message and get a plain-language breakdown plus ready-to-send replies.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
