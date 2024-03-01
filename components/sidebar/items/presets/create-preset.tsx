import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
import { ChatSettingsForm } from "@/components/ui/chat-settings-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ChatbotUIContext } from "@/context/context"
import { PRESET_NAME_MAX } from "@/db/limits"
import { TablesInsert } from "@/supabase/types"
import { FC, useContext, useEffect, useState } from "react"
import { PresetCollectionSelect } from "./preset-collection-select"
import { PresetCollection } from "@/types"
import { Slider } from "@/components/ui/slider"
import { AgentSettingsForm } from "@/components/ui/agent-settings-form"
import { DOCUMENT_AGENT_PROMPT, TOP_AGENT_PROMPT } from "@/lib/rag/constants"

interface CreatePresetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreatePreset: FC<CreatePresetProps> = ({
  isOpen,
  onOpenChange
}) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)

  const [name, setName] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState("")
  const [presetChatSettings, setPresetChatSettings] = useState({
    model: selectedWorkspace?.default_model,
    prompt: selectedWorkspace?.default_prompt,
    temperature: selectedWorkspace?.default_temperature,
    contextLength: selectedWorkspace?.default_context_length,
    includeProfileContext: selectedWorkspace?.include_profile_context,
    includeWorkspaceInstructions:
      selectedWorkspace?.include_workspace_instructions,
    embeddingsProvider: selectedWorkspace?.embeddings_provider,
    collectionId: undefined as string | undefined,
    similarityTopK: 2 as number | undefined,
    docAgentPrompt: DOCUMENT_AGENT_PROMPT as string | undefined,
    docAgentModel: undefined as string | undefined,
    docAgentTemperature: 1 as number | undefined,
    docAgentSimilarityTopK: 2 as number | undefined
  })
  const [agent, setAgent] = useState(false)
  const { collections } = useContext(ChatbotUIContext)
  const collection = collections.find(
    collection => collection.id === presetChatSettings.collectionId
  )

  useEffect(() => {
    setPresetChatSettings(state => ({
      ...state,
      prompt: agent ? TOP_AGENT_PROMPT : selectedWorkspace?.default_prompt
    }))
  }, [agent, selectedWorkspace?.default_prompt])

  if (!profile) return null
  if (!selectedWorkspace) return null

  return (
    <SidebarCreateItem
      contentType="presets"
      isOpen={isOpen}
      isTyping={isTyping}
      onOpenChange={onOpenChange}
      createState={
        {
          user_id: profile.user_id,
          name,
          description,
          include_profile_context: presetChatSettings.includeProfileContext,
          include_workspace_instructions:
            presetChatSettings.includeWorkspaceInstructions,
          context_length: presetChatSettings.contextLength,
          model: presetChatSettings.model,
          prompt: presetChatSettings.prompt,
          temperature: presetChatSettings.temperature,
          embeddings_provider: presetChatSettings.embeddingsProvider,
          collection_id: presetChatSettings.collectionId,
          similarity_top_k: presetChatSettings.similarityTopK,
          doc_agent_prompt: presetChatSettings.docAgentPrompt,
          doc_agent_model: presetChatSettings.docAgentModel,
          doc_agent_temperature: presetChatSettings.docAgentTemperature,
          doc_agent_similarity_top_k: presetChatSettings.docAgentSimilarityTopK
        } as TablesInsert<"presets">
      }
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

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={agent}
              onCheckedChange={(value: boolean) => setAgent(value)}
            />

            <Label>Use as Top agent?</Label>
          </div>

          {agent && (
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
          {!agent && (
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
