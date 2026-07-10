import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronLeft, GraduationCap } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useCareer, levelFor } from "@/lib/career-store";
import { XpBar } from "@/components/XpBar";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useCareer();
  const info = levelFor(state.xp);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-primary shadow-glow">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">CareerOS</p>
            <p className="truncate text-[10px] text-muted-foreground">Graduate → Hired</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
                active && "text-foreground",
                collapsed && "justify-center",
              )}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl border border-primary/40 bg-primary/15"
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                />
              )}
              <item.icon className={cn("relative z-10 h-5 w-5 shrink-0", active && "text-primary")} />
              {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="m-3 rounded-2xl border border-border bg-white/[0.03] p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-primary">{info.current.name}</span>
            <span className="text-muted-foreground">{state.xp} XP</span>
          </div>
          <XpBar progress={info.progress} className="mt-2" />
          {info.next && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              {info.ceil - state.xp} XP to {info.next.name}
            </p>
          )}
        </div>
      )}

      <button
        onClick={onToggle}
        className="mx-3 mb-4 flex items-center justify-center gap-2 rounded-xl border border-border py-2 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        {!collapsed && "Collapse"}
      </button>
    </aside>
  );
}
