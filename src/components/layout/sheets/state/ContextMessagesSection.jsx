import { Plus, MessageSquare } from "lucide-react"
import PropTypes from "prop-types"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

import ContextMessage from "./ContextMessage"

/**
 * ContextMessagesSection component displays the context messages array
 * @param {object} props - Component props
 * @param {Array} props.context - Array of context messages
 * @param {Function} props.handleAddMessage - Function to handle adding a new message
 * @param {Function} props.onRemoveMessage - Function to handle removing a message
 * @returns {object} Card component displaying context messages
 */
const ContextMessagesSection = ({
  context,
  handleAddMessage,
  onRemoveMessage,
}) => {
  return (
    <Card className="p-2">
      <div className="flex w-full justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <MessageSquare className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <Label className="text-sm font-semibold text-foreground">
              Context Messages ({(context || []).length})
            </Label>
            <p className="text-xs text-muted-foreground">
              Conversation history: Short Term Memory
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleAddMessage}
          className="bg-primary/10 hover:bg-primary/20 text-primary border-0"
        >
          <Plus />
          Add
        </Button>
      </div>
      <div className="space-y-4">
        {(context || []).map((message, messageIndex) => (
          <ContextMessage
            key={`message-${message.message_id || messageIndex}`}
            message={message}
            index={messageIndex}
            handleRemove={() => onRemoveMessage(messageIndex)}
          />
        ))}
        {(context || []).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              No messages yet. Click &quot;Add&quot; to start.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

ContextMessagesSection.propTypes = {
  context: PropTypes.array.isRequired,
  handleAddMessage: PropTypes.func.isRequired,
  onRemoveMessage: PropTypes.func.isRequired,
}

export default ContextMessagesSection
