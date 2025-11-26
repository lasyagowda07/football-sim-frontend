"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastProps = {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Toast(props: ToastProps) {
  const { title, description, action, open = true, onOpenChange } = props

  // Optionally, don't render at all if open is false
  if (!open) return null

  return (
    <div
      className={cn(
        "pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-lg border border-slate-800 bg-slate-900 p-4 text-slate-200 shadow-lg shadow-black/30"
      )}
    >
      <div className="flex w-full justify-between gap-3">
        <div>
          {title && (
            <p className="font-medium text-slate-100">
              {title}
            </p>
          )}
          {description && (
            <p className="mt-1 text-xs text-slate-300">
              {description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenChange?.(false)}
          className="text-slate-400 hover:text-slate-200 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}