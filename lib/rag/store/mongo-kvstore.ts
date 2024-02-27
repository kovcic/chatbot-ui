import { MongoClient, Document } from "mongodb"
import { BaseKVStore } from "llamaindex"

const DEFAULT_COLLECTION = "documents"

type StoreValue = Document & {
  _id: string
  value: any
}

export class MongoKVStore extends BaseKVStore {
  private client: MongoClient
  private dbName: string

  constructor(connectionString: string, dbName: string) {
    super()
    this.client = new MongoClient(connectionString)
    this.dbName = dbName
  }

  getCollection(collectionName: string = DEFAULT_COLLECTION) {
    return this.client.db(this.dbName).collection<StoreValue>(collectionName)
  }

  async dropCollection(collectionName: string = DEFAULT_COLLECTION) {
    try {
      const res = await this.client
        .db(this.dbName)
        .dropCollection(collectionName)

      return res
    } catch (e: any) {
      if (e.message === "ns not found") {
        return true
      }

      throw e
    }
  }

  async put(
    key: string,
    value: any,
    collectionName: string = DEFAULT_COLLECTION
  ): Promise<void> {
    const collection = this.getCollection(collectionName)

    await collection.insertOne({ _id: key, value })
  }

  async get(
    key: string,
    collectionName: string = DEFAULT_COLLECTION
  ): Promise<any> {
    const collection = this.getCollection(collectionName)
    const document = await collection.findOne({ _id: key })

    return document?.value
  }

  async delete(
    key: string,
    collectionName: string = DEFAULT_COLLECTION
  ): Promise<boolean> {
    const collection = this.getCollection(collectionName)

    const result = await collection.deleteOne({ _id: key })

    return result.acknowledged
  }

  async getAll(
    collectionName: string = DEFAULT_COLLECTION
  ): Promise<Record<string, any>> {
    const collection = this.getCollection(collectionName)
    const documents = await collection.find().toArray()

    let res: Record<string, any> = {}

    documents.forEach(document => {
      res[document._id] = document.value
    })

    return res
  }
}
