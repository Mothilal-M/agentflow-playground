/* eslint-disable */
import {
  ArrowUp,
  Paperclip,
  Square,
  Image,
  FileText,
  Copy,
  Code,
  Settings,
  AlertCircle,
  AlertTriangle,
  X,
} from "lucide-react"
import PropTypes from "prop-types"
import { useState, useRef, useEffect, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import remarkGfm from "remark-gfm"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  sendMessage as sendMessageThunk,
  stopStreaming,
} from "@/services/store/slices/chat.slice"
import { buildMessageText, getMessageCopyText } from "@/lib/messageContent"
import { resolveFileUrl } from "@/lib/media-resolver"

/**
 * Renders multimodal content blocks for assistant messages.
 * Falls back to markdown text for blocks that cannot be rendered visually.
 */
const MultimodalContent = ({ content, resolvedMedia, MarkdownComponents }) => {
  const elements = []

  content.forEach((block, index) => {
    if (!block || typeof block !== "object") return

    switch (block.type) {
      case "text": {
        const text = block.text || ""
        if (!text) return
        elements.push(
          <ReactMarkdown
            key={`text-${index}`}
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents}
          >
            {text}
          </ReactMarkdown>
        )
        break
      }
      case "image": {
        const media = block.media || {}
        let src = null
        if (media.kind === "data" && media.data_base64) {
          const mime = media.mime_type || "image/png"
          src = `data:${mime};base64,${media.data_base64}`
        } else if (media.kind === "url" && media.url) {
          src = media.url
        } else if (media.kind === "file_id" && media.file_id) {
          const resolved = resolvedMedia[media.file_id]
          src = resolved?.url || null
        }
        if (src) {
          elements.push(
            <img
              key={`image-${index}`}
              src={src}
              alt={media.alt || "Assistant generated image"}
              className="max-w-sm rounded-lg border border-border/50 shadow-sm my-2"
            />
          )
        }
        break
      }
      case "audio": {
        const media = block.media || {}
        const transcript = block.transcript || media.transcript
        let src = null
        if (media.kind === "data" && media.data_base64) {
          const mime = media.mime_type || "audio/wav"
          src = `data:${mime};base64,${media.data_base64}`
        } else if (media.kind === "url" && media.url) {
          src = media.url
        } else if (media.kind === "file_id" && media.file_id) {
          const resolved = resolvedMedia[media.file_id]
          src = resolved?.url || null
        }
        if (src) {
          elements.push(
            <audio
              key={`audio-${index}`}
              controls
              className="my-2 w-full max-w-sm"
            >
              <source src={src} type={media.mime_type || "audio/wav"} />
            </audio>
          )
        }
        if (transcript) {
          elements.push(
            <p
              key={`audio-transcript-${index}`}
              className="text-sm text-muted-foreground italic mt-1"
            >
              Transcript: {transcript}
            </p>
          )
        }
        break
      }
      case "video": {
        const media = block.media || {}
        let src = null
        if (media.kind === "data" && media.data_base64) {
          const mime = media.mime_type || "video/mp4"
          src = `data:${mime};base64,${media.data_base64}`
        } else if (media.kind === "url" && media.url) {
          src = media.url
        } else if (media.kind === "file_id" && media.file_id) {
          const resolved = resolvedMedia[media.file_id]
          src = resolved?.url || null
        }
        if (src) {
          elements.push(
            <video
              key={`video-${index}`}
              controls
              className="my-2 w-full max-w-sm rounded-lg"
            >
              <source src={src} type={media.mime_type || "video/mp4"} />
            </video>
          )
        }
        break
      }
      case "document": {
        const media = block.media || {}
        if (block.text) {
          elements.push(
            <ReactMarkdown
              key={`doc-text-${index}`}
              remarkPlugins={[remarkGfm]}
              components={MarkdownComponents}
            >
              {block.text}
            </ReactMarkdown>
          )
        } else if (media.kind === "file_id" && media.file_id) {
          const resolved = resolvedMedia[media.file_id]
          elements.push(
            <div
              key={`doc-${index}`}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border my-2"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              {resolved?.url ? (
                <a
                  href={resolved.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 underline"
                >
                  {media.filename || "document"}
                </a>
              ) : (
                <span className="text-sm truncate">
                  {media.filename || "document"}
                </span>
              )}
            </div>
          )
        }
        break
      }
      case "reasoning": {
        const reasoningText = block.summary || block.details || ""
        if (reasoningText) {
          elements.push(
            <div
              key={`reasoning-${index}`}
              className="text-sm text-muted-foreground border-l-2 border-slate-300 dark:border-slate-700 pl-3 my-2"
            >
              <span className="font-semibold text-xs uppercase tracking-wider">
                Reasoning
              </span>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={MarkdownComponents}
              >
                {reasoningText}
              </ReactMarkdown>
            </div>
          )
        }
        break
      }
      case "tool_call":
      case "tool_result":
        // These are handled by the message kind system, skip here
        break
      default:
        // Fallback: render as text via buildMessageText
        const fallback = buildMessageText(block)
        if (fallback.trim()) {
          elements.push(
            <ReactMarkdown
              key={`fallback-${index}`}
              remarkPlugins={[remarkGfm]}
              components={MarkdownComponents}
            >
              {fallback}
            </ReactMarkdown>
          )
        }
    }
  })

  if (elements.length === 0) {
    return null
  }

  return <div className="space-y-1">{elements}</div>
}

/**
 * Message component renders individual chat messages with modern design
 */
const Message = ({ message }) => {
  const isUser = message.role === "user"
  const isReasoning = message.kind === "reasoning"
  const isToolCall = message.kind === "tool_call"
  const isToolResult = message.kind === "tool_result" || message.role === "tool"
  const isError = message.kind === "error"
  const attachments = message.attachments || []
  const showToolMessageContent = useSelector(
    (state) => state.threadSettingsStore.show_tool_message_content
  )

  // Resolved media URLs for assistant multimodal content
  const [resolvedMedia, setResolvedMedia] = useState({})

  useEffect(() => {
    if (isUser) return
    const rawContent = message.rawContent ?? message.content
    if (!Array.isArray(rawContent)) return

    const resolve = async () => {
      const urls = {}
      for (const block of rawContent) {
        if (block?.media?.kind === "file_id" && block.media.file_id) {
          const url = await resolveFileUrl(block.media.file_id)
          if (url) {
            urls[block.media.file_id] = {
              url,
              mime_type: block.media.mime_type,
            }
          }
        }
      }
      if (Object.keys(urls).length > 0) {
        setResolvedMedia(urls)
      }
    }
    resolve()
  }, [isUser, message.rawContent, message.content])

  if ((isToolCall || isToolResult) && !showToolMessageContent) {
    return null
  }

  const displayContent = isUser
    ? message.content
    : buildMessageText(message.rawContent ?? message.content, {
        metadata: message.metadata,
        reasoning: message.reasoning,
        showToolDetails: showToolMessageContent,
        toolCalls: message.toolsCalls,
      })
  const kindLabel = isReasoning
    ? "Reasoning"
    : isToolCall
      ? "Tool Call"
      : isToolResult
        ? "Tool Result"
        : isError
          ? "Error"
          : null
  const bubbleClassName = isUser
    ? "bg-bg-subtle text-fg-primary"
    : isError
      ? "bg-danger/10 text-danger border border-danger/25 rounded-md px-4 py-3"
      : "bg-transparent text-fg-primary"
  const kindChipClassName = isError
    ? "bg-danger/10 text-danger border border-danger/25"
    : "bg-bg-subtle text-fg-secondary border border-border-subtle"

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        getMessageCopyText(message, {
          showToolDetails: showToolMessageContent,
        })
      )
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Custom components for markdown rendering
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "")
      const language = match ? match[1] : ""

      if (!inline && language) {
        return (
          <div className="relative my-4 rounded-lg border border-border-subtle bg-bg-subtle overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-subtle">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-fg-tertiary">
                {language}
              </span>
            </div>
            <div className="overflow-x-auto">
              <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: "0.875rem 1rem",
                  background: "transparent",
                  fontSize: "13px",
                  lineHeight: "1.55",
                  fontFamily: "var(--font-mono)",
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          </div>
        )
      }

      return (
        <code
          className="font-mono text-[13px] bg-bg-subtle border border-border-subtle px-1 py-0.5 rounded text-fg-primary break-words"
          {...props}
        >
          {children}
        </code>
      )
    },
    pre({ children }) {
      return <>{children}</>
    },
    p({ children }) {
      return <p className="mb-3 last:mb-0">{children}</p>
    },
    h1({ children }) {
      return (
        <h1 className="text-lg font-semibold tracking-tight mb-2 text-fg-primary">
          {children}
        </h1>
      )
    },
    h2({ children }) {
      return (
        <h2 className="text-base font-semibold tracking-tight mb-2 text-fg-primary">
          {children}
        </h2>
      )
    },
    h3({ children }) {
      return (
        <h3 className="text-sm font-semibold mb-1 text-fg-primary">
          {children}
        </h3>
      )
    },
    ul({ children }) {
      return (
        <ul className="list-disc pl-5 mb-3 space-y-1 marker:text-fg-tertiary">
          {children}
        </ul>
      )
    },
    ol({ children }) {
      return (
        <ol className="list-decimal pl-5 mb-3 space-y-1 marker:text-fg-tertiary">
          {children}
        </ol>
      )
    },
    li({ children }) {
      return (
        <li className="text-[14px] sm:text-[15px] leading-relaxed">
          {children}
        </li>
      )
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-2 border-border-strong pl-4 italic text-fg-secondary my-3">
          {children}
        </blockquote>
      )
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto my-4 rounded-md border border-border-subtle">
          <table className="min-w-full">{children}</table>
        </div>
      )
    },
    thead({ children }) {
      return (
        <thead className="bg-bg-subtle border-b border-border-subtle">
          {children}
        </thead>
      )
    },
    tbody({ children }) {
      return <tbody>{children}</tbody>
    },
    tr({ children }) {
      return (
        <tr className="border-b border-border-subtle last:border-0">
          {children}
        </tr>
      )
    },
    th({ children }) {
      return (
        <th className="px-3 py-2 text-left text-[11px] font-semibold tracking-[0.06em] uppercase text-fg-tertiary">
          {children}
        </th>
      )
    },
    td({ children }) {
      return (
        <td className="px-3 py-2 text-[13px] sm:text-[14px] text-fg-primary">
          {children}
        </td>
      )
    },
  }

  const isMetaKind = isReasoning || isToolCall || isToolResult

  return (
    <div
      className={`py-4 sm:py-5 px-3 sm:px-6 w-full max-w-[760px] mx-auto group ${isUser ? "flex justify-end" : "block"}`}
    >
      <div
        className={`flex flex-col min-w-0 ${isUser ? "items-end max-w-[88%] sm:max-w-[80%]" : "w-full"}`}
      >
        {!isUser && kindLabel && (
          <div className="mb-2">
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold tracking-[0.04em] uppercase rounded-md px-2 py-0.5 ${kindChipClassName}`}
            >
              {isError && (
                <AlertTriangle className="w-3 h-3" strokeWidth={1.75} />
              )}
              {kindLabel}
            </span>
          </div>
        )}
        <div className={isUser ? "flex justify-end w-full" : "relative w-full"}>
          <div
            className={`${
              isUser
                ? "rounded-lg px-3.5 sm:px-4 py-2.5 max-w-full"
                : isError
                  ? ""
                  : isMetaKind
                    ? "border-l-2 border-border-subtle pl-3 sm:pl-4 py-1"
                    : ""
            } ${bubbleClassName}`}
          >
            <div className="text-[14px] sm:text-[15px] leading-relaxed">
              {isUser ? (
                <div className="space-y-2">
                  {attachments.length > 0 && (
                    <div className="space-y-1.5 mb-2">
                      {attachments.map((attachment, idx) => {
                        const isImage =
                          attachment.mime_type?.startsWith("image/")
                        const isPDF =
                          attachment.mime_type === "application/pdf"
                        if (isImage && attachment.url) {
                          return (
                            <img
                              key={idx}
                              src={attachment.url}
                              alt={attachment.filename || "Attached image"}
                              className="max-w-[14rem] sm:max-w-xs rounded-md border border-border-subtle"
                            />
                          )
                        }
                        if (isPDF) {
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-2.5 py-1.5 bg-bg-surface rounded-md border border-border-subtle"
                            >
                              <FileText
                                className="w-4 h-4 text-fg-tertiary flex-shrink-0"
                                strokeWidth={1.75}
                              />
                              <span className="text-[13px] truncate">
                                {attachment.filename || "document.pdf"}
                              </span>
                            </div>
                          )
                        }
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-2.5 py-1.5 bg-bg-surface rounded-md border border-border-subtle"
                          >
                            <FileText
                              className="w-4 h-4 text-fg-tertiary flex-shrink-0"
                              strokeWidth={1.75}
                            />
                            <span className="text-[13px] truncate">
                              {attachment.filename || "file"}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {message.content && (
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  )}
                </div>
              ) : isError ? (
                <p className="whitespace-pre-wrap text-[13px] sm:text-sm">
                  {message.content}
                </p>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {Array.isArray(message.rawContent ?? message.content) ? (
                    <MultimodalContent
                      content={message.rawContent ?? message.content}
                      resolvedMedia={resolvedMedia}
                      MarkdownComponents={MarkdownComponents}
                    />
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={MarkdownComponents}
                    >
                      {displayContent}
                    </ReactMarkdown>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
          <span className="text-[10px] sm:text-[11px] font-medium text-fg-tertiary tabular-nums">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {!isUser && (
            <div className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleCopy}
                      className="h-7 w-7 text-fg-tertiary hover:text-fg-primary hover:bg-bg-subtle"
                    >
                      <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Sheet>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 text-fg-tertiary hover:text-fg-primary hover:bg-bg-subtle"
                        >
                          <Code className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </Button>
                      </SheetTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Raw JSON</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <SheetContent
                  side="right"
                  className="w-full sm:w-[480px] sm:max-w-[600px] bg-bg-surface"
                >
                  <SheetHeader>
                    <SheetTitle>Raw message</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <ScrollArea className="h-[calc(100vh-120px)]">
                      <pre className="text-[12px] font-mono bg-bg-subtle border border-border-subtle p-3 sm:p-4 rounded-md overflow-auto">
                        <code>{JSON.stringify(message, null, 2)}</code>
                      </pre>
                    </ScrollArea>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Streaming caret indicator — typewriter style.
 */
const TypingIndicator = () => {
  return (
    <div className="py-3 px-3 sm:px-6 w-full max-w-[760px] mx-auto">
      <div className="inline-flex items-center gap-2 text-fg-tertiary">
        <span
          className="inline-block w-[2px] h-4 bg-fg-primary"
          style={{ animation: "caret-blink 1.05s ease-out infinite" }}
        />
        <span className="text-[12px] font-medium">Thinking…</span>
      </div>
    </div>
  )
}

/**
 * File attachment preview component
 */
const AttachmentPreview = ({ file, onRemove }) => {
  const isImage = file.type.startsWith("image/")

  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2 bg-bg-subtle rounded-md border border-border-subtle">
      <div className="w-8 h-8 rounded-md bg-bg-muted flex items-center justify-center flex-shrink-0">
        {isImage ? (
          <Image className="w-4 h-4 text-fg-tertiary" strokeWidth={1.75} />
        ) : (
          <FileText className="w-4 h-4 text-fg-tertiary" strokeWidth={1.75} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-fg-primary truncate leading-tight">
          {file.name}
        </p>
        <p className="text-[11px] text-fg-tertiary mt-0.5">
          {Math.round(file.size / 1024)} KB
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(file)}
        className="h-7 w-7 text-fg-tertiary hover:bg-danger/10 hover:text-danger"
        aria-label={`Remove ${file.name}`}
      >
        <X className="w-3.5 h-3.5" strokeWidth={1.75} />
      </Button>
    </div>
  )
}

/**
 * Modern message input component with all features
 */
const MessageInput = ({
  onSendMessage,
  disabled,
  isGenerating,
  onStopGeneration,
}) => {
  const [message, setMessage] = useState("")
  const [attachedFiles, setAttachedFiles] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()
      if ((message.trim() || attachedFiles.length > 0) && !disabled) {
        onSendMessage(message.trim(), attachedFiles)
        setMessage("")
        setAttachedFiles([])
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto"
        }
      }
    },
    [message, attachedFiles, disabled, onSendMessage]
  )

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        handleSubmit(event)
      }
    },
    [handleSubmit]
  )

  const handleTextareaChange = (event) => {
    setMessage(event.target.value)

    // Auto-resize textarea
    const textarea = event.target
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  const handleFileSelect = (files) => {
    const newFiles = Array.from(files).filter(
      (file) => file.size <= 10 * 1024 * 1024 // 10MB limit
    )
    setAttachedFiles((previous) => [...previous, ...newFiles])
  }

  const handleFileInputChange = (event) => {
    if (event.target.files) {
      handleFileSelect(event.target.files)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragOver(false)
    if (event.dataTransfer.files) {
      handleFileSelect(event.dataTransfer.files)
    }
  }

  const removeFile = (fileToRemove) => {
    setAttachedFiles((previous) => previous.filter((f) => f !== fileToRemove))
  }

  return (
    <div className="pt-2 pb-3 sm:pb-4 px-3 sm:px-4 bg-transparent w-full max-w-[760px] mx-auto safe-bottom">
      {/* File previews */}
      {attachedFiles.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {attachedFiles.map((file, index) => (
            <AttachmentPreview key={index} file={file} onRemove={removeFile} />
          ))}
        </div>
      )}

      {/* Main input area */}
      <div
        className={`relative rounded-xl border bg-bg-surface shadow-soft-sm transition-colors ${
          isDragOver
            ? "border-accent bg-accent/5"
            : "border-border-subtle focus-within:border-border-strong"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <form onSubmit={handleSubmit} className="flex flex-col w-full">
          <div className="px-3.5 sm:px-4 pt-3.5">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isDragOver ? "Drop files here…" : "Reply to thread…"
              }
              disabled={disabled}
              className="w-full resize-none border-0 bg-transparent text-[15px] leading-relaxed text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] max-h-[200px]"
              rows={1}
            />
          </div>

          <div className="flex items-center justify-between px-2 pb-2 pt-1 gap-2">
            <div className="flex items-center">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-9 w-9 sm:h-8 sm:w-8 text-fg-tertiary hover:text-fg-secondary hover:bg-bg-subtle"
                      aria-label="Attach files"
                    >
                      <Paperclip className="w-4 h-4" strokeWidth={1.75} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Attach files</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-fg-tertiary font-medium hidden sm:inline">
                <kbd className="font-mono font-medium">⏎</kbd> to send
              </span>
              {isGenerating ? (
                <Button
                  type="button"
                  onClick={onStopGeneration}
                  size="icon-sm"
                  className="h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-bg-subtle text-fg-primary hover:bg-bg-muted border border-border-subtle"
                  title="Stop generation"
                  aria-label="Stop generation"
                >
                  <Square className="h-3 w-3 fill-current" strokeWidth={1.75} />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon-sm"
                  disabled={
                    (!message.trim() && attachedFiles.length === 0) || disabled
                  }
                  className="h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-fg-primary text-bg-canvas hover:bg-fg-primary/90 disabled:bg-bg-muted disabled:text-fg-disabled"
                  aria-label="Send message"
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={2} />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.csv,.json,.png,.jpg,.jpeg,.gif,.svg"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}

/**
 * Main MessageView component with all modern features
 */
const MessageView = ({ thread, disabled = false }) => {
  const dispatch = useDispatch()
  const generatingMap = useSelector((state) => state.chatStore.generating)
  const messagesEndRef = useRef(null)
  const isGenerating = Boolean(generatingMap?.[thread.id])
  const isTyping = isGenerating

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [thread.messages])

  const handleSendMessage = useCallback(
    async (content, files = []) => {
      if ((!content.trim() && files.length === 0) || disabled) return
      await dispatch(sendMessageThunk(thread.id, content, files))
    },
    [dispatch, thread.id, disabled]
  )

  const handleStopGeneration = useCallback(() => {
    dispatch(stopStreaming(thread.id))
  }, [dispatch, thread.id])

  return (
    <div className="flex flex-col h-full">
      {/* Warning banner when disabled */}
      {disabled && (
        <div className="flex-shrink-0 px-3 sm:px-4 py-2.5 bg-warning/10 dark:bg-warning/15 border-b border-warning/25">
          <div className="flex items-start gap-2.5 max-w-[760px] mx-auto">
            <AlertCircle
              className="h-4 w-4 text-warning mt-0.5 flex-shrink-0"
              strokeWidth={1.75}
            />
            <div className="text-[12px] sm:text-[13px] text-fg-secondary leading-relaxed">
              <span className="font-medium text-fg-primary">
                Backend not configured.
              </span>{" "}
              Add{" "}
              <code className="font-mono text-[12px] bg-bg-subtle border border-border-subtle px-1 py-0.5 rounded text-fg-secondary">
                ?backendUrl=YOUR_URL
              </code>{" "}
              or open{" "}
              <Settings className="h-3 w-3 inline mx-0.5" strokeWidth={1.75} />
              Settings.
            </div>
          </div>
        </div>
      )}
      {/* Messages area */}
      <ScrollArea className="flex-1">
        <div className="min-h-full">
          {thread.messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isTyping || disabled}
        isGenerating={isGenerating}
        onStopGeneration={handleStopGeneration}
      />
    </div>
  )
}

Message.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    rawContent: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
      PropTypes.object,
    ]),
    kind: PropTypes.string,
    role: PropTypes.oneOf(["user", "assistant", "tool"]).isRequired,
    timestamp: PropTypes.string.isRequired,
    metadata: PropTypes.object,
    reasoning: PropTypes.string,
    toolsCalls: PropTypes.array,
  }).isRequired,
}

MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

MessageInput.defaultProps = {
  disabled: false,
}

MessageView.propTypes = {
  thread: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    messages: PropTypes.array.isRequired,
  }).isRequired,
  disabled: PropTypes.bool,
}

MessageView.defaultProps = {
  disabled: false,
}

export default MessageView
