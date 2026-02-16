import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
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

  console.log("OpenRouter route hit", {
    model: chatSettings.model,
    assistantMessageId
  })

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.openrouter_api_key, "OpenRouter")

    const openrouter = createOpenRouter({
      apiKey: profile.openrouter_api_key || "",
      headers: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "https://chatbotui.com",
        "X-Title": "Chatbot UI"
      }
    })

    // Filter out empty messages and ensure strictly typed roles
    const sanitizedMessages = messages
      .filter(m => m.content && String(m.content).trim() !== "")
      .map(m => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content
      }))

    console.log(
      "Sanitized Messages (OpenRouter):",
      JSON.stringify(sanitizedMessages, null, 2)
    )

    console.log("Calling streamText (OpenRouter)...")
    const result = await streamText({
      model: openrouter(chatSettings.model) as any,
      messages: sanitizedMessages,
      temperature: chatSettings.temperature,
      maxOutputTokens:
        CHAT_SETTING_LIMITS[chatSettings.model]?.MAX_TOKEN_OUTPUT_LENGTH || 4096
      // onFinish: async ({ usage }) => {
      //   console.log("streamText onFinish triggered (OpenRouter)", { usage })
      //   // Token tracking is now handled by the client via the Data Stream Protocol
      // }
    })

    console.log("streamText result obtained (OpenRouter), sending response...")
    return createDataStreamResponse(result)
  } catch (error: any) {
    console.error("OpenRouter Route Error:", error)
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "OpenRouter API Key not found. Please set it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
