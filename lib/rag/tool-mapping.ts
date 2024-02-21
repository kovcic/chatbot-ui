import { BaseNode, BaseObjectNodeMapping, Metadata, TextNode } from "llamaindex"
import { createDocumentTool } from "./tools"

class ToolMapping extends BaseObjectNodeMapping {
  _fromNode(node: BaseNode<Metadata>) {
    if (!node.metadata) {
      throw new Error("Metadata must be set")
    }

    const { id, title, summary } = node.metadata
    const tool = createDocumentTool(id, title, summary)

    return tool
  }

  fromObjects<OT>(objs: OT[], ...args: any[]): BaseObjectNodeMapping {
    throw new Error("Method not implemented.")
  }

  objNodeMapping(): Record<any, any> {
    throw new Error("Method not implemented.")
  }

  toNode(obj: any): TextNode<Metadata> {
    throw new Error("Method not implemented.")
  }

  _addObj(obj: any): void {
    throw new Error("Method not implemented.")
  }

  persist(persistDir: string, objNodeMappingFilename: string): void {
    throw new Error("Method not implemented.")
  }
}

export default ToolMapping
