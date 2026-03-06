"use client"

import { X, Download, ExternalLink, Music } from "lucide-react"
import { type FileMetadata, getFilePreviewType } from "@/lib/storage"
import { useState } from "react"
import { ref, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"

export function FilePreviewModal({ file, onClose }: { file: FileMetadata; onClose: () => void }) {
  const previewType = getFilePreviewType(file.type)
  const [imageError, setImageError] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const getGoogleDocsViewerUrl = (url: string) => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
  }

  const isDocumentType = (type: string) => {
    const docTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
    ]
    return docTypes.includes(type)
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = file.url
    link.download = file.name
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center sm:p-4 z-[100]">
      <div className="bg-card border-b sm:border border-border sm:rounded-2xl w-full max-w-6xl h-full sm:h-[90vh] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-xl font-bold text-foreground truncate">{file.name}</h2>
            <p className="text-xs text-foreground/60 mt-1">{file.type || "Unknown type"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-muted rounded-lg transition flex items-center gap-2 text-sm font-medium"
              title="Download"
            >
              <Download size={18} className="text-primary" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition"
            >
              <X size={20} className="text-foreground/60" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-6 bg-muted/20">
          {previewType === "image" && (
            <div className="flex items-center justify-center h-full">
              {!imageError ? (
                <img
                  src={file.url || "/placeholder.svg"}
                  alt={file.name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  onError={() => setImageError(true)}
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="text-center p-8">
                  <p className="text-foreground/60 mb-4">Failed to load image</p>
                  <button onClick={handleDownload} className="text-primary hover:underline">
                    Download to view
                  </button>
                </div>
              )}
            </div>
          )}

          {previewType === "video" && (
            <div className="flex items-center justify-center h-full">
              {!videoError ? (
                <video
                  src={file.url}
                  controls
                  className="max-w-full max-h-full rounded-lg shadow-lg"
                  onError={() => setVideoError(true)}
                  crossOrigin="anonymous"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center p-8">
                  <p className="text-foreground/60 mb-4">Failed to load video</p>
                  <button onClick={handleDownload} className="text-primary hover:underline">
                    Download to view
                  </button>
                </div>
              )}
            </div>
          )}

          {file.type.startsWith("audio/") && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Music className="w-16 h-16 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{file.name}</h3>
                <audio src={file.url} controls className="w-full max-w-md mx-auto" crossOrigin="anonymous">
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}

          {previewType === "pdf" && (
            <iframe
              src={`${file.url}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full min-h-[600px] rounded-lg shadow-lg bg-white"
              title={file.name}
            />
          )}

          {previewType === "none" && isDocumentType(file.type) && (
            <div className="h-full">
              <iframe
                src={getGoogleDocsViewerUrl(file.url)}
                className="w-full h-full min-h-[600px] rounded-lg shadow-lg bg-white"
                title={file.name}
              />
              <div className="mt-4 text-center">
                <p className="text-xs text-foreground/60 mb-2">Preview powered by Google Docs Viewer</p>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink size={14} />
                  Open in new tab
                </a>
              </div>
            </div>
          )}

          {previewType === "none" && !isDocumentType(file.type) && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 max-w-md">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Download size={32} className="text-foreground/40" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Preview Not Available</h3>
                <p className="text-foreground/60 mb-6">
                  This file type ({file.type || "unknown"}) cannot be previewed in the browser.
                </p>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Download File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
