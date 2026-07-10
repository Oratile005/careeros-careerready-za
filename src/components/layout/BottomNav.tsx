import { Link, useRouterState } from "@tanstack/react-router";
import { MOBILE_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-sidebar/95 backdrop-blur-lg lg:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {MOBILE_NAV.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(124,92,255,0.7)]")} />
              {item.short}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
