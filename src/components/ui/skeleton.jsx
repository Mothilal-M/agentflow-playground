import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-bg-subtle",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
