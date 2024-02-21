import { OpenAI, BaseNode, MetadataMode, ChatMessage } from "llamaindex"
import metadataSchema from "./metadata-schema.json"

export const extractMetadata = async (nodes: BaseNode[]) => {
  const llm = new OpenAI({
    model: "gpt-4-0125-preview",
    temperature: 0.1,
    apiKey: process.env.OPENAI_API_KEY,
    additionalChatOptions: {
      response_format: {
        type: "json_object"
      }
    }
  })

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are an expert assistant for extracting metadata from documents.
Here is the JSON Schema instance your output must adhere to:

<schema>${JSON.stringify(metadataSchema)}</schema>
    `
    },
    {
      role: "user",
      content: `Here is the document I want to extract metadata from:

<content>
${nodes.map(node => node.getContent(MetadataMode.NONE)).join("\n")}
</content>`
    }
  ]

  const response = await llm.chat({ messages })
  const json = JSON.parse(response.message.content)

  return json
}
