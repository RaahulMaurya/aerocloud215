"use client"

import { AlertTriangle, Trash2, CreditCard } from "lucide-react"

interface StorageFullModalProps {
  onUpgrade: () => void
  onManageFiles: () => void
  onClose: () => void
  storagePercent?: number
}

export function StorageFullModal({ onUpgrade, onManageFiles, onClose, storagePercent = 100 }: StorageFullModalProps) {
  const getWarningMessage = () => {
    if (storagePercent >= 95) return "Your storage is almost full! Only 5% remaining."
    if (storagePercent >= 90) return "Your storage is 90% full. Consider upgrading or deleting files."
    if (storagePercent >= 80) return "Your storage is 80% full. You may want to manage your files soon."
    if (storagePercent >= 70) return "Your storage is 70% full. Time to review your files."
    if (storagePercent >= 60) return "Your storage is 60% full. Keep an eye on your storage."
    if (storagePercent >= 50) return "Your storage is 50% full. You're halfway there!"
    return "Your storage is full. Upgrade to a premium plan or delete some files to continue uploading."
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border">
        <div className="flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        <h2 className="text-2xl font-bold text-foreground text-center mb-2">
          {storagePercent >= 100 ? "Storage Full" : "Storage Warning"}
        </h2>
        <p className="text-foreground/60 text-center mb-6">{getWarningMessage()}</p>

        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:shadow-lg transition"
          >
            <CreditCard size={18} />
            Upgrade Plan
          </button>

          <button
            onClick={onManageFiles}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition border border-border"
          >
            <Trash2 size={18} />
            Manage Files
          </button>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 text-foreground/60 hover:text-foreground rounded-xl font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
