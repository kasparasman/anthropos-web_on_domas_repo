import React from 'react'
import { useToast } from '@/lib/hooks/use-toast'

export default function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-black text-main border border-main rounded-lg shadow-lg px-4 py-3 flex flex-col gap-1"
        >
          {toast.title && <div className="font-bold">{toast.title}</div>}
          {toast.description && <div>{toast.description}</div>}
          <button
            className="absolute top-1 right-2 text-main hover:text-secondary"
            onClick={() => dismiss(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
