import { OpenAiChatMessage } from '@app/web/assistant/openAiChat'
import {
  OpenAiClienChatModel,
  openAiClient,
} from '@app/web/assistant/openAiClient'
import { preProcessHtmlForSummary } from '@app/web/assistant/tasks/preProcessHtmlForSummary'

const defaultModel = OpenAiClienChatModel.Llama3_1_8bInstruct

export const summarizeWebPage = async ({
  url,
  objectif,
  html,
  model,
}: {
  url: string
  html: string
  objectif: string
  model?: OpenAiClienChatModel
}) => {
  const preparedContent = preProcessHtmlForSummary({
    html,
  })

  const completionMessages: OpenAiChatMessage[] = [
    {
      role: 'system',
      content: `Tu dois résumer EN MARKDOWN le contenu de la page web que l’utilisateur va te donner. Le résultat sera directement donné à un LLM, répond uniquement avec ton résumé au format markdown, sans autres préambules. Extrait un maximum d’informations utiles en quelques paragraphes, dans l’objectif étant: ${objectif}`,
    },
    {
      role: 'user',
      content: `Voici la page web à résumer :
      ${url}
      ===============
      ${preparedContent}`,
    },
  ]

  const completionModel = model ?? defaultModel

  const result = await openAiClient.chat.completions.create({
    model: completionModel,
    messages: completionMessages,
    stream: false,
    temperature: 0.2,
  })

  return { summary: result.choices.at(0)?.message.content ?? null }
}
