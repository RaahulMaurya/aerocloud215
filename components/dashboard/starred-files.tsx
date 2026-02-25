"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getStarredFiles, type FileMetadata, toggleFileStarred } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { Star, Download, Share2, FileIcon, ImageIcon, Video, Music, FileText, Eye } from "lucide-react"
import { FilePreviewModal } from "./file-preview-modal"
import { ShareLinkModal } from "./share-link-modal"

export function StarredFiles() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [starredFiles, setStarredFiles] = useState<FileMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [previewFile, setPreviewFile] = useState<FileMetadata | null>(null)
  const [shareFile, setShareFile] = useState<FileMetadata | null>(null)

  useEffect(() => {
    if (user) {
      fetchStarredFiles()
    }
  }, [user])

  const fetchStarredFiles = async () => {
    if (!user) return
    setLoading(true)
    try {
      const files = await getStarredFiles(user.uid)
      setStarredFiles(files)
    } catch (error) {
      console.error("Error fetching starred files:", error)
      toast({
        title: "Error",
        description: "Failed to load starred files",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStar = async (fileId: string) => {
    try {
      await toggleFileStarred(user!.uid, fileId, false)
      setStarredFiles(starredFiles.filter((f) => f.id !== fileId))
      toast({
        title: "Removed from starred",
        description: "File removed from starred files",
      })
    } catch (error) {
      console.error("Error toggling star:", error)
      toast({
        title: "Error",
        description: "Failed to update starred status",
        variant: "destructive",
      })
    }
  }

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return <ImageIcon className="w-10 h-10" />
    if (type.includes("video")) return <Video className="w-10 h-10" />
    if (type.includes("audio")) return <Music className="w-10 h-10" />
    if (type.includes("pdf") || type.includes("document")) return <FileText className="w-10 h-10" />
    return <FileIcon className="w-10 h-10" />
  }

  const getFileBackground = (type: string) => {
    if (type.includes("image"))
      return "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30"
    if (type.includes("video"))
      return "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30"
    if (type.includes("audio"))
      return "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30"
    if (type.includes("pdf"))
      return "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30"
    return "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/30 dark:to-gray-700/30"
  }

  const getFileIconColor = (type: string) => {
    if (type.includes("image")) return "text-purple-600 dark:text-purple-400"
    if (type.includes("video")) return "text-red-600 dark:text-red-400"
    if (type.includes("audio")) return "text-green-600 dark:text-green-400"
    if (type.includes("pdf")) return "text-blue-600 dark:text-blue-400"
    return "text-gray-600 dark:text-gray-400"
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/70">Loading starred files...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Starred Files</h1>
        <p className="text-foreground/60 mt-1">Files you've marked as favorites</p>
      </div>

      {starredFiles.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Star className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No starred files</h3>
          <p className="text-foreground/60">Star files to quickly access them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {starredFiles.map((file) => (
            <div
              key={file.id}
              className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
            >
              {/* Star icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleStar(file.id)
                }}
                className="absolute top-3 right-3 z-10 p-1.5 hover:bg-muted rounded-lg transition"
              >
                <Star size={18} className="fill-yellow-400 text-yellow-400" />
              </button>

              {/* File preview area */}
              <div
                className={`aspect-square ${getFileBackground(file.type)} flex items-center justify-center overflow-hidden ${file.type.startsWith("image/") && file.url ? "" : "p-6"
                  }`}
              >
                {file.type.startsWith("image/") && file.url ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className={getFileIconColor(file.type)}>{getFileIcon(file.type)}</div>
                )}
              </div>

              {/* File info */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground truncate text-sm">{file.name}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-foreground/60">
                      {file.sizeGB < 0.001 ? `${(file.size / 1024).toFixed(0)} KB` : `${file.sizeGB.toFixed(2)} MB`}
                    </p>
                    <p className="text-xs text-foreground/60">{formatDate(file.uploadedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="p-1.5 hover:bg-primary/10 rounded-lg transition text-primary"
                    title="Preview file"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => setShareFile(file)}
                    className="p-1.5 hover:bg-primary/10 rounded-lg transition text-foreground/60"
                    title="Share file"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    onClick={() => window.open(file.url, "_blank")}
                    className="p-1.5 hover:bg-primary/10 rounded-lg transition text-foreground/60"
                    title="Download file"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}

      {shareFile && <ShareLinkModal file={shareFile} onClose={() => setShareFile(null)} />}
    </div>
  )
}
