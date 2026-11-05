import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-[3px] border border-hud-line bg-panel/50 px-3 py-2 text-base transition-[border-color,box-shadow,background-color] outline-none placeholder:text-muted-foreground/70 hover:border-primary/50 focus-visible:border-primary focus-visible:bg-primary/[0.04] focus-visible:shadow-[0_0_0_1px_var(--primary),0_0_22px_-8px_var(--hud-glow)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
        className
      )}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
