import { Message } from "@10xscale/agentflow-client"

import { getAgentFlowClient } from "@/lib/agentflowClient"

/**
 * Invoke graph with messages
 * @param {object} body - GraphInputSchema-compatible payload
 * @returns {Promise<object>} - Response with messages
 */
export const invokeGraph = async (body) => {
  const client = getAgentFlowClient()

  // Convert body.messages to Message objects if they're not already
  const messages = (body.messages || []).map((message) => {
    // If already a Message object, use it
    if (message instanceof Message) {
      return message
    }
    // If it's a plain object, convert to Message
    if (typeof message.content === "string") {
      return Message.text_message(
        message.content,
        message.role || "user",
        message.message_id || null
      )
    }
    // If content is an array (ContentBlock[]), create Message directly
    return new Message(
      message.role || "user",
      message.content || [],
      message.message_id || null
    )
  })

  const result = await client.invoke(messages, {
    initial_state: body.initial_state,
    config: body.config,
    recursion_limit: body.recursion_limit,
    response_granularity: body.response_granularity,
  })

  // Transform to match existing response format and include meta
  return {
    messages: result.messages || [],
    state: result.state,
    context: result.context,
    summary: result.summary,
    meta: result.meta || {},
    all_messages: result.all_messages || [],
    iterations: result.iterations || 0,
    recursion_limit_reached: result.recursion_limit_reached || false,
  }
}

/**
 * Stream graph execution using client library
 * @param {object} body GraphInputSchema-compatible payload
 * @param {*} [signal] optional abort signal to cancel streaming
 * @yields {object} parsed JSON objects per line/chunk
 */
export async function* streamGraph(body, signal) {
  const client = getAgentFlowClient()

  // Convert body.messages to Message objects if they're not already
  const messages = (body.messages || []).map((message) => {
    // If already a Message object, use it
    if (message instanceof Message) {
      return message
    }
    // If it's a plain object, convert to Message
    if (typeof message.content === "string") {
      return Message.text_message(
        message.content,
        message.role || "user",
        message.message_id || null
      )
    }
    // If content is an array (ContentBlock[]), create Message directly
    return new Message(
      message.role || "user",
      message.content || [],
      message.message_id || null
    )
  })

  const stream = client.stream(messages, {
    initial_state: body.initial_state,
    config: body.config,
    recursion_limit: body.recursion_limit,
    response_granularity: body.response_granularity,
  })

  // Handle abort signal
  if (signal) {
    signal.addEventListener("abort", () => {
      // The client library should handle abort internally
    })
  }

  // Yield chunks in the format expected by the existing code
  for await (const chunk of stream) {
    // Transform chunk to match existing format and pass through metadata
    if (chunk.event === "message" && chunk.message) {
      yield {
        data: {
          message: chunk.message,
          delta: chunk.message.delta
            ? { content: extractTextFromMessage(chunk.message) }
            : undefined,
          metadata: chunk.metadata || {},
        },
      }
    } else if (chunk.event === "updates" || chunk.event === "state") {
      yield {
        data: {
          state: chunk.state,
          updates: chunk.updates,
          metadata: chunk.metadata || {},
        },
      }
    } else {
      yield {
        data: {
          ...chunk,
          metadata: chunk.metadata || {},
        },
      }
    }
  }
}

/**
 * Extract text content from a Message object
 */
function extractTextFromMessage(message) {
  if (!message || !message.content) return ""
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
}

export default {
  invokeGraph,
  streamGraph,
}
