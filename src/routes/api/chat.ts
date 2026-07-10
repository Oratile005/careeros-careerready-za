import { createFileRoute } from "@tanstack/react-router";
import { stream, type ChatMessage } from "@/lib/ai-gateway.server";

type Body = { messages?: ChatMessage[] };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        if (!body.messages || !Array.isArray(body.messages)) {
          return new Response("Missing messages", { status: 400 });
        }

        try {
          const upstream = await stream(body.messages);
          if (!upstream.ok || !upstream.body) {
            const status = upstream.status || 500;
            return new Response("AI request failed", { status });
          }

          // Transform OpenAI-style SSE deltas into a plain text stream.
          const decoder = new TextDecoder();
          const encoder = new TextEncoder();
          let buffer = "";

          const out = new ReadableStream({
            async start(controller) {
              const reader = upstream.body!.getReader();
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split("\n");
                  buffer = lines.pop() ?? "";
                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith("data:")) continue;
                    const data = trimmed.slice(5).trim();
                    if (data === "[DONE]") continue;
                    try {
                      const json = JSON.parse(data);
                      const delta = json.choices?.[0]?.delta?.content;
                      if (delta) controller.enqueue(encoder.encode(delta));
                    } catch {
                      // ignore partial JSON
                    }
                  }
                }
              } finally {
                controller.close();
              }
            },
          });

          return new Response(out, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-cache",
            },
          });
        } catch {
          return new Response("AI request failed", { status: 500 });
        }
      },
    },
  },
});
