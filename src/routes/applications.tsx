import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { AiOutput } from "@/components/AiOutput";
import { AiLoading } from "@/components/Loading";
import { ResponsibleAI } from "@/components/ResponsibleAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { generateAI } from "@/lib/use-ai";
import { useCareer } from "@/lib/career-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/applications")({
  component: Applications,
});

const DOC_TYPES = [
  "CV / Resume",
  "Cover Letter",
  "Follow-Up Email",
  "Thank You Email",
  "LinkedIn Recruiter Message",
  "Learnership Application",
  "Bursary Application",
];

const TONES = ["Professional", "Confident Graduate", "Eager", "Formal"];

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

const OPPORTUNITIES = [
  "Standard Bank Graduate Programme",
  "FNB Graduate Programme",
  "Discovery Internship",
  "CAPACITI Programme",
  "YES4Youth Programme",
];

const SYSTEM = `You are CareerOS, an expert career writer for South African graduates and early-career professionals. You write polished, ATS-friendly, professional documents tailored to the South African job market. You understand B-BBEE, provinces, local companies, learnerships, bursaries and graduate programmes. Keep language clear and professional. Never invent qualifications the user did not provide. Output only the document itself, well formatted with clear sections.`;

function Applications() {
  const { recordApplication, unlock } = useCareer();
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [target, setTarget] = useState("");
  const [experience, setExperience] = useState("");
  const [tone, setTone] = useState(TONES[1]);
  const [province, setProvince] = useState(PROVINCES[0]);
  const [bbbee, setBbbee] = useState("");
  const [languages, setLanguages] = useState("");
  const [relocate, setRelocate] = useState(true);
  const [linkedin, setLinkedin] = useState("");

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const buildPrompt = () => `Generate a ${docType} for a South African graduate.

Candidate name: ${name || "the candidate"}
Target role: ${role || "graduate role"}
Target company / opportunity: ${target || "a South African employer"}
Experience, skills & education: ${experience || "recent graduate, limited formal experience"}
LinkedIn / profile notes: ${linkedin || "n/a"}

Tone: ${tone}
Province: ${province}
B-BBEE status: ${bbbee || "not specified"}
Languages spoken: ${languages || "English"}
Willing to relocate: ${relocate ? "Yes" : "No"}

Write it professionally for the South African context. If relevant, tastefully include B-BBEE status, province and languages. Optimise wording for candidates with limited professional networks and limited data access.`;

  const generate = async (regen = false) => {
    if (!role && !target) {
      toast.error("Add a target role or company first");
      return;
    }
    setLoading(true);
    try {
      const text = await generateAI(SYSTEM, buildPrompt());
      setOutput(text);
      if (!regen) {
        recordApplication();
        if (docType === "CV / Resume") unlock("cv-master");
        if (docType === "LinkedIn Recruiter Message") unlock("networking-pro");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        icon={FileText}
        title="AI Application Generator"
        subtitle="CVs, cover letters, emails, learnerships & bursaries — tailored for SA."
      />

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <GlassCard className="space-y-4">
            <div>
              <Label className="mb-2 block text-xs text-muted-foreground">Document type</Label>
              <div className="flex flex-wrap gap-1.5">
                {DOC_TYPES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDocType(d)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      docType === d
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Full name">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Thabo Mokoena" />
              </Field>
              <Field label="Target role">
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Graduate Analyst" />
              </Field>
            </div>

            <Field label="Target company / opportunity">
              <Input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. FNB Graduate Programme"
                list="opps"
              />
              <datalist id="opps">
                {OPPORTUNITIES.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </Field>

            <Field label="Experience, skills & education">
              <Textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="BCom Finance (UJ, 2024). Vacation work at a local firm. Excel, communication, teamwork…"
                className="min-h-[90px]"
              />
            </Field>

            <Field label="LinkedIn / profile URL (optional)">
              <Input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/…"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Tone">
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Province">
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="B-BBEE status">
                <Input value={bbbee} onChange={(e) => setBbbee(e.target.value)} placeholder="e.g. Level 1 / B1" />
              </Field>
              <Field label="Languages spoken">
                <Input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, isiZulu, Sesotho" />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-white/[0.02] px-3 py-2.5">
              <span className="text-sm">Willing to relocate</span>
              <Switch checked={relocate} onCheckedChange={setRelocate} />
            </div>

            <Button
              onClick={() => generate(false)}
              disabled={loading}
              className="w-full gradient-primary text-white"
              size="lg"
            >
              <Sparkles className="h-4 w-4" /> Generate
            </Button>
            <ResponsibleAI />
          </GlassCard>
        </div>

        {/* Output */}
        <div className="lg:col-span-3">
          <motion.div layout>
            {loading && !output ? (
              <GlassCard><AiLoading label="Writing your document…" /></GlassCard>
            ) : output ? (
              <AiOutput
                title={docType}
                value={output}
                onChange={setOutput}
                onRegenerate={() => generate(true)}
                regenerating={loading}
              />
            ) : (
              <GlassCard className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="grid h-16 w-16 place-items-center rounded-3xl border border-primary/30 bg-primary/10">
                  <Wand2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Your document appears here</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Fill in your details and hit Generate. Everything is editable, copyable and downloadable as PDF.
                </p>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
