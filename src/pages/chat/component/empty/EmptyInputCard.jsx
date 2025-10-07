import { Send, Paperclip } from "lucide-react"
import PropTypes from "prop-types"

import { ShineBorder } from "@/components/magicui/shine-border"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const EmptyInputCard = ({
  onHandleSubmit,
  message,
  setMessage,
  onHandleFileChange,
  onHandleFileAttach,
  fileInputReference,
}) => {
  const handleSubmit = onHandleSubmit
  const handleFileChange = onHandleFileChange
  const handleFileAttach = onHandleFileAttach
  return (
    <div className="w-full max-w-3xl mb-8 relative">
      <Card className="relative overflow-hidden">
        <ShineBorder
          shineColor={["#60A5FA", "#8B5CF6", "#F59E0B"]}
          borderWidth={1}
          duration={8}
          className="rounded-lg"
        />
        <form onSubmit={handleSubmit}>
          <CardContent className="p-0">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type your message here to start a new chat..."
              className="w-full h-32 px-6 py-4 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground text-base"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  handleSubmit(event)
                }
              }}
            />
            <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/10">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleFileAttach}
                  className="h-8 w-8 p-0 hover:bg-accent"
                  title="Attach files to start new chat"
                >
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                </Button>
                <input
                  ref={fileInputReference}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.csv,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}

EmptyInputCard.propTypes = {
  onHandleSubmit: PropTypes.func.isRequired,
  message: PropTypes.string,
  setMessage: PropTypes.func.isRequired,
  onHandleFileChange: PropTypes.func,
  onHandleFileAttach: PropTypes.func,
  // ref can be a callback or an object created by useRef
  fileInputReference: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
}

EmptyInputCard.defaultProps = {
  message: "",
  onHandleFileChange: undefined,
  onHandleFileAttach: undefined,
  fileInputReference: null,
}

export default EmptyInputCard
