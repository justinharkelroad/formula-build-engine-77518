import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// BRAND_CONTRACT.md Step 4 roles: default = primary, secondary = secondary,
// outline = outline, ghost = ghost, and destructive = destructive; cta,
// warning, and link are explicit marketing-only extensions.
// --ring is Formula orange (#FF8142) against pure-black background, so the focus ring clears contrast.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "bg-gradient-primary text-white font-semibold hover:scale-105 transform shadow-brand transition-smooth",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-brand transition-smooth",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-12 text-lg font-semibold",
        icon: "h-10 w-10",
        // BRAND_CONTRACT.md Step 4 sm/md/lg button-size vocabulary for future call sites.
        "sm-contract": "h-9 px-space-md",
        "md-contract": "h-11 px-space-lg",
        "lg-contract": "h-[50px] px-space-lg",
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
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    disabled,
    children,
    "aria-busy": ariaBusy,
    onClick,
    onAuxClick,
    onDoubleClick,
    onKeyDown,
    onKeyUp,
    onMouseDown,
    onMouseUp,
    onPointerDown,
    onPointerUp,
    onTouchStart,
    onTouchEnd,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isGuarded = loading || disabled
    // Every Button-level handler that can start or complete an activation.
    // Radix Slot composes these with the slotted child's handlers by calling
    // the child's first and then the Slot's — even after the child handler
    // has cancelled the event — so while inert they are withheld from Slot
    // entirely instead of relying on preventDefault/stopPropagation.
    const activationHandlers = {
      onClick,
      onAuxClick,
      onDoubleClick,
      onKeyDown,
      onKeyUp,
      onMouseDown,
      onMouseUp,
      onPointerDown,
      onPointerUp,
      onTouchStart,
      onTouchEnd,
    }
    const enabledHandlers = Object.fromEntries(
      Object.entries(activationHandlers).filter(([, value]) => value !== undefined)
    )
    // Loading overlay: the label keeps its box (opacity-0, still in the
    // accessibility tree) and the spinner shares the same grid cell, so the
    // control's footprint and accessible name do not change while loading.
    // `inner` is the label content — the Button's own children for a native
    // button, or the slotted element's children when asChild — never the
    // slotted element itself.
    const loadingOverlay = (inner: React.ReactNode) => (
      <span className="relative inline-grid place-items-center">
        <span className="col-start-1 row-start-1 inline-flex items-center gap-2 opacity-0">
          {inner}
        </span>
        <span
          aria-hidden="true"
          className="col-start-1 row-start-1 animate-spin rounded-full h-4 w-4 border-b-2 border-current"
        />
      </span>
    )

    if (asChild && isGuarded) {
      const child = React.Children.only(
        children
      ) as React.ReactElement<{ children?: React.ReactNode }>
      const guard = (event: React.SyntheticEvent) => {
        event.preventDefault()
        event.stopPropagation()
      }
      // Keyboard: cancel only the keys that activate the control. Tab,
      // Shift+Tab, arrows and Escape must keep working — an inert slotted
      // link stays focusable (aria-disabled), so cancelling every key would
      // trap keyboard focus on it. Space only activates a slotted <button>;
      // on an anchor it scrolls the page and is left alone.
      const isActivationKey = (event: React.KeyboardEvent) =>
        event.key === "Enter" || (event.key === " " && child.type === "button")
      const keyGuard = (event: React.KeyboardEvent) => {
        if (isActivationKey(event)) guard(event)
      }
      const injectedProps: React.HTMLAttributes<HTMLElement> & {
        disabled?: boolean
        "aria-busy"?: boolean
        "aria-disabled": true
        "data-loading"?: true
      } = {
        "aria-disabled": true,
        "aria-busy": loading || undefined,
        // These REPLACE the slotted child's own handlers (cloneElement props
        // win); the Button's own activation handlers are withheld from Slot
        // below, so neither side can run while inert.
        onClick: guard,
        onAuxClick: guard,
        onDoubleClick: guard,
        onKeyDown: keyGuard,
        onKeyUp: keyGuard,
      }

      if (loading) {
        injectedProps["data-loading"] = true
      }
      if (child.type === "button") {
        injectedProps.disabled = true
      }

      const guardedChild = React.cloneElement(
        child,
        injectedProps,
        loading ? loadingOverlay(child.props.children) : child.props.children
      )

      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            loading && "pointer-events-none"
          )}
          ref={ref}
          aria-busy={ariaBusy}
          {...props}
        >
          {guardedChild}
        </Comp>
      )
    }

    const content = loading ? loadingOverlay(children) : children

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          loading && "pointer-events-none"
        )}
        ref={ref}
        disabled={asChild ? undefined : disabled || loading}
        aria-busy={loading ? true : ariaBusy}
        {...props}
        {...enabledHandlers}
      >
        {content}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
