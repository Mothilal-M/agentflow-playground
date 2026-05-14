import {
  Settings,
  AlertCircle,
  Code2,
  BookOpen,
  Lightbulb,
  ArrowRight,
} from "lucide-react"
import PropTypes from "prop-types"
import { useState, useRef } from "react"
import { useSelector } from "react-redux"

import EmptyInputCard from "./empty-input-card"

const SUGGESTIONS = [
  {
    icon: Code2,
    label: "Write code",
    description: "Sort a list of dicts by a key",
    prompt:
      "Write a Python function to sort a list of dictionaries by a specific key",
  },
  {
    icon: BookOpen,
    label: "Explain a concept",
    description: "How LLMs work, in plain terms",
    prompt: "Explain how large language models work in simple terms",
  },
  {
    icon: Lightbulb,
    label: "Brainstorm",
    description: "5 SaaS product ideas using AI",
    prompt: "Give me 5 creative ideas for a SaaS product that uses AI",
  },
]

const DisabledWarning = () => (
  <div className="mt-5 mx-auto max-w-md rounded-md border border-warning/30 bg-warning/10 dark:bg-warning/15 px-3 py-2.5">
    <div className="flex items-start gap-2.5">
      <AlertCircle
        className="h-4 w-4 text-warning mt-0.5 flex-shrink-0"
        strokeWidth={1.75}
      />
      <div className="text-[13px] text-fg-secondary leading-relaxed text-left">
        <p className="font-medium text-fg-primary mb-0.5">
          Backend not configured
        </p>
        <p className="text-fg-tertiary">
          Add{" "}
          <code className="font-mono text-[12px] bg-bg-subtle border border-border-subtle px-1 py-0.5 rounded text-fg-secondary">
            ?backendUrl=YOUR_URL
          </code>{" "}
          or open{" "}
          <Settings className="h-3 w-3 inline mx-0.5" strokeWidth={1.75} />
          Settings to connect.
        </p>
      </div>
    </div>
  </div>
)

const SuggestionList = ({ onSuggestion: handleSuggestion }) => (
  <div className="mt-6 w-full max-w-2xl mx-auto">
    <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-fg-tertiary mb-2 px-1">
      Examples
    </p>
    <div className="flex flex-col gap-0.5">
      {SUGGESTIONS.map(({ icon: Icon, label, description, prompt }) => (
        <button
          key={label}
          type="button"
          onClick={() => handleSuggestion(prompt)}
          className="group flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-md hover:bg-bg-subtle active:bg-bg-muted transition-colors text-left"
        >
          <Icon
            className="w-4 h-4 text-fg-tertiary group-hover:text-fg-secondary transition-colors flex-shrink-0"
            strokeWidth={1.75}
          />
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span className="text-[14px] font-medium text-fg-primary truncate">
              {label}
            </span>
            <span className="text-[12px] sm:text-[13px] text-fg-tertiary truncate">
              {description}
            </span>
          </div>
          <ArrowRight
            className="w-3.5 h-3.5 text-fg-disabled opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hidden sm:block"
            strokeWidth={1.75}
          />
        </button>
      ))}
    </div>
  </div>
)

SuggestionList.propTypes = {
  onSuggestion: PropTypes.func.isRequired,
}

const EmptyChatUI = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState("")
  const [attachedFiles, setAttachedFiles] = useState([])
  const fileInputReference = useRef(null)
  const store = useSelector((state) => state?.settingsStore)

  const handleSubmit = (event) => {
    event.preventDefault()
    if ((message.trim() || attachedFiles.length > 0) && !disabled) {
      onSendMessage?.(message.trim(), attachedFiles)
      setMessage("")
      setAttachedFiles([])
    }
  }

  const handleFileChange = (event) => {
    const { files } = event.target
    if (files && files.length > 0) {
      const newFiles = [...files].filter(
        (file) => file.size <= 10 * 1024 * 1024
      )
      setAttachedFiles((previous) => [...previous, ...newFiles])
    }
  }

  const handleSuggestion = (prompt) => {
    if (!disabled) setMessage(prompt)
  }

  const handleRemoveFile = (fileToRemove) => {
    setAttachedFiles((previous) => previous.filter((f) => f !== fileToRemove))
  }

  const productName =
    store?.name && store.name.length > 0 ? store.name : "AgentFlow"

  return (
    <div className="flex items-center justify-center h-full w-full px-4 sm:px-6 overflow-y-auto">
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto py-6 sm:-mt-8">
        <div className="text-center mb-6 sm:mb-8 w-full">
          <h1 className="font-display text-[clamp(1.75rem,7vw,2.75rem)] font-semibold tracking-[-0.025em] leading-[1.05] text-fg-primary">
            {productName}
          </h1>
          <p className="mt-2 text-[14px] sm:text-[15px] leading-relaxed text-fg-secondary px-2 sm:px-0">
            Inspect, debug, and trace your agents — from prompt to production.
          </p>
          {disabled && <DisabledWarning />}
        </div>
        <EmptyInputCard
          onHandleSubmit={handleSubmit}
          message={message}
          setMessage={setMessage}
          onHandleFileChange={handleFileChange}
          fileInputReference={fileInputReference}
          attachedFiles={attachedFiles}
          onRemoveFile={handleRemoveFile}
          disabled={disabled}
        />
        {!disabled && <SuggestionList onSuggestion={handleSuggestion} />}
      </div>
    </div>
  )
}

EmptyChatUI.propTypes = {
  onNewChat: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

EmptyChatUI.defaultProps = {
  disabled: false,
}

export default EmptyChatUI
