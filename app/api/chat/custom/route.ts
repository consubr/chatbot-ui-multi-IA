import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { Database } from "@/supabase/types"
import { ChatSettings } from "@/types"
import { createClient } from "@supabase/supabase-js"
import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, customModelId, assistantMessageId } =
    json as {
      chatSettings: ChatSettings
      messages: any[]
      customModelId: string
      assistantMessageId: string
    }

  console.log("Custom route hit", {
    model: chatSettings.model,
    customModelId,
    assistantMessageId
  })

  try {
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: customModel, error } = await supabaseAdmin
      .from("models")
      .select("*")
      .eq("id", customModelId)
      .single()

    if (!customModel) {
      throw new Error(error ? error.message : "Model not found")
    }

    const custom = createOpenAI({
      apiKey: customModel.api_key || "",
      baseURL: customModel.base_url || undefined
    })

    const sanitizedMessages = messages
      .filter(m => m.content && String(m.content).trim() !== "")
      .map(m => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content
      }))

    console.log(
      "Sanitized Messages (Custom):",
      JSON.stringify(sanitizedMessages, null, 2)
    )

    console.log("Calling streamText (Custom)...")
    const result = await streamText({
      model: custom(chatSettings.model),
      messages: sanitizedMessages,
      temperature: chatSettings.temperature,
      maxOutputTokens:
        CHAT_SETTING_LIMITS[chatSettings.model]?.MAX_TOKEN_OUTPUT_LENGTH ||
        4096,
      onFinish: async ({ usage }) => {
        console.log("streamText onFinish triggered (Custom)", { usage })
        const { inputTokens, outputTokens } = usage
        const cookieStore = cookies()
        const supabaseServer = createServerClient(cookieStore)

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

    console.log("streamText result obtained (Custom), sending response...")

    return createDataStreamResponse(result)
  } catch (error: any) {
    console.error("Custom Route Error:", error)
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Custom API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "Custom API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
