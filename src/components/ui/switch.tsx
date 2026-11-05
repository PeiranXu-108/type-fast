import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  const isSmall = size === "sm"
  const rootSizeClasses = isSmall ? "h-6 w-10 p-0.5" : "h-7 w-12 p-[3px]"
  const thumbSizeClasses = isSmall ? "size-4" : "size-5"
  const thumbTranslateClasses = isSmall
    ? "data-[checked]:translate-x-4"
    : "data-[checked]:translate-x-5"

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      nativeButton
      render={<button type="button" />}
      className={cn(
        "peer relative inline-flex shrink-0 cursor-pointer items-center rounded-[3px] border border-hud-line bg-muted/70 transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:shadow-[0_0_0_2px_color-mix(in_oklch,var(--primary)_60%,transparent)] aria-invalid:border-destructive data-[checked]:border-primary data-[checked]:bg-primary/20 data-[checked]:shadow-[0_0_16px_-4px_var(--hud-glow)] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        rootSizeClasses,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block translate-x-0 rounded-[2px] bg-muted-foreground/60 transition-all duration-200 data-[checked]:bg-primary data-[checked]:shadow-[0_0_10px_var(--primary)]",
          thumbSizeClasses,
          thumbTranslateClasses
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
