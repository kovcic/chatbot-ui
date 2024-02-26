import { getVectorIndex } from "./vector-index"
import { getSummaryIndex } from "./summary-index"
import {
  OpenAI,
  OpenAIAgent,
  QueryEngineTool,
  ObjectRetriever,
  ChatMessage,
  Metadata
} from "llamaindex"
import ToolMapping from "./tool-mapping"
import { convertToolToNode, createDocumentTool } from "./tools"

export const createDocumentAgent = async (
  id: string,
  title: string,
  chatHistory: ChatMessage[] = []
) => {
  const vectorIndex = await getVectorIndex(id)
  const summaryIndex = await getSummaryIndex(id)

  const vectorQueryEngine = vectorIndex.asQueryEngine()
  const summaryQueryEngine = summaryIndex.asQueryEngine()

  const tools = [
    new QueryEngineTool({
      queryEngine: vectorQueryEngine,
      metadata: {
        name: "vector_tool",
        description: `Useful for questions related to specific aspects of "${title}."`
      }
    }),
    new QueryEngineTool({
      queryEngine: summaryQueryEngine,
      metadata: {
        name: "summary_tool",
        description: `Useful for any requests that require a holistic summary of EVERYTHING about "${title}".`
      }
    })
  ]
  const llm = new OpenAI({
    model: "gpt-4-0125-preview",
    temperature: 0.1,
    apiKey: process.env.OPENAI_API_KEY
  })
  // const llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1, apiKey: process.env.OPENAI_API_KEY });
  const systemPrompt = `You are a specialized agent designed to answer queries about: ${title}.\nYou must ALWAYS use at least one of the tools provided when answering a question; do NOT rely on prior knowledge.`

  const agent = new OpenAIAgent({
    tools,
    llm,
    prefixMessages: [
      {
        content: systemPrompt,
        role: "system"
      },
      ...chatHistory
    ]
    // verbose: true
  })

  return agent
}

export const createTopAgent = async (
  id: string,
  chatHistory: ChatMessage[] = []
) => {
  const index = await getVectorIndex(id)
  const toolMapping = new ToolMapping()
  const toolRetriever = new ObjectRetriever(index.asRetriever(), toolMapping)

  const llm = new OpenAI({
    model: "gpt-4-0125-preview",
    temperature: 0.1,
    apiKey: process.env.OPENAI_API_KEY
  })
  // const llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1, apiKey: process.env.OPENAI_API_KEY });
  const systemPrompt =
    "You are an agent designed to answer queries about a set of given documents.\nPlease always use the tools provided to answer a question. Do not rely on prior knowledge."

  const agent = new OpenAIAgent({
    llm,
    prefixMessages: [
      {
        content: systemPrompt,
        role: "system"
      },
      ...chatHistory
    ],
    tools: [], // required by type
    toolRetriever
    // verbose: true
  })

  return agent
}

export const addDocumentToTopAgent = async (
  id: string,
  document: { id: string; metadata: Metadata }
) => {
  const tool = createDocumentTool(document.id, document.metadata)
  const node = convertToolToNode(tool, document.metadata)

  const index = await getVectorIndex(id)
  index.insertNodes([node])
}

export const removeDocumentFromTopAgent = async (
  id: string,
  documentId: string
) => {
  const index = await getVectorIndex(id)

  // TODO get nodes with metadata.id === documentId
  // remove them from the index
}
