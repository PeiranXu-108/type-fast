"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Spinner({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="spinner"
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent [filter:drop-shadow(0_0_3px_currentColor)]",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Spinner }
