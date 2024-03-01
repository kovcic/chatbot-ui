"use client"

import { ChatbotUIContext } from "@/context/context"
import { ChatSettings } from "@/types"
import { FC, useContext } from "react"
import { ModelSelect } from "../models/model-select"
import { Label } from "./label"
import { Slider } from "./slider"
import { TextareaAutosize } from "./textarea-autosize"
import { DOCUMENT_AGENT_PROMPT, TOP_AGENT_PROMPT } from "@/lib/rag/constants"

interface ChatSettingsFormProps {
  chatSettings: ChatSettings
  onChangeChatSettings: (value: ChatSettings) => void
  children?: React.ReactNode
}

export const AgentSettingsForm: FC<ChatSettingsFormProps> = ({
  chatSettings,
  onChangeChatSettings,
  children
}) => {
  const { profile, availableLocalModels } = useContext(ChatbotUIContext)

  if (!profile) return null

  return (
    <div className="space-y-3">
      {children}

      <hr />

      <div className="space-y-1">
        <Label>Top Agent Options</Label>
      </div>
      <div className="space-y-1">
        <Label>Model</Label>

        <ModelSelect
          selectedModelId={chatSettings.model}
          onSelectModel={model => {
            onChangeChatSettings({ ...chatSettings, model })
          }}
        />
      </div>
      <div className="space-y-1">
        <Label>Prompt</Label>

        <TextareaAutosize
          className="bg-background border-input border-2"
          placeholder={TOP_AGENT_PROMPT}
          onValueChange={prompt => {
            onChangeChatSettings({ ...chatSettings, prompt })
          }}
          value={chatSettings.prompt ?? TOP_AGENT_PROMPT}
          minRows={3}
          maxRows={6}
        />
      </div>
      <div className="space-y-3">
        <Label className="flex items-center space-x-1">
          <div>Temperature:</div>

          <div>{chatSettings.temperature}</div>
        </Label>

        <Slider
          value={[chatSettings.temperature ?? 1]}
          onValueChange={temperature => {
            onChangeChatSettings({
              ...chatSettings,
              temperature: temperature[0]
            })
          }}
          min={0}
          max={2}
          step={0.1}
        />
      </div>
      <div className="space-y-3">
        <Label className="flex items-center space-x-1">
          <div>Similarity Top K:</div>

          <div>{chatSettings.similarityTopK}</div>
        </Label>

        <Slider
          value={[chatSettings.similarityTopK ?? 2]}
          onValueChange={similarity => {
            onChangeChatSettings({
              ...chatSettings,
              similarityTopK: similarity[0]
            })
          }}
          min={1}
          max={20}
          step={1}
        />
      </div>

      <hr />

      <div className="space-y-1">
        <Label>Document Agent Options</Label>
      </div>
      <div className="space-y-1">
        <Label>Model</Label>

        <ModelSelect
          selectedModelId={chatSettings.docAgentModel || "gpt-4-turbo-preview"}
          onSelectModel={model => {
            onChangeChatSettings({ ...chatSettings, docAgentModel: model })
          }}
        />
      </div>
      <div className="space-y-1">
        <Label>Prompt</Label>

        <TextareaAutosize
          className="bg-background border-input border-2"
          placeholder={DOCUMENT_AGENT_PROMPT}
          onValueChange={docAgentPrompt => {
            onChangeChatSettings({ ...chatSettings, docAgentPrompt })
          }}
          value={chatSettings.docAgentPrompt ?? DOCUMENT_AGENT_PROMPT}
          minRows={3}
          maxRows={6}
        />
      </div>
      <div className="space-y-3">
        <Label className="flex items-center space-x-1">
          <div>Temperature:</div>

          <div>{chatSettings.docAgentTemperature}</div>
        </Label>

        <Slider
          value={[chatSettings.docAgentTemperature ?? 0]}
          onValueChange={temperature => {
            onChangeChatSettings({
              ...chatSettings,
              docAgentTemperature: temperature[0]
            })
          }}
          min={0}
          max={2}
          step={0.1}
        />
      </div>
      <div className="space-y-3">
        <Label className="flex items-center space-x-1">
          <div>Similarity Top K:</div>

          <div>{chatSettings.docAgentSimilarityTopK}</div>
        </Label>

        <Slider
          value={[chatSettings.docAgentSimilarityTopK ?? 0]}
          onValueChange={similarity => {
            onChangeChatSettings({
              ...chatSettings,
              docAgentSimilarityTopK: similarity[0]
            })
          }}
          min={1}
          max={20}
          step={1}
        />
      </div>
    </div>
  )
}
