"use client"

import { useState, useEffect } from "react"
import { Download, Upload, Trash2, Share2, Clock, X } from "lucide-react"
import { getUserActivityLogs, type ActivityLog as ActivityLogType } from "@/lib/storage"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

const iconMap: Record<string, any> = {
  upload: Upload,
  download: Download,
  delete: Trash2,
  share: Share2,
}

export function ActivityLog({ full }: { full?: boolean }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [logs, setLogs] = useState<ActivityLogType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return
      try {
        const activityLogs = await getUserActivityLogs(user.uid, full ? 50 : 5)
        setLogs(activityLogs)
      } catch (error) {
        console.error("Error fetching activity logs:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [user, full])

  const handleDeleteLog = async (logId: string) => {
    if (!user) return
    try {
      await deleteDoc(doc(db, "activityLogs", logId))
      setLogs(logs.filter((log) => log.id !== logId))
      toast({
        title: "Log Deleted",
        description: "Activity log has been removed.",
      })
    } catch (error) {
      console.error("Error deleting log:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete activity log.",
        variant: "destructive",
      })
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
          <p className="text-foreground/60">No activity yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className={full ? "space-y-4" : ""}>
      <div className="bg-card border border-border rounded-2xl p-6">
        {!full && <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>}
        <div className={full ? "space-y-4" : "space-y-3"}>
          {logs.map((log) => {
            const IconComponent = iconMap[log.action] || Clock
            return (
              <div
                key={log.id}
                className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-b-0 last:pb-0 hover:bg-muted/30 p-3 -mx-3 px-3 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IconComponent size={18} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground">
                    <span className="font-semibold capitalize">{log.action}</span> {log.fileName}
                  </p>
                  <p className="text-xs text-foreground/50 mt-1">{formatTime(log.timestamp)}</p>
                </div>
                <button
                  onClick={() => handleDeleteLog(log.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 rounded transition text-destructive"
                  title="Delete log"
                >
                  <X size={16} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
