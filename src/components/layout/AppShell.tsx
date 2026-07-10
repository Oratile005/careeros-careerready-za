import { useState, type ReactNode } from "react";
import { Flame, Zap, GraduationCap } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { CareerProvider, useCareer, levelFor } from "@/lib/career-store";
import { LevelUpModal } from "@/components/LevelUpModal";
import { Toaster } from "@/components/ui/sonner";

function TopBar() {
  const { state, hydrated } = useCareer();
  const info = levelFor(state.xp);
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/70 px-4 py-3 backdrop-blur-lg lg:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold">CareerOS</span>
      </div>
      <div className="hidden lg:block">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {info.current.name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-white/[0.03] px-3 py-1.5 text-xs font-semibold">
          <Flame className="h-3.5 w-3.5 text-destructive" />
          <span>{hydrated ? state.streak : "–"}</span>
          <span className="text-muted-foreground">day</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <Zap className="h-3.5 w-3.5" />
          <span>{hydrated ? state.xp : "–"} XP</span>
        </div>
      </div>
    </header>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <BottomNav />
      <LevelUpModal />
      <Toaster position="top-center" theme="dark" richColors />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <CareerProvider>
      <Shell>{children}</Shell>
    </CareerProvider>
  );
}
