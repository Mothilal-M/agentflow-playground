import PropTypes from "prop-types"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const DevelopmentToolButton = ({
  icon: Icon,
  tooltip,
  handleActivate,
  isActive,
  disabled = false,
  text = "",
}) => {
  const handleClick = disabled ? undefined : handleActivate

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleClick}
          disabled={disabled}
          className={`h-8 w-8 p-0 transition-colors ${
            disabled
              ? "text-fg-disabled opacity-50 cursor-not-allowed"
              : "text-fg-tertiary hover:bg-bg-subtle hover:text-fg-primary"
          } ${
            isActive && !disabled
              ? "bg-bg-subtle text-fg-primary"
              : ""
          }`}
          aria-label={tooltip}
        >
          {text} <Icon className="h-4 w-4" strokeWidth={1.75} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{disabled ? "Configure backend URL in Settings first" : tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

DevelopmentToolButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  tooltip: PropTypes.string.isRequired,
  handleActivate: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  text: PropTypes.string,
}

DevelopmentToolButton.defaultProps = {
  disabled: false,
  text: "",
}

export default DevelopmentToolButton
