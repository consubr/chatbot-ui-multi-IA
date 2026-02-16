import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { google } from "@ai-sdk/google"
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

    checkApiKey(profile.google_gemini_api_key, "Google")

    const result = await streamText({
      model: google(chatSettings.model),
      messages,
      temperature: chatSettings.temperature,
      onFinish: async ({ usage }) => {
        const { inputTokens, outputTokens } = usage
        const cookieStore = cookies()
        const supabaseServer = createClient(cookieStore)

        await supabaseServer
          .from("messages")
          .update({
            prompt_tokens: inputTokens,
            completion_tokens: outputTokens,
            total_tokens: (inputTokens || 0) + (outputTokens || 0)
          })
          .eq("id", assistantMessageId)
      }
    })

    return createDataStreamResponse(result)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Google Gemini API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("api key not valid")) {
      errorMessage =
        "Google Gemini API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
