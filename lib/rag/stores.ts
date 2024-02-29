import { QdrantVectorStore } from "llamaindex"
import { MongoKVStore } from "./store/mongo-kvstore"
import KVDocumentStore from "./store/kv-document-store"
import { KVIndexStore } from "./store/kv-index-store"

export const createVectorStore = (collectionName: string) => {
  const vectorStore = new QdrantVectorStore({
    url: process.env.QDRANT_API_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName
  })

  return vectorStore
}

export const createDocumentStore = async (collectionName: string) => {
  const kvstore = new MongoKVStore(process.env.MONGODB_URI!, "docstore")
  const store = new KVDocumentStore(kvstore, collectionName)

  return store
}

export const createIndexStore = async (collectionName: string) => {
  const kvstore = new MongoKVStore(process.env.MONGODB_URI!, "index_store")
  const store = new KVIndexStore(kvstore, collectionName)

  return store
}
