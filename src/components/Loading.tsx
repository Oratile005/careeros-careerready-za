import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Shimmer({ lines = 4, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded-md bg-white/[0.06]"
          style={{ width: `${70 + ((i * 37) % 30)}%` }}
        />
      ))}
    </div>
  );
}

export function AiLoading({ label = "CareerOS is thinking…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <Shimmer className="mt-2 w-full max-w-md" />
    </div>
  );
}
