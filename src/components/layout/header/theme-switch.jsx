import { MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { useTheme } from "@/lib/context/theme-provider"

/**
 * ModeToggle component allows users to switch between light and dark themes.
 */
const ModeToggle = () => {
  const { setTheme, theme } = useTheme()

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative h-8 w-8 text-fg-tertiary hover:text-fg-primary hover:bg-bg-subtle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Switch theme"
          >
            <SunIcon
              className="h-4 w-4 rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100"
              strokeWidth={1.75}
            />
            <MoonIcon
              className="absolute h-4 w-4 rotate-0 transition-transform duration-300 dark:-rotate-90 dark:scale-0"
              strokeWidth={1.75}
            />
            <span className="sr-only">Switch theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Switch theme</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ModeToggle
