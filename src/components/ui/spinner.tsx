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
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Spinner }
