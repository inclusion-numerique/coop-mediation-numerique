import { openAiClientConfiguration } from '@app/web/assistant/openAiClient'
import { mediationAssistantSystemMessage } from '@app/web/assistant/systemMessages'
import { agenticSearchToolDescription } from '@app/web/assistant/tools/agenticSearchToolConfig'
import { removeNullAndUndefinedValues } from '@app/web/utils/removeNullAndUndefinedValues'
import type { AssistantConfiguration } from '@prisma/client'

export type DefaultAssistantConfiguration = Omit<
  AssistantConfiguration,
  'id' | 'userId' | 'created'
>
export const defaultAssistantConfiguration = {
  title: 'Configuration par défaut',
  model: openAiClientConfiguration.chatModel,
  notes: null,
  functionCall: null,
  maxCompletionTokens: null,
  maxTokens: null,
  parallelToolCalls: null,
  reasoningEffort: null,
  seed: null,
  frequencyPenalty: 0.1,
  presencePenalty: 0.1,
  temperature: 0.7,
  topLogProbs: null,
  topP: null,
  systemMessage: mediationAssistantSystemMessage.content,
  searchToolDescription: agenticSearchToolDescription,
} satisfies DefaultAssistantConfiguration

export const mergeWithDefaultAssistantConfiguration = (
  configuration: Omit<AssistantConfiguration, 'id' | 'userId' | 'created'>,
) => ({
  ...defaultAssistantConfiguration,
  ...removeNullAndUndefinedValues(configuration),
})
