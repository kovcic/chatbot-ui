import {
  storageContextFromDefaults,
  SummaryIndex,
  Document,
  ServiceContext,
  StorageContext
} from "llamaindex"
import { createDocumentStore, createIndexStore } from "./stores"
import { createServiceContext } from "./service-context"

type Options = {
  serviceContext?: ServiceContext
  storageContext?: StorageContext
}

export const createSummaryIndex = async (
  name: string,
  documents: Document[],
  options?: Options
) => {
  const serviceContext = options?.serviceContext || createServiceContext()
  const docStore = await createDocumentStore(name)
  const indexStore = await createIndexStore(name)
  const storageContext =
    options?.storageContext ||
    (await storageContextFromDefaults({
      docStore,
      indexStore
    }))

  // NOTE: this is not working as it's inserting document hash into the docstore, which is not required
  // const index = await SummaryIndex.fromDocuments(documents, {
  //   serviceContext,
  //   storageContext
  // })

  // WORKAROUND
  docStore.addDocuments(documents, true)

  const nodes = serviceContext.nodeParser.getNodesFromDocuments(documents)
  const index = await SummaryIndex.init({
    nodes,
    storageContext,
    serviceContext
  })

  return index
}

export const getSummaryIndex = async (name: string, options?: Options) => {
  const serviceContext = options?.serviceContext || createServiceContext()
  const docStore = await createDocumentStore(name)
  const indexStore = await createIndexStore(name)
  const storageContext =
    options?.storageContext ||
    (await storageContextFromDefaults({
      docStore,
      indexStore
    }))

  const index = await SummaryIndex.init({ serviceContext, storageContext })

  return index
}

export const deleteSummaryIndex = async (name: string) => {
  const docStore = await createDocumentStore(name)
  const indexStore = await createIndexStore(name)

  await docStore.destroy()
  await indexStore.destroy()
}
