import { Plus, MoreHorizontal, Trash2, Search, X } from "lucide-react"
import PropTypes from "prop-types"
import { useMemo, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  deleteThread,
  setActiveThread,
  fetchApiThreads,
  selectThread,
} from "@/services/store/slices/chat.slice"
import ct from "@constants/"

const getThreadPreview = (thread) => {
  const latestMessage = thread.messages?.[thread.messages.length - 1]
  const content = String(latestMessage?.content || "")
    .replace(/\s+/g, " ")
    .trim()

  return content || "No messages yet"
}

const getDayStart = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

const getSectionLabel = (dateString) => {
  const date = new Date(dateString)
  const today = getDayStart(new Date())
  const target = getDayStart(date)
  const diffInDays = Math.round((today - target) / (1000 * 60 * 60 * 24))

  if (diffInDays <= 0) return "Today"
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays <= 7) return "Previous 7 days"
  if (diffInDays <= 30) return "Previous 30 days"
  return "Older"
}

const formatItemDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })
}

const groupThreads = (threads) => {
  const sections = []
  const sectionIndex = new Map()

  threads.forEach((thread) => {
    const label = getSectionLabel(thread.updatedAt)
    const existingIndex = sectionIndex.get(label)

    if (existingIndex !== undefined) {
      sections[existingIndex].threads.push(thread)
      return
    }

    sectionIndex.set(label, sections.length)
    sections.push({
      label,
      threads: [thread],
    })
  })

  return sections
}

const ThreadItem = ({ thread, isActive, onSelect, onDelete }) => (
  <div
    role="button"
    tabIndex={0}
    className={cn(
      "group relative w-full rounded-md px-2.5 py-2 sm:py-1.5 text-left outline-none transition-colors cursor-pointer",
      isActive
        ? "bg-bg-surface text-fg-primary"
        : "text-fg-secondary hover:bg-bg-surface/60 active:bg-bg-muted"
    )}
    onClick={() => onSelect(thread.id)}
    onKeyDown={(event) => event.key === "Enter" && onSelect(thread.id)}
  >
    {isActive && (
      <span
        aria-hidden
        className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full bg-fg-primary"
      />
    )}

    <div className="min-w-0 pr-7 pl-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <p
          title={thread.title}
          className={cn(
            "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] leading-5",
            isActive ? "font-medium text-fg-primary" : "text-fg-secondary"
          )}
        >
          {thread.title}
        </p>
        <span className="shrink-0 text-[11px] tabular-nums text-fg-tertiary">
          {formatItemDate(thread.updatedAt)}
        </span>
      </div>
    </div>

    <div
      className={cn(
        "absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity",
        isActive
          ? "opacity-100"
          : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 rounded-md text-fg-tertiary hover:bg-bg-muted hover:text-fg-primary"
            onClick={(event) => event.stopPropagation()}
            aria-label="Thread options"
          >
            <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-32 bg-bg-surface border border-border-subtle"
        >
          <DropdownMenuItem
            onClick={(event) => onDelete(thread.id, event)}
            className="text-danger focus:text-danger focus:bg-danger/10"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
)

const ThreadSection = ({
  label,
  threads,
  activeThreadId,
  urlThreadId,
  onSelect: handleSelect,
  onDelete: handleDelete,
}) => (
  <section>
    <div className="px-2 pb-1 pt-3 first:pt-0">
      <h3 className="text-[11px] font-medium tracking-[0.06em] uppercase text-fg-tertiary">
        {label}
      </h3>
    </div>
    <div>
      {threads.map((thread) => (
        <ThreadItem
          key={thread.id}
          thread={thread}
          isActive={urlThreadId === thread.id || activeThreadId === thread.id}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      ))}
    </div>
  </section>
)

const EmptyThreadsView = ({ hasQuery }) => (
  <div className="px-3 pt-10 text-center">
    <p className="text-[13px] font-medium text-fg-secondary">
      {hasQuery ? "No matching threads" : "No conversations yet"}
    </p>
    <p className="mt-1 text-[12px] leading-5 text-fg-tertiary">
      {hasQuery ? "Try a different search term." : "Start a new chat to begin."}
    </p>
  </div>
)

EmptyThreadsView.propTypes = {
  hasQuery: PropTypes.bool,
}

EmptyThreadsView.defaultProps = {
  hasQuery: false,
}

const ThreadListHeader = ({ count, isVerified, onNewChat }) => {
  const handleNewChat = onNewChat
  return (
    <div className="px-3 pt-3 pb-2">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-[13px] font-medium tracking-tight text-fg-secondary">
          Threads
          {count > 0 && (
            <span className="ml-1.5 text-fg-tertiary tabular-nums font-normal">
              {count}
            </span>
          )}
        </h2>
      </div>
      <Button
        onClick={handleNewChat}
        disabled={!isVerified}
        variant="default"
        size="sm"
        className="w-full justify-start gap-2 h-9 sm:h-8 px-2.5 bg-bg-surface border border-border-subtle text-fg-primary hover:bg-bg-muted disabled:opacity-50 shadow-soft-xs"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="text-[13px] font-medium">New thread</span>
        <span className="ml-auto text-[10.5px] font-mono text-fg-tertiary hidden sm:inline">
          ⌘N
        </span>
      </Button>
    </div>
  )
}

ThreadListHeader.propTypes = {
  count: PropTypes.number.isRequired,
  isVerified: PropTypes.bool.isRequired,
  onNewChat: PropTypes.func.isRequired,
}

const SearchInput = ({ value, onChange }) => (
  <div className="px-3 pb-2">
    <div className="relative">
      <Search
        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-tertiary pointer-events-none"
        strokeWidth={1.75}
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search threads"
        className="w-full h-9 sm:h-8 pl-8 pr-7 bg-transparent border border-border-subtle rounded-md text-[13px] text-fg-primary placeholder:text-fg-tertiary focus:outline-none focus:border-border-strong transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-tertiary hover:text-fg-primary"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      )}
    </div>
  </div>
)

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

const ThreadList = ({ className }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState("")

  const searchParameters = new URLSearchParams(location.search)
  const threadId = searchParameters.get("threadId")

  const { threads, activeThreadId } = useSelector(
    (state) => state[ct.store.CHAT_STORE]
  )

  const storeSettings = useSelector((state) => state[ct.store.SETTINGS_STORE])
  const isVerified = Boolean(storeSettings?.verification?.isVerified)

  useEffect(() => {
    if (isVerified) {
      dispatch(fetchApiThreads())
    }
  }, [isVerified, dispatch])

  const sortedThreads = useMemo(
    () =>
      [...threads].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      ),
    [threads]
  )

  const filteredThreads = useMemo(() => {
    if (!query.trim()) return sortedThreads
    const q = query.trim().toLowerCase()
    return sortedThreads.filter((t) => {
      const title = (t.title || "").toLowerCase()
      const preview = getThreadPreview(t).toLowerCase()
      return title.includes(q) || preview.includes(q)
    })
  }, [sortedThreads, query])

  const groupedThreads = useMemo(
    () => groupThreads(filteredThreads),
    [filteredThreads]
  )

  const handleSelectThread = (id) => {
    dispatch(selectThread(id))
    navigate("/")
  }

  const handleDeleteThread = (id, event) => {
    event.stopPropagation()
    dispatch(deleteThread(id))
    if (threadId === id || activeThreadId === id) {
      dispatch(setActiveThread(null))
      navigate("/")
    }
  }

  const handleNewChatMaybe = () => {
    if (isVerified) {
      dispatch(setActiveThread(null))
      navigate("/")
    }
  }

  return (
    <div className={cn("flex h-full flex-col bg-bg-subtle", className)}>
      <ThreadListHeader
        count={sortedThreads.length}
        isVerified={isVerified}
        onNewChat={handleNewChatMaybe}
      />
      {sortedThreads.length > 0 && (
        <SearchInput value={query} onChange={setQuery} />
      )}
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-2 py-1 pb-4">
          {groupedThreads.length === 0 ? (
            <EmptyThreadsView hasQuery={Boolean(query.trim())} />
          ) : (
            <div>
              {groupedThreads.map((section) => (
                <ThreadSection
                  key={section.label}
                  label={section.label}
                  threads={section.threads}
                  activeThreadId={activeThreadId}
                  urlThreadId={threadId}
                  onSelect={handleSelectThread}
                  onDelete={handleDeleteThread}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

ThreadItem.propTypes = {
  thread: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    messages: PropTypes.array.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

ThreadSection.propTypes = {
  label: PropTypes.string.isRequired,
  threads: PropTypes.array.isRequired,
  activeThreadId: PropTypes.string,
  urlThreadId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

ThreadSection.defaultProps = {
  activeThreadId: null,
  urlThreadId: null,
}

ThreadList.propTypes = {
  className: PropTypes.string,
}

ThreadList.defaultProps = {
  className: "",
}

export default ThreadList
