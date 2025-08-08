import { NextRequest } from "next/server";
import { fetchRealTokens } from "@/lib/integrations/real-pump-api";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Fetch real initial data
        const initialTokens = await fetchRealTokens();

        const initialData = `data: ${JSON.stringify({
          type: "initial",
          tokens: initialTokens,
        })}\n\n`;
        controller.enqueue(encoder.encode(initialData));

        // Set up interval to fetch fresh data periodically
        const interval = setInterval(async () => {
          try {
            const updatedTokens = await fetchRealTokens();

            const updateData = `data: ${JSON.stringify({
              type: "update",
              tokens: updatedTokens,
              timestamp: Date.now(),
            })}\n\n`;

            controller.enqueue(encoder.encode(updateData));
          } catch (error) {
            console.error("Error fetching updated tokens:", error);
          }
        }, 10000); // Update every 10 seconds

        // Clean up on close
        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      } catch (error) {
        console.error("Error in SSE stream:", error);
        const errorData = `data: ${JSON.stringify({
          type: "error",
          message: "Failed to fetch token data",
        })}\n\n`;
        controller.enqueue(encoder.encode(errorData));
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
