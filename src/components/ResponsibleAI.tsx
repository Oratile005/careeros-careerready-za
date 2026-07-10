import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResponsibleAI({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <p>
        AI-generated content may require human review. Always verify job and bursary information on
        official websites. Your data is not permanently stored.
      </p>
    </div>
  );
}
