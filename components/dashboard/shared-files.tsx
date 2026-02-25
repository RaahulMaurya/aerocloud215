"use client"

import { sharedFiles } from "@/lib/dummy-data"
import { Share2, Copy, Lock } from "lucide-react"

export function SharedFiles({ full }: { full?: boolean }) {
  return (
    <div className={full ? "space-y-4" : ""}>
      <div className={`bg-card border border-border rounded-2xl p-6 ${!full ? "h-full" : ""}`}>
        {!full && <h2 className="text-lg font-semibold text-foreground mb-4">Recently Shared</h2>}
        <div className={full ? "grid gap-4" : "space-y-3"}>
          {sharedFiles.map((file) => (
            <div
              key={file.id}
              className="group p-4 bg-muted/40 rounded-xl hover:bg-muted/70 transition-all cursor-pointer border border-transparent hover:border-primary/20"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">{file.name}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                        file.permissions === "View" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <Lock size={12} className="inline mr-1" />
                      {file.permissions}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/60 mt-1">by {file.sharedBy}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">{file.sharedDate}</p>
                </div>
                <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background rounded-lg">
                  <Copy size={16} className="text-foreground/60" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
