"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const outerDivVariants = cva("relative inline-block overflow-hidden", {
  variants: {
    rounded: {
      full: "rounded-full",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
    },
  },
  defaultVariants: { rounded: "xl" },
})

const innerSpanVariants = cva("absolute inset-[-1000%] m-auto block", {
  variants: {
    animation: {
      spin: "animate-[spin_4s_linear_infinite]",
      "spin-slow": "animate-[spin_8s_linear_infinite]",
      "spin-fast": "animate-[spin_2s_linear_infinite]",
    },
    gradient: {
      cyan: "bg-[conic-gradient(from_90deg_at_50%_50%,#00b4d8_0%,#0077b6_50%,#00b4d8_100%)]",
      nebula: "bg-[conic-gradient(from_90deg_at_50%_50%,#A77BFE_0%,#8860D0_50%,#A77BFE_100%)]",
      default: "bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]",
    },
  },
  defaultVariants: { animation: "spin", gradient: "cyan" },
})

const buttonVariants = cva(
  "relative px-6 py-2 transition-all duration-150 ease-in-out text-sm overflow-hidden font-semibold",
  {
    variants: {
      rounded: { full: "rounded-full", xl: "rounded-xl", "2xl": "rounded-2xl" },
      gradient: {
        cyan: "text-white bg-zinc-950",
        nebula: "text-white bg-zinc-950",
        default: "text-white bg-zinc-950",
      },
      size: {
        sm: "text-xs px-4 py-1",
        default: "text-sm px-6 py-2",
        lg: "text-base px-8 py-3",
      },
    },
    defaultVariants: { rounded: "xl", size: "default" },
  }
)

export interface BgAnimateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rounded?: "full" | "xl" | "2xl"
  animation?: "spin" | "spin-slow" | "spin-fast"
  gradient?: "cyan" | "nebula" | "default"
  size?: "sm" | "default" | "lg"
  asChild?: boolean
}

const BgAnimateButton = React.forwardRef<HTMLButtonElement, BgAnimateButtonProps>(
  ({ rounded = "xl", animation = "spin", gradient = "cyan", size = "default", className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(outerDivVariants({ rounded }), className)} ref={ref} {...props}>
        <span className={cn(innerSpanVariants({ gradient, animation }))} />
        <div className={cn(buttonVariants({ rounded, gradient, size }))}>
          {props.children || "Button"}
        </div>
      </Comp>
    )
  }
)
BgAnimateButton.displayName = "BgAnimateButton"
export { BgAnimateButton }
