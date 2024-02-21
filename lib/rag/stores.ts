import {
  QdrantVectorStore,
  SimpleDocumentStore,
  SimpleIndexStore
} from "llamaindex"
import { MongoKVStore } from "./store/mongo-kvstore"
import KVDocumentStore from "./store/kv-document-store"
import { KVIndexStore } from "./store/kv-index-store"

export const createVectorStore = (collectionName: string) => {
  const vectorStore = new QdrantVectorStore({
    url: "http://localhost:6333",
    collectionName
  })

  return vectorStore
}

export const createDocumentStore = async (collectionName: string) => {
  const kvstore = new MongoKVStore("mongodb://localhost:27017", "docstore")
  const store = new KVDocumentStore(kvstore, collectionName)

  return store
}

export const createIndexStore = async (collectionName: string) => {
  const kvstore = new MongoKVStore("mongodb://localhost:27017", "index_store")
  const store = new KVIndexStore(kvstore, collectionName)

  return store
}
