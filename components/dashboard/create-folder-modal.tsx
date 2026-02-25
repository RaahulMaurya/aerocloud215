"use client"

import { X, FolderPlus } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ref, uploadBytes } from "firebase/storage"
import { doc, setDoc } from "firebase/firestore"
import { storage, db } from "@/lib/firebase"

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function CreateFolderModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [folderName, setFolderName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!user || !folderName.trim()) return

    setLoading(true)
    try {
      const folderId = generateUUID()
      const folderNameCleaned = folderName.trim()

      // Create a placeholder file in the folder to ensure it exists in Storage
      const folderRef = ref(storage, `uploads/${user.uid}/${folderNameCleaned}/.placeholder`)
      await uploadBytes(folderRef, new Blob([""]))

      const folderDocRef = doc(db, `folders/${user.uid}/userFolders`, folderId)
      const folderData = {
        folderId,
        name: folderNameCleaned,
        displayName: folderNameCleaned,
        parentPath: `uploads/${user.uid}/`,
        path: `uploads/${user.uid}/${folderNameCleaned}/`,
        createdAt: new Date(),
        updatedAt: new Date(),
        itemCount: 0,
        isPrimary: false,
        starred: false,
      }
      await setDoc(folderDocRef, folderData)

      console.log("[v0] Folder created:", folderNameCleaned, "with ID:", folderId)

      toast({
        title: "Folder created",
        description: `Folder "${folderNameCleaned}" has been created.`,
      })
      onSuccess()
    } catch (error) {
      console.error("[v0] Error creating folder:", error)
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Create New Folder</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition"
          >
            <X size={20} className="text-foreground/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground/70 mb-2 block">Folder Name</label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !folderName.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
