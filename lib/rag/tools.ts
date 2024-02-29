import { FunctionTool, TextNode } from "llamaindex"
import _ from "lodash"
import { createDocumentAgent } from "./agents"
import { AgentOptions } from "@/types"

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

export const convertToolToNode = (tool: FunctionTool) => {
  let nodeText = `Tool name: ${tool.metadata.name}\nTool description: ${tool.metadata.description}\n`

  if (tool.metadata.parameters) {
    nodeText += `Tool schema: ${getToolSchema("", tool.metadata.parameters)}\n`
  }

  return new TextNode<any>({
    text: nodeText
  })
}

export const createDocumentTool = (
  id: string,
  title: string,
  summary: string,
  options: AgentOptions = {}
) => {
  // arguments to function are passed as an object
  const answerQuestion = async ({ question }: { question: string }) => {
    const agent = await createDocumentAgent(id, title, [], options)
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
