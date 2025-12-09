import * as React from "react"
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react"

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  onDismiss: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ id, title, description, variant = "default", onDismiss }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return "bg-red-950 border-red-500/50 text-red-100"
      case "success":
        return "bg-emerald-950 border-emerald-500/50 text-emerald-100"
      default:
        return "bg-slate-900 border-slate-700 text-slate-100"
    }
  }

  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      default:
        return <Info className="w-4 h-4 text-slate-400" />
    }
  }

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-sm border shadow-lg ${getVariantStyles()}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <p className="text-sm font-semibold">{title}</p>
            )}
            {description && (
              <p className="mt-1 text-xs opacity-80">{description}</p>
            )}
          </div>
          <button
            onClick={() => onDismiss(id)}
            className="flex-shrink-0 inline-flex rounded-sm p-1 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export { Toast }
export type { ToastProps }