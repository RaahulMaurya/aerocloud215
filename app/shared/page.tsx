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
                } else {
                    setLink(sharedLink)
                }
            } catch (err) {
                console.error("[v0] Error fetching shared link:", err)
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
        window.open(link.fileUrl, "_blank")
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full">
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
                        <p className="font-semibold text-foreground">{link.fileName}</p>
                    </div>

                    <div className="p-4 bg-muted/40 rounded-lg">
                        <p className="text-sm text-foreground/70 mb-1">File Size</p>
                        <p className="font-semibold text-foreground">{(link.fileSize / (1024 * 1024 * 1024)).toFixed(2)} GB</p>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition"
                    >
                        <Download size={20} />
                        Download File
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
