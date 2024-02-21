import { Tables, TablesInsert } from "@/supabase/types"
import { FunctionTool, Metadata, TextNode } from "llamaindex"
import _ from "lodash"
import { createDocumentAgent } from "./agents"

const getToolSchema = (
  description: string,
  parameters: FunctionTool["metadata"]["parameters"]
) => {
  return JSON.stringify({
    $schema: "http://json-schema.org/draft-07/schema#",
    additionalProperties: false,
    description,
    type: "object",
    parameters
  })
}

export const convertToolToNode = (tool: FunctionTool, metadata: Metadata) => {
  let nodeText = `Tool name: ${tool.metadata.name}\nTool description: ${tool.metadata.description}\n`

  if (tool.metadata.parameters) {
    nodeText += `Tool schema: ${getToolSchema("", tool.metadata.parameters)}\n`
  }

  return new TextNode<any>({
    text: nodeText,
    metadata,
    excludedEmbedMetadataKeys: _.keys(metadata)
  })
}

export const createDocumentTool = (
  id: string,
  title: string,
  summary: string
) => {
  // arguments to function are passed as an object
  const answerQuestion = async ({ question }: { question: string }) => {
    const agent = await createDocumentAgent(id, title)
    const answer = await agent.query({ query: question })

    return answer.response
  }

  const name = `tool_${id}`
  const description = _.truncate(
    `Use this tool if you want to answer any questions about '${title}' having the following summary: \n\n ${summary}`,
    { length: 1024, omission: "..." }
  )

  const tool = FunctionTool.fromDefaults(answerQuestion, {
    name,
    description,
    parameters: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "The question to answer"
        }
      }
    }
  })

  return tool
}
