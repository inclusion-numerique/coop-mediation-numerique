'use client'

import ChatCompletionErrorMessage from '@app/web/assistant/ChatCompletionErrorMessage'
import ChatMessagesList from '@app/web/assistant/ChatMessagesList'
import ChatStreamingMessage from '@app/web/assistant/ChatStreamingMessage'
import ChatUserInput from '@app/web/assistant/ChatUserInput'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import React, { useRef } from 'react'
import styles from './ChatSession.module.css'

const ChatSession = () => {
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div className={styles.sessionContainer}>
      <div className={styles.messagesContainer} ref={messagesContainerRef}>
        <div className={styles.messages}>
          <ChatMessagesList />
          <ChatStreamingMessage />
          <ChatCompletionErrorMessage />
          {/* This div is used as an anchor for scrolling to the bottom */}
          <div />
        </div>
      </div>
      <ChatUserInput messagesContainerRef={messagesContainerRef} />
    </div>
  )
}

export default withTrpc(ChatSession)
