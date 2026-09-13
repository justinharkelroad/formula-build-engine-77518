import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    // BRAND_CONTRACT.md Step 4 status chips use semantic role colors, radius.sm,
    // space.xs padding, and compact uppercase labels.
    variants: {
      variant: {
        default:
          "rounded-full px-2.5 py-0.5 text-xs border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "rounded-full px-2.5 py-0.5 text-xs border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "rounded-full px-2.5 py-0.5 text-xs border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "rounded-full px-2.5 py-0.5 text-xs text-foreground",
        error:
          "rounded-radius-sm px-space-xs py-space-xs text-[10px] uppercase tracking-wide border-transparent bg-[hsl(var(--status-error))] text-white",
        success:
          "rounded-radius-sm px-space-xs py-space-xs text-[10px] uppercase tracking-wide border-transparent bg-[hsl(var(--status-success))] text-white",
        warning:
          "rounded-radius-sm px-space-xs py-space-xs text-[10px] uppercase tracking-wide border-transparent bg-[hsl(var(--status-warning))] text-white",
        neutral:
          "rounded-radius-sm px-space-xs py-space-xs text-[10px] uppercase tracking-wide border-transparent bg-surface-raised text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
