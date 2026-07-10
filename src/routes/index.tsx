import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileText,
  Mic,
  Compass,
  Languages,
  Send,
  Trophy,
  Target,
  Bookmark,
  Zap,
  Flame,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { XpBar } from "@/components/XpBar";
import { ResponsibleAI } from "@/components/ResponsibleAI";
import { Button } from "@/components/ui/button";
import { useCareer, levelFor, matchAvg, BADGES } from "@/lib/career-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function Dashboard() {
  const { state, hydrated } = useCareer();
  const info = levelFor(state.xp);
  const avg = matchAvg(state.matchScores);

  const stats = [
    { label: "Applications Sent", value: state.applicationsSent, icon: Send, tint: "text-primary" },
    { label: "Interview XP", value: state.interviewXp, icon: Mic, tint: "text-[#5B5FFB]" },
    { label: "Match Score Avg", value: avg ? `${avg}%` : "—", icon: Target, tint: "text-success" },
    { label: "Opportunities Saved", value: state.opportunitiesSaved, icon: Bookmark, tint: "text-destructive" },
    { label: "Career Level", value: info.current.name, icon: Trophy, tint: "text-primary", wide: true },
  ];

  const tools = [
    { to: "/applications", icon: FileText, title: "Application Generator", desc: "Land more interviews with AI-tailored CVs & cover letters." },
    { to: "/interview", icon: Mic, title: "Interview Simulator", desc: "Practice with an AI HR interviewer and get scored." },
    { to: "/opportunities", icon: Compass, title: "Opportunity Finder", desc: "Jobs, bursaries and learnerships matched to you." },
    { to: "/translator", icon: Languages, title: "Workplace Translator", desc: "Decode corporate SA communication instantly." },
  ];

  const weeklyGoals = [
    { label: "Complete a mock interview", done: state.interviewsDone > 0 },
    { label: "Generate an application", done: state.applicationsSent > 0 },
    { label: "Save an opportunity", done: state.opportunitiesSaved > 0 },
    { label: "Log in 5 days this week", done: state.streak >= 5 },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Hero */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-6 shadow-glow sm:p-10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> AI Career Accelerator · South Africa
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Level Up Your Career with AI
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/85 sm:text-base">
              From CV to Job Offer. Your AI Coach for the South African job market.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-[#0B1020] hover:bg-white/90">
                <Link to="/interview">
                  <Mic className="h-4 w-4" /> Start Interview Practice
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                <Link to="/coach">
                  Talk to your Coach <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={item} className={cn(s.wide && "col-span-2 sm:col-span-1")}>
            <GlassCard className="h-full">
              <s.icon className={cn("h-5 w-5", s.tint)} />
              <p className="mt-3 text-2xl font-bold leading-none">{hydrated ? s.value : "—"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress + goals */}
      <motion.div variants={item} className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current level</p>
              <h3 className="text-xl font-bold gradient-text">{info.current.name}</h3>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              <Zap className="h-4 w-4" /> {hydrated ? state.xp : 0} XP
            </div>
          </div>
          <XpBar progress={info.progress} className="mt-4" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{info.current.name}</span>
            <span>{info.next ? `${info.ceil - state.xp} XP to ${info.next.name}` : "Max level 🏆"}</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { l: "Mock Interview", v: "+50" },
              { l: "Application", v: "+20" },
              { l: "New Skill", v: "+30" },
              { l: "Daily Login", v: "+10" },
            ].map((r) => (
              <div key={r.l} className="rounded-xl border border-border bg-white/[0.02] p-2.5 text-center">
                <p className="text-sm font-bold text-primary">{r.v} XP</p>
                <p className="text-[10px] text-muted-foreground">{r.l}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Weekly Goals</h3>
            <span className="flex items-center gap-1 text-xs font-semibold text-destructive">
              <Flame className="h-3.5 w-3.5" /> {hydrated ? state.streak : 0} day streak
            </span>
          </div>
          <div className="mt-4 space-y-2.5">
            {weeklyGoals.map((g) => (
              <div key={g.label} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2
                  className={cn("h-4 w-4 shrink-0", g.done ? "text-success" : "text-muted-foreground/40")}
                />
                <span className={cn(g.done && "text-muted-foreground line-through")}>{g.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Tools */}
      <motion.div variants={item}>
        <h2 className="mb-3 text-lg font-bold">Your AI toolkit</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tools.map((t) => (
            <Link key={t.to} to={t.to}>
              <GlassCard hover className="group h-full">
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-primary/30 bg-primary/10">
                    <t.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 font-semibold">
                      {t.title}
                      <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Achievements preview */}
      <motion.div variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Achievements</h2>
          <Link to="/profile" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {BADGES.map((b) => {
            const earned = state.badges.includes(b.id);
            return (
              <div
                key={b.id}
                title={b.desc}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm",
                  earned
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-white/[0.02] opacity-50 grayscale",
                )}
              >
                <span className="text-lg">{b.icon}</span>
                <span className="font-medium">{b.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <ResponsibleAI />
      </motion.div>
    </motion.div>
  );
}
