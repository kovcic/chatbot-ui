import {
  VectorStoreIndex,
  storageContextFromDefaults,
  BaseNode
} from "llamaindex"
import { createVectorStore } from "./stores"
import { createServiceContext } from "./service-context"

export const createVectorIndex = async (
  name: string,
  nodes: BaseNode[] = []
) => {
  const serviceContext = createServiceContext()
  const vectorStore = createVectorStore(name)
  const storageContext = await storageContextFromDefaults({ vectorStore })

  const index = await VectorStoreIndex.init({
    nodes,
    serviceContext,
    storageContext
  })

  return index
}

export const getVectorIndex = async (name: string) => {
  const serviceContext = createServiceContext()
  const vectorStore = createVectorStore(name)

  const index = await VectorStoreIndex.fromVectorStore(
    vectorStore,
    serviceContext
  )

  return index
}

export const deleteVectorIndex = async (name: string) => {
  const vectorStore = createVectorStore(name)

  await vectorStore.db.deleteCollection(name)
}
