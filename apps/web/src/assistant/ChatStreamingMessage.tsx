'use client'

import React from 'react'
import { useChatContext } from '@app/web/assistant/chatStore'
import ChatMessage from '@app/web/assistant/ChatMessage'

const created = new Date() // no need for a real created date for the streaming message

/**
 * Displays the chat completion currently being generated
 */
const ChatStreamingMessage = () => {
  const currentToolCalls = useChatContext((context) => context.currentToolCalls)
  const isGenerating = useChatContext((context) => context.isGenerating)
  const streamingMessage = useChatContext((context) => context.streamingMessage)

  if (!isGenerating) return null

  return (
    <>
      {currentToolCalls.length > 0 && (
        <ChatMessage
          message={{
            id: 'streaming-message-tool-calls',
            role: 'Assistant',
            content: null,
            toolCalls: currentToolCalls,
            finishReason: null,
            created,
            sessionId: 'streaming-message',
            name: null,
            refusal: null,
            toolCallId: null,
          }}
        />
      )}
      {!!streamingMessage && (
        <ChatMessage
          message={{
            id: 'streaming-message-content',
            role: 'Assistant',
            content: streamingMessage,
            toolCalls: [],
            finishReason: null,
            created,
            sessionId: 'streaming-message',
            name: null,
            refusal: null,
            toolCallId: null,
          }}
        />
      )}
    </>
  )
}

export default ChatStreamingMessage
