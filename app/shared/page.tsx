"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getSharedLink, type SharedLink } from "@/lib/storage"
import { Download, FileIcon, AlertTriangle } from "lucide-react"

function SharedLinkContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get("id")
    const [link, setLink] = useState<SharedLink | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [downloadUrl, setDownloadUrl] = useState<string>("")
    const [storagePath, setStoragePath] = useState<string>("")
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        const fetchLink = async () => {
            if (!id) {
                setError("Invalid link.")
                setLoading(false)
                return
            }

            try {
                const sharedLink = await getSharedLink(id)

                if (!sharedLink) {
                    setError("This link has expired or does not exist.")
                    setLoading(false)
                    return
                }

                setLink(sharedLink)

                // The fileUrl stored in Firestore already includes the Firebase download token.
                // We use it directly — no need to call getDownloadURL (which requires auth).
                // If fileUrl is missing, build a fallback from storagePath.
                if (sharedLink.fileUrl) {
                    setDownloadUrl(sharedLink.fileUrl)
                    if (sharedLink.storagePath) setStoragePath(sharedLink.storagePath)
                    console.log("[shared] Using stored fileUrl (includes token)")
                } else if (sharedLink.storagePath) {
                    // Fallback: construct URL (may not have token, require storage rules update)
                    setStoragePath(sharedLink.storagePath)
                    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'cloudvault-cadca.firebasestorage.app'
                    const encoded = encodeURIComponent(sharedLink.storagePath)
                    setDownloadUrl(`https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encoded}?alt=media`)
                    console.warn("[shared] No fileUrl stored — using path-based URL (may need token)")
                } else {
                    setError("File URL not found. Please ask the owner to re-share the file.")
                }
            } catch (err) {
                console.error("[shared] Error fetching shared link:", err)
                setError("Failed to load the shared file. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchLink()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-foreground/70">Loading shared file...</p>
                </div>
            </div>
        )
    }

    if (error || !link) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="bg-card border border-destructive/50 rounded-2xl p-8 max-w-md w-full text-center">
                    <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">Link Not Available</h1>
                    <p className="text-foreground/60">{error}</p>
                </div>
            </div>
        )
    }

    const handleDownload = () => {
        if (!downloadUrl) return
        setDownloading(true)
        // The fileUrl already has the Firebase download token embedded.
        // Directly opening it avoids CORS/fetch issues entirely.
        // The browser will download or preview it based on content-type.
        window.open(downloadUrl, '_blank', 'noopener,noreferrer')
        setTimeout(() => setDownloading(false), 1500)
    }

    const fileSizeDisplay = link.fileSize < 1024 * 1024
        ? `${(link.fileSize / 1024).toFixed(1)} KB`
        : link.fileSize < 1024 * 1024 * 1024
            ? `${(link.fileSize / (1024 * 1024)).toFixed(2)} MB`
            : `${(link.fileSize / (1024 * 1024 * 1024)).toFixed(2)} GB`

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-lg">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileIcon className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Shared File</h1>
                    <p className="text-foreground/60">Someone shared a file with you</p>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-muted/40 rounded-lg">
                        <p className="text-sm text-foreground/70 mb-1">File Name</p>
                        <p className="font-semibold text-foreground break-all">{link.fileName}</p>
                    </div>

                    <div className="p-4 bg-muted/40 rounded-lg">
                        <p className="text-sm text-foreground/70 mb-1">File Size</p>
                        <p className="font-semibold text-foreground">{fileSizeDisplay}</p>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={!downloadUrl || downloading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {downloading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                Download File
                            </>
                        )}
                    </button>

                    <p className="text-xs text-center text-foreground/50">
                        This link will expire on {new Date(link.expiresAt).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function SharedLinkPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-foreground/70">Loading...</p>
                </div>
            </div>
        }>
            <SharedLinkContent />
        </Suspense>
    )
}
