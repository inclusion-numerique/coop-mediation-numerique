import styles from '@app/web/assistant/ChatSession.module.css'
import { Spinner } from '@app/web/ui/Spinner'
import classNames from 'classnames'
import type { ChatCompletionMessageToolCall } from 'openai/src/resources/chat/completions'

const defaultLoadingMessage = 'Je recherche plus d’informations'

const toolsLoadingMessages = {
  general_web_search:
    'Je recherche sur internet pour avoir plus d’informations',
  administration_web_search:
    'Je recherche sur les sites officiels pour avoir plus d’informations',
  centre_aide_rag:
    'Je recherche dans le centre d’aide pour répondre à votre question',
  les_bases_rag: 'Je recherche sur les bases du numérique d’intérêt général',
}

const ToolCallMessage = ({
  toolCall,
  status,
}: {
  toolCall: ChatCompletionMessageToolCall
  status: 'loading' | 'success' | 'error'
}) => {
  const loadingMessage =
    toolCall.function.name in toolsLoadingMessages
      ? toolsLoadingMessages[
          toolCall.function.name as keyof typeof toolsLoadingMessages // ts does not understand that the key is in the object after the check
        ]
      : defaultLoadingMessage

  const objectif =
    'parsed_arguments' in toolCall.function &&
    'objectif' in (toolCall.function.parsed_arguments as Record<string, string>)
      ? (toolCall.function.parsed_arguments as Record<string, string>).objectif
      : null

  const message = objectif
    ? `${loadingMessage} pour ${objectif}`
    : loadingMessage

  return (
    <div
      className={classNames(
        'fr-flex-shrink-1 fr-text--sm',
        styles.messageToolCall,
      )}
      key={toolCall.id}
    >
      {status === 'loading' && (
        <>
          <Spinner size="small" /> <span>{message}</span>
        </>
      )}
      {status === 'success' && (
        <>
          <span className="fr-icon-check-line fr-icon--sm fr-text-default--success" />
          <span>{message}</span>
        </>
      )}
      {status === 'error' && (
        <>
          <span className="fr-icon-error-line fr-icon--sm fr-text-default--error" />
          <span>{message}</span>
        </>
      )}
    </div>
  )
}

export default ToolCallMessage
