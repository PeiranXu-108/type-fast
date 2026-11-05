import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-[3px] border border-hud-line bg-panel/50 px-3 py-1 text-base transition-all outline-none file:mr-3 file:h-7 file:cursor-pointer file:rounded-[2px] file:border file:border-solid file:border-primary/50 file:bg-primary/10 file:px-2.5 file:font-mono file:text-xs file:font-semibold file:tracking-wider file:text-primary placeholder:text-muted-foreground/70 hover:border-primary/50 focus-visible:border-primary focus-visible:bg-primary/[0.05] focus-visible:shadow-[0_0_0_1px_var(--primary),0_0_18px_-6px_var(--hud-glow)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
