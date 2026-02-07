import { MessageSquarePlus, MoreVertical, Trash2 } from "lucide-react"
import PropTypes from "prop-types"
import { useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
} from "@/services/store/slices/chat.slice"
import ct from "@constants/"
// Tooltip components are not used here; remove to satisfy lint

// Helper function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else if (diffInHours < 168) {
    // 7 days
    return date.toLocaleDateString([], { weekday: "short" })
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }
}

// ThreadItem component to handle individual thread rendering
const ThreadItem = ({ thread, isActive, onSelect, onDelete }) => (
  <Card
    className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent w-full text-left ${
      isActive ? "bg-accent text-accent-foreground" : ""
    }`}
    onClick={() => onSelect(thread.id)}
  >
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-medium truncate">
        {thread.title.slice(0, 30)}
      </h3>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground truncate flex-1">
          {thread.messages.length > 0
            ? thread.messages[thread.messages.length - 1].content.slice(0, 30)
            : "No messages yet"}
        </p>
        <span className="text-xs text-muted-foreground ml-2">
          {formatDate(thread.updatedAt)}
        </span>
      </div>
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(event) => onDelete(thread.id, event)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </Card>
)

const ThreadList = ({ className }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get threadId from URL search params
  const searchParams = new URLSearchParams(location.search)
  const threadId = searchParams.get("threadId")

  const { threads, activeThreadId } = useSelector(
    (state) => state[ct.store.CHAT_STORE]
  )

  const storeSettings = useSelector((state) => state[ct.store.SETTINGS_STORE])
  const isVerified = Boolean(storeSettings?.verification?.isVerified)

  // Sort threads by updatedAt in descending order
  const sortedThreads = useMemo(() => {
    return [...threads].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    )
  }, [threads])

  const handleNewChatClick = () => {
    // Clear active thread and navigate to home page (empty state)
    // The thread will be created when user sends the first message
    dispatch(setActiveThread(null))
    navigate("/")
  }

  const handleSelectThread = (id) => {
    dispatch(setActiveThread(id))
    // Navigate to home page (dashboard) without threadId in URL
    // The Dashboard component will handle displaying the selected thread
    navigate("/")
  }

  const handleDeleteThread = (id, event) => {
    event.stopPropagation()
    dispatch(deleteThread(id))

    // Navigate to dashboard root if deleting current thread
    if (threadId === id || activeThreadId === id) {
      dispatch(setActiveThread(null))
      navigate("/")
    }
  }

  const handleNavigateToChat = () => {
    // Clear active thread and navigate to dashboard (home page)
    dispatch(setActiveThread(null))
    navigate("/")
  }

  const handleNewChatMaybe = () => {
    if (isVerified) handleNewChatClick()
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between p-2 flex-shrink-0">
        <Button variant="ghost" onClick={handleNavigateToChat}>
          Chats
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewChatMaybe}
          disabled={!isVerified}
          className="h-8 w-8"
          aria-label="New chat"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-1">
          {sortedThreads.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              <MessageSquarePlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a new chat to begin</p>
            </div>
          ) : (
            sortedThreads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isActive={
                  threadId === thread.id || activeThreadId === thread.id
                }
                onSelect={handleSelectThread}
                onDelete={handleDeleteThread}
              />
            ))
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

ThreadList.propTypes = {
  className: PropTypes.string,
}

ThreadList.defaultProps = {
  className: "",
}

export default ThreadList
