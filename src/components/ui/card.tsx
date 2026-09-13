import * as React from "react"

import { cn } from "@/lib/utils"

type CardSurface = "base" | "raised" | "interactive"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: CardSurface
}

/**
 * Interactive cards need an accessible name from visible text or aria-label/aria-labelledby.
 * Nested interactive controls are safe because keyboard activation only fires from the card itself.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, surface = "base", role, tabIndex, onClick, onKeyDown, onKeyUp, ...props }, ref) => {
  const surfaceClass = {
    base: "bg-card",
    raised: "bg-surface-raised",
    interactive:
      "bg-card cursor-pointer transition-colors hover:border-primary/40 active:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  }[surface]

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-radius-md border text-card-foreground shadow-sm",
        surfaceClass,
        className
      )}
      role={surface === "interactive" ? role ?? "button" : role}
      tabIndex={surface === "interactive" ? tabIndex ?? 0 : tabIndex}
      onClick={
        surface === "interactive"
          ? (event) => {
              // Nested controls own their own clicks: a click that lands on
              // (or inside) a nested link/button/field must not also activate
              // the card.
              if (
                (event.target as HTMLElement).closest(
                  'a,button,input,select,textarea,summary,[role="button"],[role="link"],[role="menuitem"]'
                ) !== event.currentTarget
              ) {
                return
              }
              onClick?.(event)
            }
          : onClick
      }
      onKeyDown={
        surface === "interactive"
          ? (event) => {
              onKeyDown?.(event)
              if (
                event.key === "Enter" &&
                event.target === event.currentTarget &&
                (event.target as HTMLElement).closest(
                  'a,button,input,select,textarea,summary,[role="button"],[role="link"],[role="menuitem"]'
                ) === event.currentTarget
              ) {
                onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>)
              }
              if (
                event.key === " " &&
                event.target === event.currentTarget &&
                (event.target as HTMLElement).closest(
                  'a,button,input,select,textarea,summary,[role="button"],[role="link"],[role="menuitem"]'
                ) === event.currentTarget
              ) {
                event.preventDefault()
              }
            }
          : onKeyDown
      }
      onKeyUp={
        surface === "interactive"
          ? (event) => {
              onKeyUp?.(event)
              if (
                event.key === " " &&
                event.target === event.currentTarget &&
                (event.target as HTMLElement).closest(
                  'a,button,input,select,textarea,summary,[role="button"],[role="link"],[role="menuitem"]'
                ) === event.currentTarget
              ) {
                onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>)
              }
            }
          : onKeyUp
      }
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
