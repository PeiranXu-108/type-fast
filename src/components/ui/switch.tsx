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
  const rootSizeClasses = isSmall ? "h-6 w-10 p-0.5" : "h-7 w-12 p-0.5"
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
        "peer relative inline-flex shrink-0 cursor-pointer items-center overflow-hidden rounded-full border border-gray-400 bg-gray-300 transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[checked]:border-primary-600 data-[checked]:bg-primary-600 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:data-[checked]:border-primary-400 dark:data-[checked]:bg-primary-400 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        rootSizeClasses,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block translate-x-0 rounded-full bg-white shadow-sm ring-0 transition-transform",
          thumbSizeClasses,
          thumbTranslateClasses
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
