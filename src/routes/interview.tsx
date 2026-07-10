import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic,
  Play,
  RefreshCw,
  Send,
  Copy,
  Download,
  Sparkles,
  Star,
  Lightbulb,
  TrendingUp,
  MicOff,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { AiLoading } from "@/components/Loading";
import { ResponsibleAI } from "@/components/ResponsibleAI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateAI } from "@/lib/use-ai";
import { useCareer } from "@/lib/career-store";
import { copyText, downloadPdf } from "@/components/AiOutput";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/interview")({
  component: InterviewSim,
});

const COMPANIES = ["Discovery", "FNB", "MTN", "Capitec", "Nedbank", "Government", "NGO"];
const ROLES = ["Graduate", "Intern", "Call Centre Agent", "Software Developer", "Business Analyst"];

type Evaluation = {
  score: number;
  confidence: number;
  feedback: string;
  tip: string;
  modelAnswer: string;
};

function parseJson<T>(raw: string): T | null {
  try {
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

function InterviewSim() {
  const { recordInterview, unlock } = useCareer();
  const [company, setCompany] = useState(COMPANIES[0]);
  const [role, setRole] = useState(ROLES[0]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [loadingE, setLoadingE] = useState(false);
  const [qNum, setQNum] = useState(0);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  const getQuestion = async () => {
    setLoadingQ(true);
    setEvaluation(null);
    setAnswer("");
    try {
      const text = await generateAI(
        `You are a senior HR interviewer at ${company} in South Africa interviewing a ${role} candidate. Ask ONE realistic interview question only. No preamble, just the question.`,
        `Ask interview question number ${qNum + 1}. Vary between behavioural, competency and company-fit questions. Return only the question.`,
      );
      setQuestion(text.trim());
      setQNum((n) => n + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not get question");
    } finally {
      setLoadingQ(false);
    }
  };

  const evaluate = async () => {
    if (!answer.trim()) {
      toast.error("Type your answer first");
      return;
    }
    setLoadingE(true);
    try {
      const text = await generateAI(
        `You are a senior HR interviewer at ${company} in South Africa. Evaluate a ${role} candidate's answer fairly and constructively, with South African corporate context. Respond ONLY with JSON: {"score": <0-10 number>, "confidence": <0-100 number>, "feedback": "<2-3 sentences>", "tip": "<one SA corporate tip>", "modelAnswer": "<a strong example answer>"}`,
        `Question: ${question}\n\nCandidate answer: ${answer}`,
      );
      const parsed = parseJson<Evaluation>(text);
      if (!parsed) {
        toast.error("Could not read evaluation, try again");
        return;
      }
      setEvaluation(parsed);
      recordInterview(parsed.score);
      unlock("interview-warrior");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Evaluation failed");
    } finally {
      setLoadingE(false);
    }
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-ZA";
    rec.interimResults = false;
    rec.continuous = true;
    rec.onresult = (e: any) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setAnswer((prev) => (prev ? prev + " " : "") + t);
    };
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
    toast.success("Listening… speak your answer");
  };

  const exportReport = () => {
    if (!evaluation) return;
    downloadPdf(
      `Interview Report — ${company} ${role}`,
      `Question:\n${question}\n\nYour answer:\n${answer}\n\nScore: ${evaluation.score}/10\nConfidence: ${evaluation.confidence}%\n\nFeedback:\n${evaluation.feedback}\n\nSA Corporate Tip:\n${evaluation.tip}\n\nModel Answer:\n${evaluation.modelAnswer}`,
    );
  };

  return (
    <div>
      <PageHeader icon={Mic} title="Mock Interview with HR" subtitle="Practice with an AI HR interviewer and get scored instantly." />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Company</Label>
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COMPANIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={getQuestion} disabled={loadingQ} className="w-full gradient-primary text-white" size="lg">
              <Play className="h-4 w-4" /> {qNum === 0 ? "Start Interview" : "Next Question"}
            </Button>
            {question && (
              <Button onClick={getQuestion} disabled={loadingQ} variant="outline" className="w-full">
                <RefreshCw className={cn("h-4 w-4", loadingQ && "animate-spin")} /> Regenerate Question
              </Button>
            )}
            <ResponsibleAI />
          </GlassCard>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {loadingQ && !question ? (
            <GlassCard><AiLoading label="HR is preparing your question…" /></GlassCard>
          ) : question ? (
            <>
              <GlassCard>
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> {company} · {role} · Question {qNum}
                </div>
                <p className="mt-2 text-lg font-semibold leading-snug">{question}</p>
              </GlassCard>

              <GlassCard className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Your answer</Label>
                  <Button size="sm" variant={listening ? "default" : "outline"} className={cn("h-7 gap-1.5 text-xs", listening && "bg-destructive text-white")} onClick={toggleVoice}>
                    {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    {listening ? "Stop" : "Voice"}
                  </Button>
                </div>
                <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type or speak your answer…" className="min-h-[120px]" />
                <Button onClick={evaluate} disabled={loadingE} className="w-full gradient-primary text-white">
                  <Send className="h-4 w-4" /> Submit Answer
                </Button>
              </GlassCard>

              {loadingE && <GlassCard><AiLoading label="Scoring your answer…" /></GlassCard>}

              <AnimatePresence>
                {evaluation && !loadingE && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <ScoreCard icon={Star} label="Score" value={`${evaluation.score}/10`} progress={evaluation.score * 10} />
                      <ScoreCard icon={TrendingUp} label="Confidence" value={`${evaluation.confidence}%`} progress={evaluation.confidence} />
                    </div>
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="rounded-2xl border border-success/30 bg-success/10 p-3 text-center text-sm font-semibold text-success">
                      🎉 Confidence Level Up · +50 XP earned
                    </motion.div>
                    <GlassCard>
                      <h4 className="mb-1 text-sm font-semibold">Feedback</h4>
                      <p className="text-sm text-foreground/85">{evaluation.feedback}</p>
                    </GlassCard>
                    <GlassCard className="border-primary/20">
                      <h4 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-primary"><Lightbulb className="h-4 w-4" /> SA Corporate Tip</h4>
                      <p className="text-sm text-foreground/85">{evaluation.tip}</p>
                    </GlassCard>
                    <GlassCard>
                      <h4 className="mb-1 text-sm font-semibold">Model Answer</h4>
                      <p className="whitespace-pre-wrap text-sm text-foreground/85">{evaluation.modelAnswer}</p>
                    </GlassCard>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => copyText(evaluation.feedback)}><Copy className="h-4 w-4" /> Copy Feedback</Button>
                      <Button variant="outline" onClick={exportReport}><Download className="h-4 w-4" /> Export Report</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <GlassCard className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-3xl border border-primary/30 bg-primary/10">
                <Mic className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Ready when you are</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">Pick a company and role, then start your mock interview. Answer by text or voice.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ icon: Icon, label, value, progress }: { icon: any; label: string; value: string; progress: number }) {
  return (
    <GlassCard>
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full" style={{ background: "var(--gradient-xp)" }} />
      </div>
    </GlassCard>
  );
}
