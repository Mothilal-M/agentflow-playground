import { ArrowUp, Paperclip, Image, FileText, X } from "lucide-react"
import PropTypes from "prop-types"

import { Button } from "@/components/ui/button"

const FilePreview = ({ file, handleRemove }) => {
  const isImage = file.type.startsWith("image/")

  const handleRemoveClick = () => handleRemove(file)

  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2 bg-bg-subtle rounded-md border border-border-subtle">
      <div className="w-7 h-7 rounded-md bg-bg-muted flex items-center justify-center flex-shrink-0">
        {isImage ? (
          <Image className="w-3.5 h-3.5 text-fg-tertiary" strokeWidth={1.75} />
        ) : (
          <FileText className="w-3.5 h-3.5 text-fg-tertiary" strokeWidth={1.75} />
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
        onClick={handleRemoveClick}
        className="h-7 w-7 text-fg-tertiary hover:bg-danger/10 hover:text-danger"
        aria-label={`Remove ${file.name}`}
      >
        <X className="w-3.5 h-3.5" strokeWidth={1.75} />
      </Button>
    </div>
  )
}

FilePreview.propTypes = {
  file: PropTypes.object.isRequired,
  handleRemove: PropTypes.func.isRequired,
}

const EmptyInputCard = ({
  onHandleSubmit,
  message,
  setMessage,
  onHandleFileChange,
  fileInputReference,
  attachedFiles = [],
  onRemoveFile,
  disabled = false,
}) => {
  const handleSubmit = onHandleSubmit
  const handleFileChange = onHandleFileChange

  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative w-full max-w-2xl mx-auto rounded-xl border border-border-subtle bg-bg-surface shadow-soft-sm focus-within:border-border-strong transition-colors">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex flex-col">
            {attachedFiles.length > 0 && (
              <div className="px-3 pt-3 space-y-1.5">
                {attachedFiles.map((file) => (
                  <FilePreview
                    key={`${file.name}-${file.size}`}
                    file={file}
                    handleRemove={onRemoveFile}
                  />
                ))}
              </div>
            )}
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={
                disabled
                  ? "Backend URL not configured. Open Settings to connect…"
                  : "Ask anything, or paste a prompt to start a thread…"
              }
              disabled={disabled}
              className="w-full bg-transparent min-h-[96px] max-h-[28vh] px-3.5 sm:px-4 pt-3.5 pb-2 resize-none focus:outline-none placeholder:text-fg-tertiary text-[15px] leading-relaxed text-fg-primary disabled:opacity-50 disabled:cursor-not-allowed"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !disabled) {
                  event.preventDefault()
                  handleSubmit(event)
                }
              }}
            />
            <div className="flex items-center justify-between px-2 pb-2 pt-1 gap-2">
              <label
                className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors text-fg-tertiary min-h-[36px] ${
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-bg-subtle hover:text-fg-secondary"
                }`}
              >
                <input
                  ref={fileInputReference}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.csv,.json,.png,.jpg,.jpeg,.gif,.svg"
                  onChange={handleFileChange}
                  disabled={disabled}
                  className="hidden"
                />
                <Paperclip className="w-4 h-4" strokeWidth={1.75} />
                <span className="text-[13px] font-medium hidden sm:inline">
                  Attach
                </span>
              </label>
              <Button
                type="submit"
                size="icon-sm"
                disabled={
                  (!message.trim() && attachedFiles.length === 0) || disabled
                }
                className="h-9 w-9 sm:h-8 sm:w-8 rounded-full p-0 bg-fg-primary text-bg-canvas hover:bg-fg-primary/90 disabled:bg-bg-muted disabled:text-fg-disabled"
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4" strokeWidth={2} />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

EmptyInputCard.propTypes = {
  onHandleSubmit: PropTypes.func.isRequired,
  message: PropTypes.string,
  setMessage: PropTypes.func.isRequired,
  onHandleFileChange: PropTypes.func,
  attachedFiles: PropTypes.array,
  onRemoveFile: PropTypes.func,
  fileInputReference: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  disabled: PropTypes.bool,
}

EmptyInputCard.defaultProps = {
  message: "",
  onHandleFileChange: undefined,
  attachedFiles: [],
  onRemoveFile: () => {},
  fileInputReference: null,
  disabled: false,
}

export default EmptyInputCard
