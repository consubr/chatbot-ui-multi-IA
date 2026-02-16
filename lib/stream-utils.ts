import { StreamTextResult } from "ai"

/**
 * Creates a Response with AI SDK v3 Data Stream format.
 * Formats text chunks with "0:" prefix for client compatibility.
 *
 * @param result - The StreamTextResult from streamText()
 * @returns Response with properly formatted stream
 */
export function createDataStreamResponse(
  result: StreamTextResult<any, any>
): Response {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const reader = result.textStream.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          // Format each chunk with the "0:" prefix as expected by the client
          const formattedChunk = `0:${JSON.stringify(value)}\n`
          controller.enqueue(encoder.encode(formattedChunk))
        }
      } catch (error) {
        controller.error(error)
      } finally {
        // After the stream is complete, we try to get the usage data
        try {
          // result.usage is a Promise that resolves when the stream finishes
          const usage = await result.usage

          // We send the usage data as a "Data" part (prefix "2:" or "d:")
          // The client (use-chat-handler) will parse this to save token counts
          // Format: 2: JSON\n

          // Using "d:" attempting to follow Vercel AI SDK protocol for data
          const dataChunk = `d:${JSON.stringify({ usage })}\n`
          controller.enqueue(encoder.encode(dataChunk))
        } catch (e) {
          // Ignore if usage is not available
        }

        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  })
}
