"use client"

import { cn } from "@/lib/utils"



export function LoadingSpinner({ size = "md", className }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn("animate-spin rounded-full border-2 border-muted border-t-primary", sizeClasses[size])} />
      <div className={cn("absolute inset-0 animate-ping rounded-full border border-primary/20", sizeClasses[size])} />
    </div>
  )
}
