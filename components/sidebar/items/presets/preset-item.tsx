import { ModelIcon } from "@/components/models/model-icon"
import { ChatSettingsForm } from "@/components/ui/chat-settings-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PRESET_NAME_MAX } from "@/db/limits"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { Tables } from "@/supabase/types"
import { FC, useContext, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"
import { PresetCollection } from "@/types"
import { PresetCollectionSelect } from "./preset-collection-select"
import { ChatbotUIContext } from "@/context/context"
import { AgentSettingsForm } from "@/components/ui/agent-settings-form"

interface PresetItemProps {
  preset: Tables<"presets">
}

export const PresetItem: FC<PresetItemProps> = ({ preset }) => {
  const [name, setName] = useState(preset.name)
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState(preset.description)
  const [presetChatSettings, setPresetChatSettings] = useState({
    model: preset.model,
    prompt: preset.prompt,
    temperature: preset.temperature,
    contextLength: preset.context_length,
    includeProfileContext: preset.include_profile_context,
    includeWorkspaceInstructions: preset.include_workspace_instructions,
    collectionId: preset.collection_id || undefined,
    similarityTopK: preset.similarity_top_k ?? (2 as number | undefined),
    docAgentModel: preset.doc_agent_model || undefined,
    docAgentTemperature:
      preset.doc_agent_temperature ?? (1 as number | undefined),
    docAgentSimilarityTopK:
      preset.doc_agent_similarity_top_k ?? (2 as number | undefined)
  })

  const { collections } = useContext(ChatbotUIContext)
  const collection = collections.find(
    collection => collection.id === presetChatSettings.collectionId
  )

  const modelDetails = LLM_LIST.find(model => model.modelId === preset.model)

  return (
    <SidebarItem
      item={preset}
      isTyping={isTyping}
      contentType="presets"
      icon={
        <ModelIcon
          provider={modelDetails?.provider || "custom"}
          height={30}
          width={30}
        />
      }
      updateState={{
        name,
        description,
        include_profile_context: presetChatSettings.includeProfileContext,
        include_workspace_instructions:
          presetChatSettings.includeWorkspaceInstructions,
        context_length: presetChatSettings.contextLength,
        model: presetChatSettings.model,
        prompt: presetChatSettings.prompt,
        temperature: presetChatSettings.temperature,
        collection_id: presetChatSettings.collectionId,
        similarity_top_k: presetChatSettings.similarityTopK,
        doc_agent_model: presetChatSettings.docAgentModel,
        doc_agent_temperature: presetChatSettings.docAgentTemperature,
        doc_agent_similarity_top_k: presetChatSettings.docAgentSimilarityTopK
      }}
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="Preset name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={PRESET_NAME_MAX}
            />
          </div>

          {preset.collection_id && (
            <AgentSettingsForm
              chatSettings={presetChatSettings as any}
              onChangeChatSettings={setPresetChatSettings}
            >
              <div className="space-y-1">
                <Label>Collection</Label>
                <PresetCollectionSelect
                  selectedPresetCollection={collection}
                  onPresetCollectionSelect={(
                    collection: PresetCollection | undefined
                  ) => {
                    setPresetChatSettings({
                      ...presetChatSettings,
                      collectionId: collection?.id
                    })
                  }}
                />
              </div>
            </AgentSettingsForm>
          )}

          {!preset.collection_id && (
            <ChatSettingsForm
              chatSettings={presetChatSettings as any}
              onChangeChatSettings={setPresetChatSettings}
              useAdvancedDropdown={true}
            />
          )}
        </>
      )}
    />
  )
}
