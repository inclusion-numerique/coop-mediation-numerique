'use client'

import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import type { AssistantPageDataChatThreadHistoryItem } from '@app/web/assistant/getAssistantPageData'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import { dateAsDayAndTimeInTimeZone } from '@app/web/utils/dateAsDayAndTime'
import Button from '@codegouvfr/react-dsfr/Button'
import { useCallback, useEffect, useRef, useState } from 'react'

const defaultTitle = ({ created }: { created: Date }) =>
  `Chat du ${dateAsDayAndTimeInTimeZone(created, 'Europe/Paris')}`

/**
 * Displays the button for the history chat session.
 * Will generate a title for the chat session if the title is not set
 */
const HistoryChatThreadButton = ({
  sessionHistoryItem: {
    id,
    created,
    title: initialTitle,
    _count: { messages },
  },
}: {
  sessionHistoryItem: AssistantPageDataChatThreadHistoryItem
}) => {
  const [title, setTitle] = useState(initialTitle ?? defaultTitle({ created }))

  const isGeneratingTitle = useRef(false)

  const mutation = trpc.assistant.generateSessionTitle.useMutation()

  const generateTitle = useCallback(async () => {
    if (
      messages < 3 ||
      initialTitle ||
      mutation.isPending ||
      mutation.isSuccess ||
      mutation.isError ||
      isGeneratingTitle.current
    ) {
      return
    }
    isGeneratingTitle.current = true
    const updated = await mutation.mutateAsync({ threadId: id })
    setTitle(updated.title ?? defaultTitle({ created }))
  }, [initialTitle, created, id, mutation, messages])

  useEffect(() => {
    // Should run only once
    // biome-ignore lint/suspicious/noConsole: useful for debugging
    generateTitle().catch(console.error)
  }, [generateTitle])

  return (
    <Button
      size="small"
      priority="tertiary no outline"
      data-history-chat-session-button={id}
      linkProps={{
        href: `/assistant/chat/${id}`,
      }}
      {...buttonLoadingClassname(
        mutation.isPending,
        'fr-display-block fr-mb-0',
      )}
    >
      {title}
    </Button>
  )
}

export default withTrpc(HistoryChatThreadButton)
