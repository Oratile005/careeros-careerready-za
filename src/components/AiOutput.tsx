import { useEffect, useState } from "react";
import { Copy, Check, Download, RefreshCw, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function copyText(text: string) {
  navigator.clipboard.writeText(text).then(
    () => toast.success("Copied to clipboard"),
    () => toast.error("Could not copy"),
  );
}

export function downloadPdf(title: string, content: string) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) {
    toast.error("Enable pop-ups to download the PDF");
    return;
  }
  const safe = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  w.document.write(`<!doctype html><html><head><title>${title}</title>
  <style>
    body{font-family:Inter,Arial,sans-serif;max-width:720px;margin:40px auto;padding:0 24px;color:#111;line-height:1.6;white-space:pre-wrap;font-size:14px}
    h1{font-size:18px;border-bottom:2px solid #7C5CFF;padding-bottom:8px}
  </style></head>
  <body><h1>${title}</h1>${safe}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
  toast.success("Opening print dialog — choose 'Save as PDF'");
}

export function AiOutput({
  title,
  value,
  onChange,
  onRegenerate,
  regenerating,
  className,
}: {
  title: string;
  value: string;
  onChange?: (v: string) => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const handleCopy = () => {
    copyText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("rounded-2xl border border-border bg-white/[0.02]", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <span className="text-sm font-semibold">{title}</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setEditing((e) => !e)}
          >
            <Pencil className="h-3.5 w-3.5" />
            {editing ? "Preview" : "Edit"}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            Copy
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 text-xs"
            onClick={() => downloadPdf(title, draft)}
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </Button>
          {onRegenerate && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-xs"
              onClick={onRegenerate}
              disabled={regenerating}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", regenerating && "animate-spin")} />
              Regenerate
            </Button>
          )}
        </div>
      </div>
      {editing ? (
        <Textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            onChange?.(e.target.value);
          }}
          className="min-h-[320px] rounded-none border-0 bg-transparent font-mono text-sm focus-visible:ring-0"
        />
      ) : (
        <div className="max-h-[520px] overflow-y-auto whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed text-foreground/90">
          {draft || "Your generated content will appear here."}
        </div>
      )}
    </div>
  );
}
