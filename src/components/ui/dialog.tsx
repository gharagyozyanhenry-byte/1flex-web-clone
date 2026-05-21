import * as React from "react"
import { 
  Dialog as BlinkDialog, 
  DialogTrigger as BlinkDialogTrigger, 
  DialogContent as BlinkDialogContent,
  DialogHeader as BlinkDialogHeader,
  DialogFooter as BlinkDialogFooter,
  DialogTitle as BlinkDialogTitle,
  DialogDescription as BlinkDialogDescription,
  DialogPortal as BlinkDialogPortal,
  DialogOverlay as BlinkDialogOverlay,
  DialogClose as BlinkDialogClose
} from "@blinkdotnew/ui"
import { cn } from "@/lib/utils"

const Dialog = BlinkDialog
const DialogTrigger = BlinkDialogTrigger
const DialogPortal = BlinkDialogPortal
const DialogClose = BlinkDialogClose
const DialogOverlay = BlinkDialogOverlay

const DialogContent = React.forwardRef<
  React.ElementRef<typeof BlinkDialogContent>,
  React.ComponentPropsWithoutRef<typeof BlinkDialogContent>
>(({ className, children, ...props }, ref) => (
  <BlinkDialogContent
    ref={ref}
    className={cn(
      "bg-[#14141f] border-white/10 text-white rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-0 overflow-hidden",
      className
    )}
    {...props}
  >
    {children}
  </BlinkDialogContent>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = BlinkDialogHeader
const DialogFooter = BlinkDialogFooter
const DialogTitle = BlinkDialogTitle
const DialogDescription = BlinkDialogDescription

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
