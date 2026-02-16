import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { createClient } from "@/lib/supabase/server"
import { createDataStreamResponse } from "@/lib/stream-utils"
import { cookies } from "next/headers"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, assistantMessageId } = json as {
    chatSettings: ChatSettings
    messages: any[]
    assistantMessageId: string
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.perplexity_api_key, "Perplexity")

    // Perplexity is compatible the OpenAI SDK
    const perplexity = createOpenAI({
      apiKey: profile.perplexity_api_key || "",
      baseURL: "https://api.perplexity.ai/"
    })

    const result = await streamText({
      model: perplexity(chatSettings.model),
      messages,
      onFinish: async ({ usage }) => {
        // Token tracking is now handled by the client via the Data Stream Protocol
      }
    })

    return createDataStreamResponse(result)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Perplexity API Key not found. Please set it in your profile settings."
    } else if (errorCode === 401) {
      errorMessage =
        "Perplexity API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
