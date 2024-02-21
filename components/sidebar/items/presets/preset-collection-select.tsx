import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { FileIcon } from "@/components/ui/file-icon"
import { Input } from "@/components/ui/input"
import { ChatbotUIContext } from "@/context/context"
import { PresetCollection } from "@/types"
import {
  IconBooks,
  IconChevronDown,
  IconCircleCheckFilled
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"

interface PresetCollectionSelectProps {
  selectedPresetCollection: PresetCollection | undefined
  onPresetCollectionSelect: (collection: PresetCollection | undefined) => void
}

export const PresetCollectionSelect: FC<PresetCollectionSelectProps> = ({
  selectedPresetCollection,
  onPresetCollectionSelect
}) => {
  const { collections } = useContext(ChatbotUIContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // FIX: hacky
    }
  }, [isOpen])

  const handleCollectionSelect = (collection: PresetCollection) => {
    if (collection.id === selectedPresetCollection?.id) {
      onPresetCollectionSelect(undefined)
    } else {
      onPresetCollectionSelect(collection)
    }
  }

  if (!collections) return null

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
        setSearch("")
      }}
    >
      <DropdownMenuTrigger
        className="bg-background w-full justify-start border-2 px-3 py-5"
        asChild
      >
        <Button
          ref={triggerRef}
          className="flex items-center justify-between"
          variant="ghost"
        >
          <div className="flex items-center">
            <div className="ml-2 flex items-center">
              {selectedPresetCollection
                ? selectedPresetCollection.name
                : "Select collection"}
            </div>
          </div>

          <IconChevronDown />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        style={{ width: triggerRef.current?.offsetWidth }}
        className="space-y-2 overflow-auto p-2"
        align="start"
      >
        <Input
          ref={inputRef}
          placeholder="Search collection..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.stopPropagation()}
        />

        {collections
          .filter(
            collection =>
              collection.top_agent &&
              collection.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(collection => (
            <PresetCollectionItem
              key={collection.id}
              collection={collection}
              selected={selectedPresetCollection?.id === collection.id}
              onSelect={handleCollectionSelect}
            />
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface CollectionFileItemProps {
  collection: PresetCollection
  selected: boolean
  onSelect: (collection: PresetCollection) => void
}

const PresetCollectionItem: FC<CollectionFileItemProps> = ({
  collection,
  selected,
  onSelect
}) => {
  const handleSelect = () => {
    onSelect(collection)
  }

  return (
    <div
      className="flex cursor-pointer items-center justify-between py-0.5 hover:opacity-50"
      onClick={handleSelect}
    >
      <div className="flex grow items-center truncate">
        <div className="mr-2 min-w-[24px]">
          <IconBooks size={24} />
        </div>

        <div className="truncate">{collection.name}</div>
      </div>

      {selected && (
        <IconCircleCheckFilled size={20} className="min-w-[30px] flex-none" />
      )}
    </div>
  )
}
