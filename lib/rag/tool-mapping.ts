import { BaseNode, BaseObjectNodeMapping, Metadata, TextNode } from "llamaindex"
import { createDocumentTool } from "./tools"
import { AgentOptions } from "@/types"

class ToolMapping extends BaseObjectNodeMapping {
  private options: AgentOptions

  constructor(options: AgentOptions) {
    super()
    this.options = options
  }

  _fromNode(node: BaseNode<Metadata>) {
    const id = node.sourceNode?.nodeId
    if (!id || !node.metadata) {
      throw new Error("No source id and/or metadata missing")
    }

    const { title, summary } = node.metadata
    const tool = createDocumentTool(id, title, summary, this.options)

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
