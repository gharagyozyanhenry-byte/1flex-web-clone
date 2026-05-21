import * as React from "react"
import { Button as BlinkButton } from "@blinkdotnew/ui"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ComponentProps<typeof BlinkButton> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <BlinkButton
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          variant === 'default' && "bg-[#e50914] text-white hover:bg-[#b20710] font-bold transition-all duration-300",
          size === 'lg' && "h-14 px-8 text-lg rounded-full",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
