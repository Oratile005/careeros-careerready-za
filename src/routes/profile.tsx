import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Trophy, Zap, Flame, Send, Mic, Bookmark, Target, Award } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { XpBar } from "@/components/XpBar";
import { ResponsibleAI } from "@/components/ResponsibleAI";
import { useCareer, levelFor, matchAvg, BADGES, LEVELS } from "@/lib/career-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const { state } = useCareer();
  const info = levelFor(state.xp);
  const avg = matchAvg(state.matchScores);

  const stats = [
    { label: "Applications completed", value: state.applicationsSent, icon: Send },
    { label: "Interviews done", value: state.interviewsDone, icon: Mic },
    { label: "Interview score avg", value: avg ? `${avg}%` : "—", icon: Target },
    { label: "Saved opportunities", value: state.opportunitiesSaved, icon: Bookmark },
  ];

  return (
    <div>
      <PageHeader icon={Trophy} title="Profile & XP" subtitle="Your career progress, achievements and streaks." />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-6 shadow-glow">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-3xl backdrop-blur">🎓</div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-white/80">Career Level</p>
                <h2 className="text-2xl font-bold text-white">{info.current.name}</h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 px-4 py-2 text-center backdrop-blur">
                <p className="flex items-center gap-1 text-xl font-bold text-white"><Zap className="h-4 w-4" /> {state.xp}</p>
                <p className="text-[10px] text-white/80">Total XP</p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-2 text-center backdrop-blur">
                <p className="flex items-center gap-1 text-xl font-bold text-white"><Flame className="h-4 w-4" /> {state.streak}</p>
                <p className="text-[10px] text-white/80">Day streak</p>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-5">
            <XpBar progress={info.progress} />
            <p className="mt-2 text-xs text-white/85">{info.next ? `${info.ceil - state.xp} XP to ${info.next.name}` : "You've reached the top — Hired! 🏆"}</p>
          </div>
        </div>
      </motion.div>

      {/* Level track */}
      <GlassCard className="mt-4">
        <h3 className="mb-3 text-sm font-semibold">Career journey</h3>
        <div className="flex flex-wrap items-center gap-2">
          {LEVELS.map((l, i) => {
            const reached = state.xp >= l.min;
            return (
              <div key={l.name} className="flex items-center gap-2">
                <div className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", reached ? "border-primary/40 bg-primary/15 text-primary" : "border-border text-muted-foreground")}>{l.name}</div>
                {i < LEVELS.length - 1 && <div className={cn("h-0.5 w-4", reached ? "bg-primary/50" : "bg-white/10")} />}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <GlassCard key={s.label}>
            <s.icon className="h-5 w-5 text-primary" />
            <p className="mt-2 text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Achievements */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Achievements</h3>
          <span className="text-sm text-muted-foreground">{state.badges.length}/{BADGES.length}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BADGES.map((b) => {
            const earned = state.badges.includes(b.id);
            return (
              <motion.div key={b.id} whileHover={{ y: -3 }}>
                <GlassCard className={cn("h-full text-center", !earned && "opacity-50 grayscale")}>
                  <div className="mx-auto text-4xl">{b.icon}</div>
                  <p className="mt-2 text-sm font-semibold">{b.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{b.desc}</p>
                  {earned && <span className="mt-2 inline-block rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">Unlocked</span>}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-6"><ResponsibleAI /></div>
    </div>
  );
}
