import {
  serviceContextFromDefaults,
  SimpleNodeParser,
  OpenAI,
  OpenAIEmbedding
} from "llamaindex"

export const createServiceContext = () => {
  const serviceContext = serviceContextFromDefaults({
    llm: new OpenAI({
      model: "gpt-4-0125-preview",
      temperature: 0.1,
      apiKey: process.env.OPENAI_API_KEY
    }),
    // llm: new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1, apiKey: process.env.OPENAI_API_KEY }),
    embedModel: new OpenAIEmbedding({
      model: "text-embedding-ada-002",
      apiKey: process.env.OPENAI_API_KEY
    }),
    nodeParser: new SimpleNodeParser({
      chunkSize: 1024,
      chunkOverlap: 20
    }),
    chunkSize: 1024,
    chunkOverlap: 20
  })

  return serviceContext
}
