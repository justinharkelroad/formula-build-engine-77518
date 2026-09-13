import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// BRAND_CONTRACT.md Step 4 Input roles: py-2 intentionally keeps the web field compact
// while preserving the existing h-10 field height instead of using native 14px padding.
const inputVariants = cva(
  "flex h-10 w-full rounded-radius-md border bg-surface-raised px-space-lg py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 md:text-sm",
  {
    // BRAND_CONTRACT.md Step 4 Input roles: error uses semantic destructive border/ring tokens.
    variants: {
      error: {
        false: "border-input focus-visible:ring-ring",
        true: "border-destructive focus-visible:ring-destructive",
      },
    },
    defaultVariants: {
      error: false,
    },
  }
)

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, "aria-invalid": ariaInvalid, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ error }), className)}
        ref={ref}
        aria-invalid={ariaInvalid ?? (error ? "true" : undefined)}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

interface InputHelperTextProps {
  error?: boolean
  children: React.ReactNode
}

function InputHelperText({ error = false, children }: InputHelperTextProps) {
  return (
    <p
      className={cn(
        "mt-space-xs text-xs",
        error ? "text-destructive" : "text-muted-foreground"
      )}
    >
      {children}
    </p>
  )
}

export { Input, InputHelperText }
