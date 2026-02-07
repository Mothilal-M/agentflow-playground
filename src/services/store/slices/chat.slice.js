/* eslint-disable import/order */
import { createSlice } from "@reduxjs/toolkit"
import { invokeGraph, streamGraph } from "@/services/api/graph.api"
import {
  setThreadId as setThreadSettingsId,
  setThreadTitle as setThreadSettingsTitle,
  setContextMetadata,
} from "./threadSettings.slice"
import { getAgentFlowClient } from "@/lib/agentflowClient"
import { Message } from "@10xscale/agentflow-client"

const initialState = {
  threads: [],
  activeThreadId: null,
  isLoading: false,
  error: null,
  // track per-thread generation and abort controllers
  generating: {}, // { [threadId]: boolean }
  abortControllers: {}, // { [threadId]: AbortController }
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    createThread: (state, action) => {
      const newThread = {
        id: action.payload.id || Date.now().toString(),
        title: action.payload.title || "New Chat",
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      state.threads.unshift(newThread)
      state.activeThreadId = newThread.id
    },
    setActiveThread: (state, action) => {
      state.activeThreadId = action.payload
    },
    addMessage: (state, action) => {
      const { threadId, message } = action.payload
      const thread = state.threads.find((t) => t.id === threadId)
      if (thread) {
        const newMessage = {
          id: message.id || Date.now().toString(),
          content: message.content,
          role: message.role, // 'user' | 'assistant' | 'tool'
          timestamp: message.timestamp || new Date().toISOString(),
        }
        thread.messages.push(newMessage)
        thread.updatedAt = new Date().toISOString()

        // Update thread title with first user message if it's still "New Chat"
        if (thread.title === "New Chat" && message.role === "user") {
          thread.title =
            message.content.length > 50
              ? `${message.content.slice(0, 50)}...`
              : message.content
        }
      }
    },
    updateMessage: (state, action) => {
      const { threadId, messageId, content } = action.payload
      const thread = state.threads.find((t) => t.id === threadId)
      if (thread) {
        const message = thread.messages.find((m) => m.id === messageId)
        if (message) {
          message.content = content
          message.timestamp = new Date().toISOString()
          thread.updatedAt = new Date().toISOString()
        }
      }
    },
    deleteThread: (state, action) => {
      const threadId = action.payload
      state.threads = state.threads.filter((t) => t.id !== threadId)
      if (state.activeThreadId === threadId) {
        state.activeThreadId =
          state.threads.length > 0 ? state.threads[0].id : null
      }
    },
    updateThreadTitle: (state, action) => {
      const { threadId, title } = action.payload
      const thread = state.threads.find((t) => t.id === threadId)
      if (thread) {
        thread.title = title
        thread.updatedAt = new Date().toISOString()
      }
    },
    updateThreadId: (state, action) => {
      const { oldThreadId, newThreadId } = action.payload
      const thread = state.threads.find((t) => t.id === oldThreadId)
      if (thread) {
        thread.id = newThreadId
        thread.updatedAt = new Date().toISOString()
        // Update activeThreadId if this was the active thread
        if (state.activeThreadId === oldThreadId) {
          state.activeThreadId = newThreadId
        }
      }
    },
    clearMessages: (state, action) => {
      const threadId = action.payload
      const thread = state.threads.find((t) => t.id === threadId)
      if (thread) {
        thread.messages = []
        thread.updatedAt = new Date().toISOString()
      }
    },
    setGenerating: (state, action) => {
      const { threadId, value } = action.payload
      if (!state.generating) state.generating = {}
      state.generating[threadId] = value
    },
    registerAbortController: (state, action) => {
      const { threadId, controller } = action.payload
      if (!state.abortControllers) state.abortControllers = {}
      state.abortControllers[threadId] = controller
    },
    clearAbortController: (state, action) => {
      const threadId = action.payload
      delete state.abortControllers[threadId]
    },
  },
})

export const {
  setLoading,
  setError,
  createThread,
  setActiveThread,
  addMessage,
  updateMessage,
  deleteThread,
  updateThreadTitle,
  updateThreadId,
  clearMessages,
  setGenerating,
  registerAbortController,
  clearAbortController,
} = chatSlice.actions

export default chatSlice.reducer

// Helpers - This function is no longer used but kept for backward compatibility
const buildGraphBody = (settings, userContent) => ({
  messages: [Message.text_message(userContent, "user")],
  initial_state: settings.init_state || {},
  config: settings.config || {},
  recursion_limit: settings.recursion_limit || 25,
  response_granularity: settings.response_granularity || "low",
  include_raw: Boolean(settings.include_raw),
})

/**
 * Send message deciding between invoke vs stream based on thread settings
 * @param {string} threadId ID of the thread to send message to
 * @param {string} content User message content
 */
export const sendMessage =
  (threadId, content) => async (dispatch, getState) => {
    const state = getState()
    const settings = state.threadSettingsStore
    const chatState = state.chatStore

    // Find the thread and get EXISTING messages BEFORE adding the new one
    const thread = chatState.threads.find((t) => t.id === threadId)
    const existingMessages = (thread?.messages || []).map((message) => {
      return Message.text_message(message.content, message.role || "user")
    })

    // Add user message to thread UI
    dispatch(
      addMessage({
        threadId,
        message: { content, role: "user" },
      })
    )

    // Add the new user message to API payload
    const newUserMessage = Message.text_message(content, "user")
    const allMessages = [...existingMessages, newUserMessage]

    // Build config object with thread_id and thread_name if they exist
    const config = { ...settings.config }
    if (settings.thread_id) {
      config.thread_id = settings.thread_id
    }
    // if (settings.thread_title) {
    //   config.thread_name = settings.thread_title
    // }

    const body = {
      messages: allMessages,
      initial_state: settings.init_state || {},
      config: config,
      recursion_limit: settings.recursion_limit || 25,
      response_granularity: settings.response_granularity || "low",
      include_raw: Boolean(settings.include_raw),
    }

    if (settings.streaming_response) {
      await dispatch(streamAssistantAnswer(threadId, body))
    } else {
      await dispatch(invokeAssistantAnswer(threadId, body))
    }
  }

export const stopStreaming = (threadId) => (dispatch, getState) => {
  const { abortControllers } = getState().chatStore
  const controller = abortControllers[threadId]
  if (controller) {
    controller.abort()
  }
}

export const invokeAssistantAnswer = (threadId, body) => async (dispatch) => {
  dispatch(setGenerating({ threadId, value: true }))
  try {
    const response = await invokeGraph(body)
    handleInvokeResponse(dispatch, threadId, response)
  } catch (error) {
    dispatch(setError(error?.message || "Invoke failed"))
    dispatch(
      addMessage({
        threadId,
        message: {
          content: `Error: ${error?.message || error}`,
          role: "assistant",
        },
      })
    )
  } finally {
    dispatch(setGenerating({ threadId, value: false }))
  }
}

/**
 * Handle the invoke API response and append messages to the thread.
 */
function handleInvokeResponse(dispatch, threadId, response) {
  // The response is an InvokeResult object from the client library
  const messages = response?.messages || []
  const meta = response?.meta || {}
  const context = response?.context || []

  // Capture thread_id and thread_name from response meta
  if (meta.thread_id) {
    console.log(
      "#SDT Captured thread_id from invoke response:",
      meta.thread_id,
      "Old ID:",
      threadId
    )
    console.log(
      "#SDT Captured thread_name from invoke response:",
      meta.thread_name
    )
    console.log("#SDT is_new_thread:", meta.is_new_thread)

    // If the thread_id from response is different from current thread_id, update it
    if (meta.thread_id !== threadId) {
      // Update the thread ID in the store
      dispatch(
        updateThreadId({ oldThreadId: threadId, newThreadId: meta.thread_id })
      )

      // Use the new thread ID for adding messages
      threadId = meta.thread_id
    }

    // Always update threadSettings with the thread ID from response
    dispatch(setThreadSettingsId(meta.thread_id))

    // Update thread title if thread_name is provided
    if (meta.thread_name) {
      dispatch(
        updateThreadTitle({ threadId: meta.thread_id, title: meta.thread_name })
      )
      dispatch(setThreadSettingsTitle(meta.thread_name))
    }
  }

  // Update context metadata if available
  if (context && Array.isArray(context)) {
    // Calculate total tokens (rough estimate: 750 words = 1K tokens)
    const totalWords = context.reduce((accumulator, message) => {
      let content = ""
      if (typeof message.content === "string") {
        content = message.content
      } else if (Array.isArray(message.content)) {
        content = message.content
          .filter((block) => block.type === "text")
          .map((block) => block.text)
          .join("")
      }
      return accumulator + (content.split(/\s+/).length || 0)
    }, 0)
    const estimatedTokens = Math.ceil((totalWords / 750) * 1000)

    dispatch(
      setContextMetadata({
        total_messages: context.length,
        total_tokens: estimatedTokens,
      })
    )
  }

  messages.forEach((m) => {
    // Skip user messages since we already added them to UI before API call
    if (m.role === "user") {
      return
    }

    // Extract text content from Message object
    let content = ""
    if (typeof m.content === "string") {
      content = m.content
    } else if (Array.isArray(m.content)) {
      content = m.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("")
    }

    dispatch(
      addMessage({
        threadId,
        message: {
          content: content || "",
          role: m.role === "tool" ? "tool" : m.role || "assistant",
        },
      })
    )
  })
}

export const streamAssistantAnswer = (threadId, body) => async (dispatch) => {
  dispatch(setGenerating({ threadId, value: true }))
  const controller = new globalThis.AbortController()
  dispatch(registerAbortController({ threadId, controller }))

  // create a placeholder assistant message to append deltas
  const assistantId = Date.now().toString()
  dispatch(
    addMessage({
      threadId,
      message: { id: assistantId, content: "", role: "assistant" },
    })
  )

  try {
    await processStream(dispatch, threadId, controller, assistantId, body)
  } catch (error) {
    if (error?.name !== "AbortError") {
      dispatch(setError(error?.message || "Stream failed"))
      dispatch(
        updateMessage({
          threadId,
          messageId: assistantId,
          content: `Error: ${error?.message || error}`,
        })
      )
    }
  } finally {
    dispatch(setGenerating({ threadId, value: false }))
    dispatch(clearAbortController(threadId))
  }
}

/**
 * Process the streaming response and update the assistant message incrementally.
 */
async function processStream(
  dispatch,
  threadId,
  controller,
  assistantId,
  body
) {
  let accumulated = ""
  for await (const chunk of streamGraph(body, controller.signal)) {
    const data = chunk?.data || chunk
    accumulated = handleStreamDelta(
      dispatch,
      threadId,
      assistantId,
      data,
      accumulated
    )
  }
}

/** Update accumulated content from a stream chunk and append tool messages */
function handleStreamDelta(dispatch, threadId, assistantId, data, accumulated) {
  // Capture thread_id and thread_name from stream metadata (metadata field in StreamChunk)
  if (data.metadata?.thread_id) {
    console.log(
      "#SDT Captured thread_id from stream metadata:",
      data.metadata.thread_id,
      "Old ID:",
      threadId
    )
    console.log(
      "#SDT Captured thread_name from stream metadata:",
      data.metadata.thread_name
    )
    console.log("#SDT is_new_thread:", data.metadata.is_new_thread)

    // If the thread_id from response is different from current thread_id, update it
    if (data.metadata.thread_id !== threadId) {
      // Update the thread ID in the store
      dispatch(
        updateThreadId({
          oldThreadId: threadId,
          newThreadId: data.metadata.thread_id,
        })
      )

      // Update the threadId for subsequent operations
      threadId = data.metadata.thread_id
    }

    // Always update threadSettings with the thread ID from response
    dispatch(setThreadSettingsId(data.metadata.thread_id))

    // Update thread title if thread_name is provided
    if (data.metadata.thread_name) {
      dispatch(
        updateThreadTitle({
          threadId: data.metadata.thread_id,
          title: data.metadata.thread_name,
        })
      )
      dispatch(setThreadSettingsTitle(data.metadata.thread_name))
    }
  }

  if (isToolMessage(data)) {
    maybeAppendToolMessage(dispatch, threadId, data)
    return accumulated
  }
  const delta = getDeltaText(data)
  if (!delta) return accumulated
  const nextAccum = `${accumulated}${delta}`
  dispatch(
    updateMessage({ threadId, messageId: assistantId, content: nextAccum })
  )
  return nextAccum
}

/** Extract text delta from a stream chunk */
// eslint-disable-next-line complexity
function getDeltaText(data) {
  // Handle delta content
  if (typeof data?.delta?.content === "string" && data.delta.content) {
    return data.delta.content
  }
  // Handle message content (Message object)
  if (data?.message) {
    const { message } = data
    if (typeof message.content === "string") {
      return message.content
    }
    if (Array.isArray(message.content)) {
      return message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("")
    }
  }
  // Handle plain content
  if (typeof data?.content === "string" && data.content) {
    return data.content
  }
  return ""
}

/** Whether a chunk represents a tool message */
function isToolMessage(data) {
  return Boolean(data?.message && data.message.role === "tool")
}

/** Append tool message from a stream chunk if present */
function maybeAppendToolMessage(dispatch, threadId, data) {
  if (data?.message && data.message.role === "tool") {
    dispatch(
      addMessage({
        threadId,
        message: { content: data.message.content || "", role: "tool" },
      })
    )
  }
}
