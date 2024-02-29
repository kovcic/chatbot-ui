import { FileIcon } from "@/components/ui/file-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FILE_DESCRIPTION_MAX, FILE_NAME_MAX } from "@/db/limits"
import { getFileFromStorage } from "@/db/storage/files"
import { Tables } from "@/supabase/types"
import { FC, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"

interface FileItemProps {
  file: Tables<"files">
}

export const FileItem: FC<FileItemProps> = ({ file }) => {
  const [name, setName] = useState(file.name)
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState(file.description)

  const getLinkAndView = async () => {
    const link = await getFileFromStorage(file.file_path)
    window.open(link, "_blank")
  }

  return (
    <SidebarItem
      item={file}
      isTyping={isTyping}
      contentType="files"
      icon={<FileIcon type={file.type} size={30} />}
      updateState={{ name }}
      renderInputs={() => (
        <>
          <div
            className="cursor-pointer underline hover:opacity-50"
            onClick={getLinkAndView}
          >
            View {file.name}
          </div>

          <div className="flex flex-col justify-between">
            <div>{file.type}</div>

            <div>{formatFileSize(file.size)}</div>

            <div>{file.tokens.toLocaleString()} tokens</div>
          </div>

          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="File name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={FILE_NAME_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>

            <Input
              placeholder="File description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={FILE_DESCRIPTION_MAX}
            />
          </div>

          {file.document_agent && (
            <>
              <div className="space-y-1">
                <Label>Processing status: {file.run_status}</Label>
              </div>
              <div className="space-y-1">
                <Label>
                  Date: {(file.metadata as Record<string, any>)?.date || "n/a"}
                </Label>
              </div>
              <div className="space-y-1">
                <Label>
                  Document type:{" "}
                  {(file.metadata as Record<string, any>)?.document_type}
                </Label>
              </div>
              <div className="space-y-1">
                <Label>Title</Label>
                <p>{(file.metadata as Record<string, any>)?.title}</p>
              </div>
              <div className="space-y-1">
                <Label>Summary</Label>
                <p>{(file.metadata as Record<string, any>)?.summary}</p>
              </div>
              <div className="space-y-1">
                <Label>Key takeways</Label>
                <p>{(file.metadata as Record<string, any>)?.key_takeways}</p>
              </div>
              <div className="space-y-1">
                <Label>Topics</Label>
                <p>
                  {(file.metadata as Record<string, any>)?.topics_covered?.join(
                    ", "
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <Label>Entitites</Label>
                <p>
                  {(
                    file.metadata as Record<string, any>
                  )?.entities_covered?.join(", ")}
                </p>
              </div>
            </>
          )}
        </>
      )}
    />
  )
}

export const formatFileSize = (sizeInBytes: number): string => {
  let size = sizeInBytes
  let unit = "bytes"

  if (size >= 1024) {
    size /= 1024
    unit = "KB"
  }

  if (size >= 1024) {
    size /= 1024
    unit = "MB"
  }

  if (size >= 1024) {
    size /= 1024
    unit = "GB"
  }

  return `${size.toFixed(2)} ${unit}`
}
