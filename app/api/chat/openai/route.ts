import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { ServerRuntime } from "next"
import { createClient } from "@/lib/supabase/server"
import { createDataStreamResponse } from "@/lib/stream-utils"
import { cookies } from "next/headers"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, assistantMessageId } = json as {
    chatSettings: ChatSettings
    messages: any[]
    assistantMessageId: string
  }

  console.log("OpenAI route hit", {
    model: chatSettings.model,
    assistantMessageId
  })

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = createOpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id || undefined
    })

    const sanitizedMessages = messages
      .filter(m => m.content && m.content.trim() !== "")
      .map(m => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content
      }))

    console.log(
      "Sanitized Messages:",
      JSON.stringify(sanitizedMessages, null, 2)
    )

    console.log("Calling streamText...")
    const result = await streamText({
      model: openai(chatSettings.model),
      messages: sanitizedMessages,
      temperature: chatSettings.temperature,
      maxOutputTokens:
        CHAT_SETTING_LIMITS[chatSettings.model]?.MAX_TOKEN_OUTPUT_LENGTH ||
        4096,
      onFinish: async ({ usage }) => {
        console.log("streamText onFinish triggered", { usage })
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

    console.log("streamText result obtained, sending response...")

    return createDataStreamResponse(result)
  } catch (error: any) {
    console.error("OpenAI Route Error:", error)
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "OpenAI API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "OpenAI API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
