'use client';

import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatFileSize, formatDate } from "@/lib/duplicate-check"

interface DuplicateHandlingDialogProps {
  fileName: string
  newFileSize: number
  existingFile: {
    id: string
    name: string
    uploadedAt: Date
    size: number
  }
  suggestedName: string
  onRename: (newName: string) => void
  onReplace: () => void
  onSkip: () => void
  isLoading?: boolean
}

export function DuplicateHandlingDialog({
  fileName,
  newFileSize,
  existingFile,
  suggestedName,
  onRename,
  onReplace,
  onSkip,
  isLoading = false,
}: DuplicateHandlingDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">File Already Exists</h2>
        </div>

        <p className="text-foreground/70 mb-4">
          A file named <span className="font-semibold text-foreground">"{fileName}"</span> already exists in this location. What would you like to do?
        </p>

        <div className="bg-muted/50 border border-border rounded-lg p-3 md:p-4 mb-6 space-y-3">
          <div>
            <p className="text-xs text-foreground/60 font-semibold">EXISTING FILE</p>
            <p className="text-sm font-medium text-foreground">{existingFile.name}</p>
            <p className="text-xs text-foreground/60">
              {formatFileSize(existingFile.size)} • {formatDate(existingFile.uploadedAt)}
            </p>
          </div>

          <div className="h-px bg-border" />

          <div>
            <p className="text-xs text-foreground/60 font-semibold">NEW FILE</p>
            <p className="text-sm font-medium text-foreground">{fileName}</p>
            <p className="text-xs text-foreground/60">{formatFileSize(newFileSize)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => onRename(suggestedName)}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            Keep Both
            <span className="text-xs ml-2 opacity-75">(rename to {suggestedName})</span>
          </Button>

          <Button
            onClick={onReplace}
            disabled={isLoading}
            className="w-full bg-transparent"
            variant="outline"
          >
            Replace
            <span className="text-xs ml-2 opacity-75">(overwrite existing)</span>
          </Button>

          <Button
            onClick={onSkip}
            disabled={isLoading}
            variant="ghost"
            className="w-full"
          >
            Skip This File
          </Button>
        </div>
      </div>
    </div>
  )
}
