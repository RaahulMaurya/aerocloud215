"use client"

import { X, Download } from "lucide-react"
import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  shareLink: string
  fileName: string
}

export function QRCodeModal({ isOpen, onClose, shareLink, fileName }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        shareLink,
        {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error)
        },
      )
    }
  }, [isOpen, shareLink])

  const handleDownloadQR = () => {
    if (!canvasRef.current) return
    const url = canvasRef.current.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = url
    link.download = `${fileName}-qr-code.png`
    link.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Share via QR Code</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition">
            <X size={20} className="text-foreground/60" />
          </button>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-foreground/60">Scan this QR code to access the file</p>

          <div className="bg-white p-6 rounded-xl inline-block">
            <canvas ref={canvasRef} />
          </div>

          <p className="text-xs text-foreground/60 font-medium truncate px-4">{fileName}</p>

          <button
            onClick={handleDownloadQR}
            className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  )
}
