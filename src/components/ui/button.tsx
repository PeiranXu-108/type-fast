"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-[3px] border border-transparent bg-clip-padding text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:shadow-[0_0_0_2px_color-mix(in_oklch,var(--primary)_60%,transparent)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "hud-btn-solid font-semibold",
        danger: "hud-btn-solid hud-btn-danger font-semibold",
        outline:
          "border-hud-line bg-panel/40 text-foreground hover:border-primary/70 hover:bg-primary/10 hover:shadow-[0_0_18px_-6px_var(--hud-glow)] aria-expanded:bg-primary/10",
        secondary:
          "border-hud-line/70 bg-secondary/70 text-secondary-foreground hover:border-primary/50 hover:bg-primary/10 aria-expanded:bg-primary/10",
        ghost:
          "text-muted-foreground hover:bg-primary/10 hover:text-foreground aria-expanded:bg-primary/10 aria-expanded:text-foreground",
        destructive:
          "border-destructive/50 bg-destructive/10 text-destructive hover:border-destructive hover:bg-destructive/20 hover:shadow-[0_0_18px_-6px_var(--destructive)] focus-visible:shadow-[0_0_0_2px_color-mix(in_oklch,var(--destructive)_55%,transparent)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-3.5 [--cut:7px]",
        xs: "h-6 gap-1 px-2 text-xs [--cut:4px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 text-[0.8rem] [--cut:6px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-5 [--cut:9px]",
        icon: "size-9 [--cut:6px]",
        "icon-xs": "size-6 [--cut:4px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 [--cut:5px]",
        "icon-lg": "size-10 [--cut:7px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
