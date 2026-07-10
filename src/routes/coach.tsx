import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareText, Send, Plus, Copy, Sparkles, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyText } from "@/components/AiOutput";
import { Markdown } from "@/components/Markdown";
import { streamChat, type ChatMessage } from "@/lib/use-ai";
import { useCareer } from "@/lib/career-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/coach")({
  component: Coach,
});

const SYSTEM: ChatMessage = {
  role: "system",
  content:
    "You are CareerOS, a supportive career coach for South African graduates. You are practical, encouraging, and direct. You understand the South African labour market, corporate culture, bursaries, internships, and graduate programmes. Keep answers concise, actionable and warm. Use South African context and examples.",
};

const SUGGESTIONS = [
  "How do I get hired in 90 days with no experience?",
  "Best graduate programmes in South Africa right now",
  "How do I negotiate my first salary?",
  "What skills are in demand for 2026?",
];

function Coach() {
  const { addXp } = useCareer();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);
    let earned = false;
    try {
      await streamChat([SYSTEM, ...history], (chunk) => {
        if (!earned) {
          earned = true;
          addXp(5, "Coaching session");
        }
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Coach unavailable");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col lg:h-[calc(100vh-8rem)]">
      <PageHeader
        icon={MessageSquareText}
        title="AI Career Coach"
        subtitle="Your practical, encouraging coach for the SA job market."
        actions={
          <Button variant="outline" size="sm" onClick={() => setMessages([])}>
            <Plus className="h-4 w-4" /> New chat
          </Button>
        }
      />

      <div ref={scrollRef} className="glass flex-1 overflow-y-auto rounded-2xl p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-3xl gradient-primary shadow-glow">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">How can I help your career today?</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Ask me anything about jobs, interviews, bursaries or corporate life in South Africa.</p>
            <div className="mt-5 grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-xl border border-border bg-white/[0.02] p-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5">
                  <Sparkles className="mb-1 h-3.5 w-3.5 text-primary" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                {m.role === "assistant" && (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-primary">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={cn("group max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "bg-primary text-primary-foreground" : "border border-border bg-white/[0.03]")}>
                  {m.role === "assistant" ? (
                    m.content ? (
                      <Markdown>{m.content}</Markdown>
                    ) : (
                      <p className="leading-relaxed">{streaming && i === messages.length - 1 ? "…" : ""}</p>
                    )
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  )}
                  {m.role === "assistant" && m.content && (
                    <button onClick={() => copyText(m.content)} className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end gap-2">
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask your career coach…"
          className="max-h-32 min-h-[52px] flex-1 resize-none"
        />
        <Button onClick={() => send(input)} disabled={streaming || !input.trim()} size="lg" className="h-[52px] gradient-primary px-4 text-white">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
