import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { createAzure } from "@ai-sdk/azure"
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

  console.log("Azure route hit", {
    model: chatSettings.model,
    assistantMessageId
  })

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.azure_openai_api_key, "Azure OpenAI")

    const ENDPOINT = profile.azure_openai_endpoint
    const KEY = profile.azure_openai_api_key

    let DEPLOYMENT_ID = ""
    switch (chatSettings.model) {
      case "gpt-3.5-turbo":
        DEPLOYMENT_ID = profile.azure_openai_35_turbo_id || ""
        break
      case "gpt-4-turbo-preview":
        DEPLOYMENT_ID = profile.azure_openai_45_turbo_id || ""
        break
      case "gpt-4-vision-preview":
        DEPLOYMENT_ID = profile.azure_openai_45_vision_id || ""
        break
      default:
        return new Response(JSON.stringify({ message: "Model not found" }), {
          status: 400
        })
    }

    if (!ENDPOINT || !KEY || !DEPLOYMENT_ID) {
      return new Response(
        JSON.stringify({ message: "Azure resources not found" }),
        {
          status: 400
        }
      )
    }

    const azure = createAzure({
      apiKey: KEY,
      resourceName: ENDPOINT.replace("https://", "").split(".")[0]
    })

    const sanitizedMessages = messages
      .filter(m => m.content && String(m.content).trim() !== "")
      .map(m => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content
      }))

    console.log(
      "Sanitized Messages (Azure):",
      JSON.stringify(sanitizedMessages, null, 2)
    )

    console.log("Calling streamText (Azure)...")
    const result = await streamText({
      model: azure(DEPLOYMENT_ID),
      messages: sanitizedMessages,
      temperature: chatSettings.temperature,
      maxOutputTokens:
        CHAT_SETTING_LIMITS[chatSettings.model]?.MAX_TOKEN_OUTPUT_LENGTH ||
        4096,
      onFinish: async ({ usage }) => {
        console.log("streamText onFinish triggered (Azure)", { usage })
        // Token tracking is now handled by the client via the Data Stream Protocol
      }
    })

    console.log("streamText result obtained (Azure), sending response...")

    return createDataStreamResponse(result)
  } catch (error: any) {
    console.error("Azure Route Error:", error)
    const errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
