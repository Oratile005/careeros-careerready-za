import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function XpBar({
  progress,
  className,
  showGlow = true,
}: {
  progress: number;
  className?: string;
  showGlow?: boolean;
}) {
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(2, Math.min(100, progress))}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className={cn("h-full rounded-full", showGlow && "shadow-[0_0_14px_rgba(124,92,255,0.6)]")}
        style={{ background: "var(--gradient-xp)" }}
      />
    </div>
  );
}
