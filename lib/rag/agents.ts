import { getVectorIndex, createVectorIndex } from "./vector-index"
import { getSummaryIndex } from "./summary-index"
import {
  OpenAI,
  OpenAIAgent,
  QueryEngineTool,
  ObjectRetriever,
  ChatMessage,
  Metadata,
  Document,
  NodeRelationship,
  RetrieverQueryEngine,
  SummaryRetrieverMode
} from "llamaindex"
import ToolMapping from "./tool-mapping"
import { convertToolToNode, createDocumentTool } from "./tools"
import _ from "lodash"
import { AgentOptions } from "@/types"
import { DOCUMENT_AGENT_PROMPT, TOP_AGENT_PROMPT } from "./constants"

export const createDocumentAgent = async (
  id: string,
  title: string,
  chatHistory: ChatMessage[] = [],
  options: AgentOptions = {}
) => {
  const vectorIndex = await getVectorIndex(id)
  const summaryIndex = await getSummaryIndex(id)

  const vectorIndexRetriever = vectorIndex.asRetriever({
    similarityTopK: options.similarityTopK
  })
  const summaryIndexRetriever = summaryIndex.asRetriever({
    mode: SummaryRetrieverMode.DEFAULT
  })

  const vectorQueryEngine = vectorIndex.asQueryEngine({
    retriever: vectorIndexRetriever
  })
  const summaryQueryEngine = summaryIndex.asQueryEngine({
    retriever: summaryIndexRetriever
  })

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
    model: options.model || "gpt-4-0125-preview",
    temperature: options.temperature || 0.1,
    apiKey: process.env.OPENAI_API_KEY
  })
  // const llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1, apiKey: process.env.OPENAI_API_KEY });
  const systemPrompt = (options.prompt || DOCUMENT_AGENT_PROMPT).replace(
    "{title}",
    title
  )

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
  chatHistory: ChatMessage[] = [],
  options: AgentOptions = {},
  documentAgentOptions: AgentOptions = {}
) => {
  const index = await getVectorIndex(id)
  const toolMapping = new ToolMapping(documentAgentOptions)
  const toolRetriever = new ObjectRetriever(
    index.asRetriever({ similarityTopK: options.similarityTopK }),
    toolMapping
  )

  const llm = new OpenAI({
    model: options.model || "gpt-4-0125-preview",
    temperature: options.temperature ?? 0.1,
    apiKey: process.env.OPENAI_API_KEY
  })

  const systemPrompt = options.prompt || TOP_AGENT_PROMPT

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
  document: { id: string; metadata: Metadata },
  createIndex: boolean = false
) => {
  const { title, summary } = document.metadata
  const tool = createDocumentTool(document.id, title, summary)
  const node = convertToolToNode(tool)

  // Add the document as a related node to the tool
  const refDoc = new Document({ id_: document.id, metadata: document.metadata })
  node.relationships[NodeRelationship.SOURCE] = refDoc.asRelatedNodeInfo()

  node.metadata = {
    ...node.metadata,
    ...document.metadata
  }
  node.excludedEmbedMetadataKeys = [
    ...node.excludedEmbedMetadataKeys,
    ..._.keys(_.omit(document.metadata, ["title", "summary", "key_takeways"]))
  ]

  if (createIndex) {
    await createVectorIndex(id, [node])
  } else {
    const index = await getVectorIndex(id)
    index.insertNodes([node])
  }
}

export const removeDocumentFromTopAgent = async (
  id: string,
  documentId: string
) => {
  const index = await getVectorIndex(id)

  await index.deleteRefDoc(documentId, false)
}
