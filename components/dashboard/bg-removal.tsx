"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Loader2, Upload, Download, Cloud, Share2, ImageIcon, X, Check, Copy, Crown, AlertOctagon } from "lucide-react"
import { removeBackground } from "@imgly/background-removal"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { uploadFile, createSharedLink, type FileMetadata } from "@/lib/storage"
import { ShareLinkModal } from "./share-link-modal"
import { getUserPlan } from "@/lib/razorpay"
import { useRouter } from "next/navigation"

export function BgRemoval() {
    const { user, userData, updateBgRemovalsUsed, updateFilesCount } = useAuth()
    const { toast } = useToast()
    const router = useRouter()

    const [originalImage, setOriginalImage] = useState<string | null>(null)
    const [processedImage, setProcessedImage] = useState<string | null>(null)
    const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    // Share link state
    const [shareResult, setShareResult] = useState<{ url: string; id: string } | null>(null)
    const [showShareModal, setShowShareModal] = useState(false)
    const [uploadedRef, setUploadedRef] = useState<FileMetadata | null>(null)

    // Plan Limits
    const plan = getUserPlan(userData?.plan || userData?.subscriptionPlan)
    const limit = plan.bgRemovalLimit || 5
    const used = userData?.bgRemovalsUsed || 0
    const remaining = Math.max(0, limit - used)
    const isLimitReached = used >= limit

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (isLimitReached) {
            toast({
                title: "Limit Reached",
                description: `You've used ${used}/${limit} background removals. Upgrade your plan for more.`,
                variant: "destructive",
            })
            return
        }

        const file = acceptedFiles[0]
        if (!file) return

        // Create preview for original
        const objectUrl = URL.createObjectURL(file)
        setOriginalImage(objectUrl)
        setProcessedImage(null)
        setProcessedBlob(null)
        setUploadedRef(null)
        setShowShareModal(false)
        setShareResult(null)

        setIsProcessing(true)
        try {
            // Process image using default config (library handles assets)
            const blob = await removeBackground(file)
            const processedUrl = URL.createObjectURL(blob)

            setProcessedBlob(blob)
            setProcessedImage(processedUrl)

            // Increment usage
            if (updateBgRemovalsUsed) {
                await updateBgRemovalsUsed(used + 1)
            }

            toast({
                title: "Success!",
                description: "Background removed successfully.",
            })
        } catch (error) {
            console.error("Bg Removal Error:", error)
            toast({
                title: "Error",
                description: "Failed to remove background. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }, [isLimitReached, used, limit, updateBgRemovalsUsed, toast])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: 1,
        disabled: isProcessing || isLimitReached
    })

    const handleDownload = () => {
        if (!processedImage) return
        const link = document.createElement("a")
        link.href = processedImage
        link.download = "removed-bg.png"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleSaveToCloud = async () => {
        if (!user || !processedBlob) return

        setIsUploading(true)
        try {
            const file = new File([processedBlob], `bg-removed-${Date.now()}.png`, { type: "image/png" })
            const uploaded = await uploadFile(user.uid, file, "root")
            setUploadedRef(uploaded)

            // Update files count
            if (userData?.filesCount !== undefined && updateFilesCount) {
                await updateFilesCount(userData.filesCount + 1)
            }

            toast({
                title: "Saved to Cloud",
                description: "Image saved to your files successfully.",
            })
        } catch (error) {
            console.error("Upload Error:", error)
            toast({
                title: "Error",
                description: "Failed to save to cloud.",
                variant: "destructive",
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleShare = async () => {
        if (!user || !processedBlob) return

        if (shareResult && uploadedRef) {
            setShowShareModal(true)
            return
        }

        setIsUploading(true)
        try {
            // 1. Upload first (needed for sharing) if not already uploaded
            let currentUpload = uploadedRef
            if (!currentUpload) {
                const file = new File([processedBlob], `bg-removed-${Date.now()}.png`, { type: "image/png" })
                currentUpload = await uploadFile(user.uid, file, "root")
                setUploadedRef(currentUpload)
            }

            // 2. Generate share link
            const result = await createSharedLink(
                user.uid,
                currentUpload.id,
                currentUpload.name,
                currentUpload.url,
                currentUpload.size
            )

            setShareResult({
                url: `${window.location.origin}/shared/${result.id}`,
                id: result.id
            })
            setShowShareModal(true)
        } catch (error) {
            console.error("Share Error:", error)
            toast({
                title: "Error",
                description: "Failed to create share link.",
                variant: "destructive",
            })
        } finally {
            setIsUploading(false)
        }
    }

    const reset = () => {
        setOriginalImage(null)
        setProcessedImage(null)
        setProcessedBlob(null)
        setUploadedRef(null)
        setShowShareModal(false)
        setShareResult(null)
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Background Remover</h1>
                    <p className="text-foreground/60 mt-2">Instantly remove backgrounds from your images using AI</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm min-w-[200px]">
                    <div className={`p-2 rounded-lg ${isLimitReached ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                        {isLimitReached ? <AlertOctagon size={24} /> : <Crown size={24} />}
                    </div>
                    <div>
                        <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-0.5">
                            {plan.name} Plan
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-foreground">
                                {limit === 999999 ? "Unlimited" : remaining}
                            </span>
                            {limit !== 999999 && (
                                <span className="text-xs text-foreground/60">removals left</span>
                            )}
                        </div>
                    </div>
                    {isLimitReached && (
                        <button
                            onClick={() => router.push('/pricing')}
                            className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1.5 rounded-md hover:bg-primary/90"
                        >
                            Upgrade
                        </button>
                    )}
                </div>
            </div>

            {!originalImage ? (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer relative overflow-hidden ${isDragActive
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                        } ${isLimitReached ? "opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent" : ""}`}
                >
                    <input {...getInputProps()} />

                    {isLimitReached && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                            <div className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                                <AlertOctagon size={16} />
                                Limit Reached
                            </div>
                        </div>
                    )}

                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ImageIcon className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        {isDragActive ? "Drop image here" : "Drag & drop an image"}
                    </h3>
                    <p className="text-foreground/60 max-w-sm mx-auto">
                        Supports PNG, JPG, JPEG, WEBP.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Editor Area */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Original */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-foreground">Original</h4>
                                <button onClick={reset} className="text-xs text-destructive hover:underline flex items-center gap-1">
                                    <X size={12} /> Remove
                                </button>
                            </div>
                            <div className="aspect-square relative rounded-xl overflow-hidden border border-border bg-muted/30 flex items-center justify-center">
                                <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain" />
                            </div>
                        </div>

                        {/* Processed */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-foreground">Removed Background</h4>
                            <div className="aspect-square relative rounded-xl overflow-hidden border border-border bg-[url('/checker-board.svg')] bg-center bg-repeat flex items-center justify-center">
                                {isProcessing ? (
                                    <div className="text-center">
                                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-3" />
                                        <p className="text-sm font-medium text-foreground">Processing...</p>
                                        <p className="text-xs text-foreground/60">This might take a few seconds</p>
                                    </div>
                                ) : processedImage ? (
                                    <img src={processedImage} alt="Processed" className="max-w-full max-h-full object-contain z-10" />
                                ) : null}

                                {/* Checker background fallback if svg missing (using css pattern) */}
                                <div className="absolute inset-0 -z-10 opacity-10"
                                    style={{
                                        backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
                                        backgroundSize: '20px 20px',
                                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {!isProcessing && processedImage && (
                        <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-border/50">
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition shadow-lg hover:-translate-y-0.5"
                            >
                                <Download size={20} />
                                <span>Download Image</span>
                            </button>

                            <button
                                onClick={handleSaveToCloud}
                                disabled={isUploading}
                                className="flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-xl hover:bg-muted transition disabled:opacity-50"
                            >
                                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Cloud size={20} />}
                                <span>{uploadedRef ? "Saved!" : "Save to Cloud"}</span>
                            </button>

                            <button
                                onClick={handleShare}
                                disabled={isUploading}
                                className="flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-xl hover:bg-muted transition disabled:opacity-50"
                            >
                                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
                                <span>Share Link</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {showShareModal && shareResult && (
                <ShareLinkModal
                    onClose={() => setShowShareModal(false)}
                    file={{
                        name: "removed-bg.png",
                        size: processedBlob?.size || 0,
                        url: shareResult.url,
                        type: "image/png",
                        id: shareResult.id,
                        fullPath: "temp",
                        uploadedAt: new Date()
                    } as any}
                />
            )}
        </div>
    )
}
