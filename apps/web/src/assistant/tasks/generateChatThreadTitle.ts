import { MessageParts } from '@app/web/assistant/MessagePart'
import { OpenAiChatMessage } from '@app/web/assistant/openAiChat'
import {
  OpenAiClienChatModel,
  openAiClient,
  openAiClientConfiguration,
} from '@app/web/assistant/openAiClient'
import type { AssistantChatMessage } from '@prisma/client'
import type { Message } from 'ai'

export const generateChatThreadTitle = async ({
  messages,
  model,
}: {
  messages: (
    | Pick<Message, 'role' | 'parts'>
    | Pick<AssistantChatMessage, 'role' | 'parts'>
  )[]
  model?: OpenAiClienChatModel
}) => {
  const completionMessages: OpenAiChatMessage[] = [
    {
      role: 'system',
      content: `Tu dois résumer le contenu de la conversation suivante en quelques mots, pour afficher dans un titre court dans l’historiques des conversations de l’utilisateur avec l’assistant.
Pour cela tu dispose uniquement des message de l’utilisateur pour déduire le titre du chat à partir de son intention.
Répond uniquement avec quelques mots, **sans mots de décoration** ("Question :", "Demande : ", etc..), **Sans guillements**, etc.`,
    },
    {
      role: 'user',
      content: `Voici les messages à résumer : 
===============
${messages
  .filter((message) => message.role === 'user')
  .slice(0, 4)
  .map(
    (message) => `**${message.role} :**
${(message.parts as unknown[] as MessageParts)
  .filter((part) => part.type === 'text')
  .map((part) => part.text)
  .join('\n\n')}`,
  )
  .join('\n===============\n')}
`,
    },
  ]

  const result = await openAiClient.chat.completions.create({
    model: model ?? openAiClientConfiguration.chatModel,
    messages: completionMessages,
    stream: false,
    temperature: 0.2,
  })

  return result.choices.at(0)?.message.content ?? null
}
