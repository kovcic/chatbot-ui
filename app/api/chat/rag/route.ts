import { createTopAgent } from "@/lib/rag/agents"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { ServerRuntime } from "next"
import lodash from "lodash"

export const runtime: ServerRuntime = "nodejs"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, collectionId } = json as {
    chatSettings: ChatSettings
    messages: any[]
    collectionId: string
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.openai_api_key, "OpenAI")

    if (!collectionId) {
      throw new Error("Collection ID not found")
    }

    // ignoring the first message which is the system message
    const rest = lodash.tail(messages)
    const message = lodash.last(rest).content
    const chatHistory = lodash.initial(rest)
    const agent = await createTopAgent(collectionId, chatHistory)

    const chatResponse = await agent.chat({ message })
    // TODO check if it can be streamed

    return new Response(chatResponse.response, {
      headers: { "Content-Type": "text/plain" }
    })
  } catch (error: any) {
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

export const maxDuration = 300
