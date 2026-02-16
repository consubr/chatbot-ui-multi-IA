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
