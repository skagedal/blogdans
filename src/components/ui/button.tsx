import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/styling"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-emerald-600 text-white hover:bg-emerald-700 \
       dark:bg-emerald-500 dark:hover:bg-emerald-600",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 \
       dark:bg-rose-500 dark:hover:bg-rose-600",
        outline:
          "border border-slate-300 bg-white text-slate-900 \
       hover:bg-slate-50 \
       dark:border-slate-600 dark:bg-transparent dark:text-slate-200 \
       dark:hover:bg-slate-800/50",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200 \
       dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600",
        ghost: "text-slate-800 hover:bg-slate-100 \
       dark:text-slate-200 dark:hover:bg-slate-800/4",
        link: "text-emerald-700 underline-offset-4 hover:underline \
       dark:text-emerald-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
