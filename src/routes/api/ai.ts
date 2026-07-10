import { createFileRoute } from "@tanstack/react-router";
import { complete, type ChatMessage } from "@/lib/ai-gateway.server";

type Body = { system?: string; prompt?: string; messages?: ChatMessage[] };

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;

        let messages: ChatMessage[];
        if (body.messages && Array.isArray(body.messages)) {
          messages = body.messages;
        } else if (body.prompt) {
          messages = [
            ...(body.system ? [{ role: "system" as const, content: body.system }] : []),
            { role: "user" as const, content: body.prompt },
          ];
        } else {
          return new Response("Missing prompt", { status: 400 });
        }

        try {
          const text = await complete(messages);
          return Response.json({ text });
        } catch (err) {
          if (err instanceof Response) {
            const status = err.status;
            const msg =
              status === 429
                ? "The AI coach is busy right now. Please try again in a moment."
                : status === 402
                  ? "AI usage limit reached. Please add credits to continue."
                  : "AI request failed. Please try again.";
            return Response.json({ error: msg }, { status });
          }
          return Response.json({ error: "Unexpected error" }, { status: 500 });
        }
      },
    },
  },
});
