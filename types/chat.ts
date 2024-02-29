import { Tables } from "@/supabase/types"
import { ChatMessage, LLMID } from "."

export interface ChatSettings {
  model: LLMID
  prompt: string
  temperature: number
  similarityTopK: number | undefined
  contextLength: number
  includeProfileContext: boolean
  includeWorkspaceInstructions: boolean
  embeddingsProvider: "openai" | "local"
  collectionId: string | undefined
  docAgentModel: LLMID | undefined
  docAgentTemperature: number | undefined
  docAgentSimilarityTopK: number | undefined
}

export interface ChatPayload {
  chatSettings: ChatSettings
  workspaceInstructions: string
  chatMessages: ChatMessage[]
  assistant: Tables<"assistants"> | null
  messageFileItems: Tables<"file_items">[]
  chatFileItems: Tables<"file_items">[]
}

export interface ChatAPIPayload {
  chatSettings: ChatSettings
  messages: Tables<"messages">[]
}
