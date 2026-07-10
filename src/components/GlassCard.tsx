import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  hover = false,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "glass rounded-2xl p-5",
        hover && "cursor-pointer transition-shadow hover:shadow-glow",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
