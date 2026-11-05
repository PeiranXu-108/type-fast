"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "h-px w-full shrink-0 bg-gradient-to-r from-transparent via-hud-line to-transparent aria-[orientation=vertical]:h-auto aria-[orientation=vertical]:w-px aria-[orientation=vertical]:self-stretch aria-[orientation=vertical]:bg-gradient-to-b",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
