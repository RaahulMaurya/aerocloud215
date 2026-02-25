"use client"

import { LinkIcon, Clock, Trash2, Copy, ExternalLink, QrCode } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getUserSharedLinks, deleteSharedLink, type SharedLink } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import QRCode from "qrcode"

export function SharedLinksPanel() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [links, setLinks] = useState<SharedLink[]>([])
  const [loading, setLoading] = useState(true)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedLink, setSelectedLink] = useState<string>("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  useEffect(() => {
    fetchLinks()
  }, [user])

  const fetchLinks = async () => {
    if (!user) return
    setLoading(true)
    try {
      console.log("[v0] Fetching shared links for user:", user.uid)
      const userLinks = await getUserSharedLinks(user.uid)
      console.log("[v0] Fetched shared links:", userLinks)
      setLinks(userLinks)
    } catch (error) {
      console.error("[v0] Error fetching shared links:", error)
      toast({
        title: "Error loading links",
        description: "Failed to load your shared links. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleShowQR = async (linkId: string) => {
    const fullLink = `${window.location.origin}/shared/${linkId}`
    setSelectedLink(fullLink)
    try {
      const qrUrl = await QRCode.toDataURL(fullLink, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
      setQrCodeUrl(qrUrl)
      setQrModalOpen(true)
    } catch (error) {
      console.error("[v0] Error generating QR code:", error)
      toast({
        title: "Error",
        description: "Failed to generate QR code.",
        variant: "destructive",
      })
    }
  }

  const handleCopyLink = (linkId: string) => {
    const fullLink = `${window.location.origin}/shared/${linkId}`
    navigator.clipboard.writeText(fullLink)
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard.",
    })
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm("Are you sure you want to delete this share link?")) return

    try {
      await deleteSharedLink(linkId)
      setLinks(links.filter((link) => link.id !== linkId))
      toast({
        title: "Link deleted",
        description: "Share link has been deleted.",
      })
    } catch (error) {
      console.error("[v0] Error deleting link:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete the link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)

    if (diff < 0) return "Expired"
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/70">Loading shared links...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shared Links</h1>
          <p className="text-foreground/60 mt-2">Manage and track all your shared file links</p>
        </div>

        {links.length === 0 ? (
          <div className="bg-gradient-to-br from-card to-muted/20 border border-border/50 rounded-2xl p-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                <LinkIcon className="w-10 h-10 text-primary/60" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No shared links yet</h3>
            <p className="text-foreground/60 max-w-md mx-auto mb-6">Create a share link from your files to see them here. Share links allow you to securely share files with others.</p>
            <button
              onClick={() => window.location.href = "/dashboard?tab=files"}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg transition"
            >
              Go to My Files
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link) => (
              <div
                key={link.id}
                className={`bg-card border rounded-2xl p-6 transition-all ${
                  link.isExpired ? "border-destructive/50 opacity-60" : "border-border hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <LinkIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground truncate">{link.fileName}</h3>
                        <p className="text-xs text-foreground/60">
                          {(link.fileSize / (1024 * 1024 * 1024)).toFixed(2)} GB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm mt-3">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className={link.isExpired ? "text-destructive" : "text-foreground/60"} />
                        <span className={link.isExpired ? "text-destructive font-medium" : "text-foreground/60"}>
                          {link.isExpired ? "Expired" : formatTimeRemaining(link.expiresAt)}
                        </span>
                      </div>
                      <span className="text-foreground/40">•</span>
                      <span className="text-foreground/60">
                        Created {new Date(link.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {!link.isExpired && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShowQR(link.id)}
                        className="p-2 hover:bg-muted rounded-lg transition"
                        title="Show QR Code"
                      >
                        <QrCode size={18} className="text-foreground/60" />
                      </button>
                      <button
                        onClick={() => handleCopyLink(link.id)}
                        className="p-2 hover:bg-muted rounded-lg transition"
                        title="Copy link"
                      >
                        <Copy size={18} className="text-foreground/60" />
                      </button>
                      <button
                        onClick={() => window.open(`/shared/${link.id}`, "_blank")}
                        className="p-2 hover:bg-muted rounded-lg transition"
                        title="Open link"
                      >
                        <ExternalLink size={18} className="text-foreground/60" />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-2 hover:bg-muted rounded-lg transition"
                        title="Delete link"
                      >
                        <Trash2 size={18} className="text-destructive" />
                      </button>
                    </div>
                  )}
                  {link.isExpired && (
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 hover:bg-muted rounded-lg transition"
                      title="Delete expired link"
                    >
                      <Trash2 size={18} className="text-destructive" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {qrModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setQrModalOpen(false)}
        >
          <div className="bg-card rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-foreground mb-4">Share via QR Code</h2>
            <div className="bg-white p-4 rounded-lg mb-4">
              <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-full" />
            </div>
            <p className="text-sm text-foreground/60 mb-4">Scan this QR code to access the shared file</p>
            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
