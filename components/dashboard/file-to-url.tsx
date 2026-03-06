"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { uploadFile, createSharedLink } from "@/lib/storage"
import { Upload, Copy, Link2, QrCode, Download, Eye, X, Crown, Zap, Lock } from "lucide-react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { UNIVERSAL_PLANS } from "@/lib/razorpay"
import { CurrencySelector } from "@/components/currency-selector"
import { convertPrice, formatPrice, type Currency, getCurrencyFromLocalStorage } from "@/lib/currency"
import { formatETA, calculateETASeconds } from "@/lib/eta-utils"
import { FILE_TO_URL_PLANS } from "@/lib/file-to-url-plans" // Declare FILE_TO_URL_PLANS

interface UploadingFile {
  name: string
  progress: number
  eta: string
  startTime: number
}

export function FileToURL() {
  const router = useRouter()
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      name: string
      size: number
      url: string
      downloadUrl: string
      shareLink: string
      timestamp: number
      qrCode?: string
      expiresAt?: Date
    }>
  >([])
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedQR, setSelectedQR] = useState<{ qrCode: string; url: string; fileName: string } | null>(null)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [userFileToURLPlan, setUserFileToURLPlan] = useState("free") // Declare userFileToURLPlan

  const userPlan = userData?.subscriptionPlan || "free"
  const currentPlan = UNIVERSAL_PLANS[userPlan]
  // File-to-URL only available for Starter plan and above
  const isFileToURLAllowed = userPlan !== "free"
  const isPremium = userPlan !== "free"
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("INR")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = getCurrencyFromLocalStorage()
    setSelectedCurrency(stored)
    setUserFileToURLPlan((userData as any)?.fileToURLPlan || "free") // Set userFileToURLPlan from userData
  }, [])

  const getPlanPrice = (priceInINR: number) => {
    const converted = convertPrice(priceInINR, selectedCurrency)
    return formatPrice(converted, selectedCurrency)
  }

  const calculateETA = (progress: number, elapsedMs: number): string => {
    const etaSeconds = calculateETASeconds(progress, elapsedMs)
    return formatETA(etaSeconds)
  }

  const getExpirationText = (expiresAt?: Date): string => {
    if (!expiresAt) return "Calculating..."
    if (currentPlan.expirationDays === 0) return "Never expires"
    const now = new Date()
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft === 1) return "Expires in 1 day"
    if (daysLeft <= 0) return "Expired"
    return `Expires in ${daysLeft} days`
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    await processFiles(files)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    await processFiles(files)
  }

  const processFiles = async (files: File[]) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to use this feature.",
        variant: "destructive",
      })
      return
    }

    // Check if user has access to File-to-URL feature (Starter plan and above)
    if (!isFileToURLAllowed) {
      toast({
        title: "Feature Not Available",
        description: "File to URL feature is only available for Starter plan and above. Please upgrade your plan.",
        variant: "destructive",
      })
      setShowPricingModal(true)
      return
    }

    // Check plan-based file upload limits
    const currentPlanData = UNIVERSAL_PLANS[userPlan as keyof typeof UNIVERSAL_PLANS]
    const maxLinks = currentPlanData?.links || 5
    const currentLinksCount = uploadedFiles.length + uploadingFiles.length

    if (currentLinksCount >= maxLinks) {
      toast({
        title: "Limit reached",
        description: `You've reached your limit of ${maxLinks} links/month for the ${userPlan} plan. Upgrade to create more shareable links.`,
        variant: "destructive",
      })
      setShowPricingModal(true)
      return
    }

    // Check if adding all files would exceed limit
    const filesWouldExceed = currentLinksCount + files.length > maxLinks
    if (filesWouldExceed) {
      const remainingSlots = maxLinks - currentLinksCount
      toast({
        title: "Limited slots",
        description: `You have ${remainingSlots} slot(s) remaining. Only ${remainingSlots} of your selected ${files.length} file(s) will be uploaded. Upgrade your plan for more.`,
        variant: "default",
      })
    }

    for (const file of files.slice(0, maxLinks - currentLinksCount)) {
      const uploadingFile: UploadingFile = {
        name: file.name,
        progress: 0,
        eta: "calculating...",
        startTime: Date.now(),
      }

      setUploadingFiles((prev) => [...prev, uploadingFile])

      try {
        // Upload file to Firebase Storage with progress tracking
        const uploadResult = await uploadFile(user.uid, file, "fileToUrl", (progress) => {
          const elapsedMs = Date.now() - uploadingFile.startTime
          const eta = calculateETA(progress, elapsedMs)

          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.name === file.name
                ? { ...f, progress: Math.round(progress), eta }
                : f,
            ),
          )
        })

        if (!uploadResult.url) {
          throw new Error("Failed to get download URL")
        }

        // Create a shareable link with plan-based expiration
        const shareResult = await createSharedLink(
          user.uid,
          uploadResult.id,
          file.name,
          uploadResult.url,
          file.size,
          userPlan,
        )

        const fullShareLink = `${window.location.origin}/shared?id=${encodeURIComponent(shareResult.id)}`

        // Generate QR code
        let qrCode = ""
        try {
          qrCode = await QRCode.toDataURL(fullShareLink, {
            width: 300,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          })
        } catch (error) {
          console.error("[v0] Error generating QR code:", error)
        }

        setUploadedFiles((prev) => [
          {
            name: file.name,
            size: file.size,
            url: fullShareLink,
            downloadUrl: uploadResult.url,
            shareLink: shareResult.id,
            timestamp: Date.now(),
            qrCode,
            expiresAt: shareResult.expiresAt,
          },
          ...prev,
        ])

        toast({
          title: "File uploaded successfully",
          description: `${file.name} is now shareable`,
        })
      } catch (error) {
        console.error("[v0] Error processing file:", error)
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive",
        })
      } finally {
        // Remove from uploading list
        setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name))
      }
    }
  }

  const copyLink = (url: string, fileName: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copied",
      description: `${fileName} link copied to clipboard`,
    })
  }

  const downloadFile = (url: string, fileName: string, expiresAt?: Date) => {
    // Check if file has expired
    if (expiresAt && new Date() > expiresAt) {
      toast({
        title: "File expired",
        description: "This shared link has expired. Upgrade your plan for longer file availability.",
        variant: "destructive",
      })
      setShowPricingModal(true)
      return
    }

    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const showQRCode = async (file: (typeof uploadedFiles)[0]) => {
    if (file.qrCode) {
      setSelectedQR({
        qrCode: file.qrCode,
        url: file.url,
        fileName: file.name,
      })
      setShowQRModal(true)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const isUploading = uploadingFiles.length > 0

  return (
    <div className="w-full space-y-6 md:space-y-8">
      {/* Header with Premium Badge */}
      <div className="space-y-2 md:space-y-3 px-0">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">File to URL</h1>
          {isFileToURLAllowed && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full">
              <Crown className="w-4 h-4 text-white" />
              <span className="text-xs md:text-sm font-bold text-white">{currentPlan.name}</span>
            </div>
          )}
        </div>
        <p className="text-base md:text-lg text-foreground/60">
          Transform your files into permanent, shareable URLs instantly
        </p>

        {/* Free user upsell message */}
        {!isFileToURLAllowed && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <span className="font-semibold">Upgrade to Starter Plan</span> to unlock File to URL feature and create up to 50 shareable links per month.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 md:gap-4 pt-3 md:pt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <span className="text-xs md:text-sm text-foreground/70">Lightning Fast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <span className="text-xs md:text-sm text-foreground/70">Secure & Private</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-sm md:text-base">∞</span>
            </div>
            <span className="text-xs md:text-sm text-foreground/70">
              {currentPlan.expirationDays === 0 ? "Never Expires" : `${currentPlan.expirationDays}d Expiry`}
            </span>
          </div>
        </div>

        {/* Plan Info Card */}
        <div className={`mt-4 p-3 md:p-4 rounded-lg border ${isFileToURLAllowed ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-950 dark:to-orange-950 dark:border-yellow-800" : "bg-muted border-border"}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-semibold text-foreground">
                {isFileToURLAllowed ? `${currentPlan.name} Plan` : "Free Plan - Feature Locked"}
              </p>
              <p className="text-xs text-foreground/60 mt-1">
                {isFileToURLAllowed ? (
                  <>Up to {currentPlan.links === 999999 ? "∞" : currentPlan.links} links/month • {currentPlan.bandwidth === 999999 ? "∞" : currentPlan.bandwidth}GB bandwidth</>
                ) : (
                  <>Upgrade to Starter to create shareable links</>
                )}
              </p>
            </div>
            {!isFileToURLAllowed && (
              <Button
                size="sm"
                className="ml-2 flex-shrink-0 text-xs md:text-sm h-8 md:h-9"
                onClick={() => setShowPricingModal(true)}
              >
                <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {isFileToURLAllowed ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-xl md:rounded-2xl border-2 border-dashed transition-all p-6 md:p-12 text-center cursor-pointer ${isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/50"
            }`}
        >
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-3 md:space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold text-foreground">Drag files here or click to upload</p>
              <p className="text-xs md:text-sm text-foreground/60 mt-1">
                {isUploading ? "Uploading..." : "Support all file types - images, videos, documents, etc."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl md:rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 md:p-12 text-center opacity-50 cursor-not-allowed">
          <div className="space-y-3 md:space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 md:w-8 md:h-8 text-foreground/40" />
              </div>
            </div>
            <div>
              <p className="text-base md:text-lg font-semibold text-foreground">Feature Locked</p>
              <p className="text-xs md:text-sm text-foreground/60 mt-1">
                Upgrade to Starter plan to unlock File to URL feature
              </p>
              <Button
                className="mt-4"
                onClick={() => setShowPricingModal(true)}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Starter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Uploading Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3 md:space-y-4">
          <h3 className="text-lg md:text-xl font-bold text-foreground">Uploading Files</h3>
          <div className="grid gap-3">
            {uploadingFiles.map((file) => (
              <div key={file.name} className="bg-card border border-border rounded-lg md:rounded-xl p-3 md:p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-medium text-foreground truncate">{file.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs md:text-sm font-semibold text-primary">{file.progress}%</span>
                    <span className="text-xs md:text-sm text-foreground/70">ETA: {file.eta}</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 md:h-2.5 overflow-hidden mb-2">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Your Shareable Links</h2>
          <div className="grid gap-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.timestamp}
                className="bg-card border border-border rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base text-foreground truncate">{file.name}</h3>
                        <p className="text-xs md:text-sm text-foreground/60 mt-1">{formatFileSize(file.size)}</p>
                      </div>
                      {isPremium && (
                        <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 px-2 py-1 rounded-full flex-shrink-0">
                          <Crown className="w-3 h-3 text-white" />
                          <span className="text-xs font-bold text-white hidden sm:inline">{getExpirationText(file.expiresAt)}</span>
                        </div>
                      )}
                    </div>
                    {!isPremium && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                        ⏱️ {getExpirationText(file.expiresAt)}
                      </p>
                    )}
                    <div className="mt-2 md:mt-3 space-y-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-foreground/50 font-bold mb-1">Shared Page Link</p>
                        <div className="p-2 md:p-3 bg-muted rounded-lg border border-border/50">
                          <p className="text-xs text-foreground/70 truncate break-all">{file.url}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-foreground/50 font-bold mb-1 flex items-center gap-1">
                          Direct Asset URL
                          <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-full capitalize">
                            Raw
                          </span>
                        </p>
                        <div className="p-2 md:p-3 bg-muted rounded-lg border border-border/50 flex items-center gap-2 min-w-0">
                          <p className="text-xs text-foreground/70 truncate flex-1 font-mono select-all min-w-0">
                            {file.downloadUrl}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-background shrink-0"
                            onClick={() => copyLink(file.downloadUrl, "Direct URL")}
                            title="Copy Direct URL"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:flex md:gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent text-xs md:text-sm h-8 md:h-9"
                      onClick={() => showQRCode(file)}
                      title="Generate QR Code"
                    >
                      <QrCode className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline ml-1 md:ml-2">QR</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent text-xs md:text-sm h-8 md:h-9"
                      onClick={() => copyLink(file.url, file.name)}
                      title="Copy link"
                    >
                      <Copy className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline ml-1 md:ml-2">Copy</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent text-xs md:text-sm h-8 md:h-9"
                      onClick={() => window.open(file.url, "_blank")}
                      title="Preview file"
                    >
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline ml-1 md:ml-2">Preview</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent text-xs md:text-sm h-8 md:h-9"
                      onClick={() => downloadFile(file.downloadUrl, file.name)}
                      title="Download file"
                    >
                      <Download className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline ml-1 md:ml-2">Download</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && selectedQR && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQRModal(false)}
        >
          <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">QR Code</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition"
              >
                <X className="w-5 h-5 text-foreground/60" />
              </button>
            </div>

            <div className="bg-white p-3 md:p-4 rounded-lg mb-3 md:mb-4">
              <img src={selectedQR.qrCode || "/placeholder.svg"} alt="QR Code" className="w-full" />
            </div>

            <p className="text-xs md:text-sm text-foreground/60 mb-3 md:mb-4 text-center">
              Scan this QR code to access: <span className="font-semibold text-foreground">{selectedQR.fileName}</span>
            </p>

            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedQR.url)
                toast({
                  title: "URL copied",
                  description: "Share link copied to clipboard",
                })
              }}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2 mb-2 md:mb-3 text-sm md:text-base"
            >
              <Copy className="w-4 h-4" />
              Copy URL
            </button>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition text-sm md:text-base"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowPricingModal(false)}
        >
          <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 max-w-2xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                <Crown className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
                File to URL Plans
              </h2>
              <div className="flex items-center gap-2">
                {mounted && <CurrencySelector onCurrencyChange={setSelectedCurrency} />}
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition"
                >
                  <X className="w-5 h-5 text-foreground/60" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {Object.entries(FILE_TO_URL_PLANS).map(([key, plan]) => (
                <div
                  key={key}
                  className={`p-4 rounded-lg border transition-all ${key === userFileToURLPlan
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-foreground">{plan.name}</h3>
                    {key !== "free" && <Crown className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-2">{getPlanPrice(plan.price)}</p>
                  <p className="text-xs text-foreground/60 mb-4">{plan.period}</p>

                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-foreground/70">
                      <p className="font-semibold">Links: {plan.links === 999999 ? "Unlimited" : plan.links}/month</p>
                      <p className="font-semibold">Bandwidth: {plan.bandwidth === 999999 ? "Unlimited" : plan.bandwidth}GB/month</p>
                      <p className="font-semibold">
                        Expiry: {plan.expirationDays === 0 ? "Never ✨" : `${plan.expirationDays} days`}
                      </p>
                    </div>
                  </div>

                  {key === userFileToURLPlan ? (
                    <Button disabled className="w-full" size="sm">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowPricingModal(false)
                        router.push("/pricing")
                      }}
                      className="w-full"
                      size="sm"
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPricingModal(false)}
              className="w-full px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
