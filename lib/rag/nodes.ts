import { SimpleNodeParser, PDFReader, Document } from "llamaindex"
import VirtualFileSystem from "./virtual-file-stytem"

export const getDocuments = async (file: Blob) => {
  const fs = new VirtualFileSystem(file)
  const reader = new PDFReader()
  const documents = await reader.loadData("file.pdf", fs)

  return documents
}

export const getNodes = (documents: Document[]) => {
  const parser = SimpleNodeParser.fromDefaults({
    chunkSize: 1024,
    chunkOverlap: 20,
    includeMetadata: true,
    includePrevNextRel: true
  })

  const nodes = parser.getNodesFromDocuments(documents)

  return nodes
}
