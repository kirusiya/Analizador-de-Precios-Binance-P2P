import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  // Asegurarse de que los badges con fondos claros tengan texto oscuro
  const ensureVisibleText =
    (variant === "outline" && className?.includes("bg-")) ||
    className?.includes("bg-white") ||
    className?.includes("bg-gray-50") ||
    className?.includes("bg-amber-50") ||
    className?.includes("bg-blue-50") ||
    className?.includes("bg-green-50") ||
    className?.includes("bg-yellow-50")

  return (
    <div className={cn(badgeVariants({ variant }), className, ensureVisibleText ? "text-gray-800" : "")} {...props} />
  )
}

export { Badge, badgeVariants }
