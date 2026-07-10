import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Compass,
  Search,
  Bookmark,
  BookmarkCheck,
  Bell,
  ExternalLink,
  FileText,
  CalendarClock,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { AiLoading } from "@/components/Loading";
import { ResponsibleAI } from "@/components/ResponsibleAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { XpBar } from "@/components/XpBar";
import { generateAI } from "@/lib/use-ai";
import { useCareer } from "@/lib/career-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/opportunities")({
  component: Opportunities,
});

const SOURCES = ["YES4Youth", "NSFAS", "DPSA Vacancies", "Eskom", "CareerJunction", "LinkedIn", "Harambee", "CAPACITI"];

type Opportunity = {
  id: string;
  type: string;
  title: string;
  org: string;
  matchScore: number;
  deadline: string;
  source: string;
  actionPlan: string[];
  checklist: string[];
};

function parseArray(raw: string): Opportunity[] {
  try {
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1) return [];
    const arr = JSON.parse(cleaned.slice(start, end + 1)) as Omit<Opportunity, "id">[];
    return arr.map((o, i) => ({ ...o, id: `${o.title}-${i}` }));
  } catch {
    return [];
  }
}

function Opportunities() {
  const navigate = useNavigate();
  const { state, toggleSaveOpportunity } = useCareer();
  const [field, setField] = useState("");
  const [location, setLocation] = useState("");
  const [qualification, setQualification] = useState("");
  const [results, setResults] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<string[]>([]);

  const search = async () => {
    if (!field) {
      toast.error("Add your field of study");
      return;
    }
    setLoading(true);
    try {
      const text = await generateAI(
        `You are an expert on South African graduate opportunities: jobs, internships, learnerships, graduate programmes and bursaries. Suggest realistic, currently-typical opportunities from sources like ${SOURCES.join(", ")}. Respond ONLY with a JSON array of 6 objects: {"type":"Graduate Programme|Job|Internship|Learnership|Bursary","title":"","org":"","matchScore":<50-99>,"deadline":"e.g. 30 Sept 2026 or Rolling","source":"one of the sources","actionPlan":["step1","step2","step3"],"checklist":["item1","item2","item3","item4"]}`,
        `Field of study: ${field}\nLocation: ${location || "any in South Africa"}\nQualification: ${qualification || "not specified"}\nReturn a diverse mix of programmes, jobs, learnerships and bursaries.`,
      );
      const parsed = parseArray(text);
      if (!parsed.length) {
        toast.error("No results parsed, try again");
        return;
      }
      setResults(parsed.sort((a, b) => b.matchScore - a.matchScore));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleReminder = (id: string) => {
    setReminders((r) => {
      const has = r.includes(id);
      toast[has ? "message" : "success"](has ? "Reminder removed" : "Reminder set — we'll nudge you before the deadline");
      return has ? r.filter((x) => x !== id) : [...r, id];
    });
  };

  return (
    <div>
      <PageHeader icon={Compass} title="Jobs + Bursaries + Learnerships" subtitle="AI-matched opportunities across South Africa." />

      <GlassCard className="mb-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Field of study</Label>
            <Input value={field} onChange={(e) => setField(e.target.value)} placeholder="e.g. Information Technology" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Johannesburg" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Qualification</Label>
            <Input value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="e.g. National Diploma" />
          </div>
        </div>
        <Button onClick={search} disabled={loading} className="mt-4 w-full gradient-primary text-white sm:w-auto" size="lg">
          <Search className="h-4 w-4" /> Find Opportunities
        </Button>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SOURCES.map((s) => (
            <span key={s} className="rounded-full border border-border bg-white/[0.02] px-2.5 py-1 text-[10px] text-muted-foreground">{s}</span>
          ))}
        </div>
      </GlassCard>

      {loading ? (
        <GlassCard><AiLoading label="Scanning opportunities across SA…" /></GlassCard>
      ) : results.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          <AnimatePresence>
            {results.map((o, i) => {
              const saved = state.savedOpportunityIds.includes(o.id);
              const reminded = reminders.includes(o.id);
              return (
                <motion.div key={o.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <GlassCard className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{o.type}</span>
                        <h3 className="mt-2 font-semibold leading-tight">{o.title}</h3>
                        <p className="text-sm text-muted-foreground">{o.org} · {o.source}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-bold text-success">{o.matchScore}%</p>
                        <p className="text-[10px] text-muted-foreground">match</p>
                      </div>
                    </div>
                    <XpBar progress={o.matchScore} className="mt-3" showGlow={false} />

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" /> Deadline: <span className="font-medium text-foreground">{o.deadline}</span>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <p className="flex items-center gap-1.5 text-xs font-semibold"><ListChecks className="h-3.5 w-3.5 text-primary" /> Action plan</p>
                      {o.actionPlan?.slice(0, 3).map((s, k) => (
                        <p key={k} className="pl-5 text-xs text-muted-foreground">{k + 1}. {s}</p>
                      ))}
                    </div>

                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-semibold">Application checklist</p>
                      {o.checklist?.slice(0, 4).map((c, k) => (
                        <p key={k} className="flex items-center gap-1.5 pl-1 text-xs text-muted-foreground"><CheckCircle2 className="h-3 w-3 text-success/70" /> {c}</p>
                      ))}
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                      <Button size="sm" className="gradient-primary text-white" onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(o.title + " " + o.org + " apply")}`, "_blank")}>
                        <ExternalLink className="h-3.5 w-3.5" /> Apply Now
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate({ to: "/applications" })}>
                        <FileText className="h-3.5 w-3.5" /> Generate
                      </Button>
                      <Button size="sm" variant={saved ? "default" : "outline"} className={cn(saved && "bg-primary/20 text-primary")} onClick={() => toggleSaveOpportunity(o.id)}>
                        {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />} {saved ? "Saved" : "Save"}
                      </Button>
                      <Button size="sm" variant={reminded ? "default" : "outline"} className={cn(reminded && "bg-primary/20 text-primary")} onClick={() => toggleReminder(o.id)}>
                        <Bell className="h-3.5 w-3.5" /> {reminded ? "Reminded" : "Remind"}
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <GlassCard className="flex min-h-[280px] flex-col items-center justify-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-3xl border border-primary/30 bg-primary/10">
            <Compass className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Discover your next opportunity</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Enter your field, location and qualification. We'll match you with graduate programmes, jobs, learnerships and bursaries.</p>
        </GlassCard>
      )}

      <div className="mt-4"><ResponsibleAI /></div>
    </div>
  );
}
