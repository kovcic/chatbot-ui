import { InMemoryFileSystem } from "llamaindex"

class VirtualFileSystem extends InMemoryFileSystem {
  private file: Blob

  constructor(file: Blob) {
    super()

    this.file = file
  }

  readRawFile(path: string): Promise<Buffer> {
    const arrayBuffer = this.file.arrayBuffer()

    // @ts-expect-error
    return Promise.resolve(arrayBuffer)
  }
}

export default VirtualFileSystem
