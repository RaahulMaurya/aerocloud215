"use client"

import { Lock, Bell, Shield, CreditCard, Moon, Sun, Monitor, Edit2, Crown, Check, ArrowRight, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import { PaymentModal } from "./payment-modal"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { UNIVERSAL_PLANS } from "@/lib/razorpay"

import { toDataURL } from "qrcode"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface UserData {
  displayName: string
  email: string
  plan?: string
  subscriptionPlan?: string
  storageTotal?: number
  maxStorage?: number
  createdAt: string
  notifications: {
    fileUploads: boolean
    sharedFiles: boolean
    storageAlerts: boolean
  }
  theme: "light" | "dark" | "system"
  twoFactorEnabled?: boolean
  planExpiry?: string
}

import { authenticator } from "@otplib/preset-default"



export function SettingsPanel({ user, onNavigate }: { user: UserData; onNavigate: (section: string) => void }) {
  const [activeSettings, setActiveSettings] = useState("account")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [isEditingName, setIsEditingName] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState(user.displayName)

  // Change Password State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // 2FA State
  const [twoFactorSecret, setTwoFactorSecret] = useState("")
  const [twoFactorQrCode, setTwoFactorQrCode] = useState("")
  const [twoFactorVerifyCode, setTwoFactorVerifyCode] = useState("")
  const [isSetupTwoFactor, setIsSetupTwoFactor] = useState(false)

  const { updateNotificationSettings, updateTheme, updateDisplayName, enable2FA, disable2FA, changePassword } = useAuth()
  const { toast } = useToast()
  const router = useRouter() // Add router 

  const [invoices, setInvoices] = useState<any[]>([])

  useEffect(() => {
    if (!user?.email) return

    // Fetch invoices from subcollection
    const q = query(
      collection(db, "users", user.email, "invoices"), // user.uid ideally but using email for now as per current auth context if uid not avail easily in props?
      // Wait, user prop has everything? user.uid is NOT in UserData interface above but passed user object is userData from auth context which HAS uid.
      // Let's check UserData interface again. It misses uid.
      // But actual object passed likely has it.
      // Let's use user.uid if available, but typescript will complain.
      // checking auth-context UserData.. it HAS uid. checking local UserData.. it DOES NOT.
      // I should update local UserData interface too? YES later.
      // For now let's assume I can get uid from auth context or fix interface.
      // Actually I can access it via useAuth().user?.uid 
      orderBy("date", "desc")
    )

    // Better: GET UID FROM AUTH CONTEXT
  }, [])

  const { user: authUser } = useAuth()

  useEffect(() => {
    if (!authUser?.uid) return

    const invoicesRef = collection(db, "users", authUser.uid, "invoices")
    const q = query(invoicesRef, orderBy("date", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setInvoices(invoicesData)
    })

    return () => unsubscribe()
  }, [authUser])

  const notifications = user.notifications || {
    fileUploads: true,
    sharedFiles: true,
    storageAlerts: true,
  }

  const theme = user.theme || "system"
  const plan = user.plan || user.subscriptionPlan || "free"
  const storageTotalGB = user.storageTotal || (user.maxStorage ? user.maxStorage / (1024 * 1024 * 1024) : 5)

  const settingsMenu = [
    { id: "account", label: "Account", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
  ]

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    } catch (error) {
      console.error("[v0] Error formatting date:", error)
      return "Invalid Date"
    }
  }

  const getPlanPrice = () => {
    const planData = UNIVERSAL_PLANS[plan as keyof typeof UNIVERSAL_PLANS]
    if (!planData) return "₹0"
    return `₹${planData.price}${planData.price > 0 ? "/" + planData.period : ""}`
  }

  const getCurrentPlanDetails = () => {
    return UNIVERSAL_PLANS[plan as keyof typeof UNIVERSAL_PLANS] || UNIVERSAL_PLANS.free
  }

  const handleSaveName = async () => {
    if (newDisplayName.trim() === user.displayName) {
      setIsEditingName(false)
      return
    }

    if (!newDisplayName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      await updateDisplayName(newDisplayName.trim())
      setIsEditingName(false)
      toast({
        title: "Name updated",
        description: "Your display name has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update name. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleNotificationToggle = async (key: keyof UserData["notifications"], value: boolean) => {
    try {
      await updateNotificationSettings({ [key]: value })
      toast({
        title: "Settings updated",
        description: "Notification preferences have been saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleThemeChange = async (newTheme: UserData["theme"]) => {
    try {
      await updateTheme(newTheme)

      const applyTheme = (selectedTheme: UserData["theme"]) => {
        if (selectedTheme === "dark") {
          document.documentElement.classList.add("dark")
        } else if (selectedTheme === "light") {
          document.documentElement.classList.remove("dark")
        } else {
          if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.classList.add("dark")
          } else {
            document.documentElement.classList.remove("dark")
          }
        }
      }

      applyTheme(newTheme)

      toast({
        title: "Theme updated",
        description: `Theme changed to ${newTheme} mode.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update theme. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpgrade = (planId: string) => {
    setSelectedPlanId(planId)
    setShowPaymentModal(true)
  }

  const handleDownloadInvoice = (invoice: any) => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const margin = 14

      // --- Color Palette ---
      const primaryColor = [6, 182, 212] // Cyan-500 (#06b6d4)
      const secondaryColor = [15, 23, 42] // Slate-900 (#0f172a)
      const accentColor = [241, 245, 249] // Slate-100 (#f1f5f9)

      // --- Header Branding ---
      // Logo and Title
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.rect(0, 0, pageWidth, 40, "F")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(28)
      doc.setTextColor(255, 255, 255)
      doc.text("CloudVault", margin, 26)

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text("PREMIUM STORAGE SOLUTIONS", margin, 34)

      // PAID Badge
      doc.setFillColor(34, 197, 94) // Green-500
      doc.roundedRect(pageWidth - 44, 15, 30, 10, 2, 2, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("PAID", pageWidth - 29, 21.5, { align: "center" })

      // --- Company Info & Invoice Metadata ---
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("FROM:", margin, 55)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(71, 85, 105) // Slate-600
      doc.text("CloudVault Inc.", margin, 61)
      doc.text("123 Storage Avenue", margin, 66)
      doc.text("Silicon Valley, CA 94043", margin, 71)
      doc.text("billing@cloudvault.com", margin, 76)

      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.setFont("helvetica", "bold")
      doc.text("INVOICE DETAILS:", pageWidth / 2, 55)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(71, 85, 105)
      doc.text(`Invoice #: CV-${invoice.id.substring(0, 8).toUpperCase()}`, pageWidth / 2, 61)
      doc.text(`Date: ${formatDate(invoice.date)}`, pageWidth / 2, 66)
      doc.text(`Terms: Net 0 (One-time Payment)`, pageWidth / 2, 71)

      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.setFont("helvetica", "bold")
      doc.text("BILL TO:", pageWidth - margin, 55, { align: "right" })
      doc.setFont("helvetica", "normal")
      doc.setTextColor(71, 85, 105)
      doc.text(`${user.displayName}`, pageWidth - margin, 61, { align: "right" })
      doc.text(`${user.email}`, pageWidth - margin, 66, { align: "right" })

      // --- Main Transaction Table ---
      const planData = UNIVERSAL_PLANS[invoice.planId as keyof typeof UNIVERSAL_PLANS]

      autoTable(doc, {
        startY: 85,
        head: [['PLAN', 'PERIOD', 'STORAGE', 'AMOUNT']],
        body: [
          [
            { content: invoice.planName?.toUpperCase() || "PLAN", styles: { fontStyle: 'bold' } },
            'Monthly',
            `${planData?.storage || 0} GB`,
            `INR ${invoice.amount?.toFixed(2)}`
          ]
        ],
        theme: 'striped',
        headStyles: { fillColor: secondaryColor as [number, number, number], textColor: 255, fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 6 },
        columnStyles: {
          3: { halign: 'right', fontStyle: 'bold' }
        }
      })

      // --- Plan Features Checklist (Premium Addition) ---
      let nextY = (doc as any).lastAutoTable.finalY + 15

      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
      doc.rect(margin, nextY, pageWidth - (margin * 2), 70, "F")

      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("PLAN INCLUSIONS & FEATURES", margin + 6, nextY + 10)

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(71, 85, 105)

      const features = [
        { label: "Cloud Storage", value: `${planData?.storage} GB` },
        { label: "File to URL Links/month", value: planData?.links === 999999 ? "Unlimited" : `${planData?.links}` },
        { label: "Bandwidth/month", value: planData?.bandwidth === 999999 ? "Unlimited" : `${planData?.bandwidth} GB` },
        { label: "Link Expiry", value: planData?.expirationDays === 0 ? "Infinite" : `${planData?.expirationDays} Days` },
        { label: "BG Removals", value: planData?.bgRemovalLimit === 999999 ? "Unlimited" : `${planData?.bgRemovalLimit}/mo` },
        { label: "Personal Vault", value: planData?.vault ? "Included" : "Not Included" },
        { label: "AI Chatbot", value: planData?.chatbot ? "Enabled" : "Disabled" }
      ]

      features.forEach((f, i) => {
        const col = i < 3 ? 0 : 1
        const row = i % 3
        const xPos = margin + 10 + (col * (pageWidth / 2 - margin))
        const yPos = nextY + 22 + (row * 12)

        // Draw bullet point
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.circle(xPos, yPos - 1, 1, "F")

        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
        doc.setFont("helvetica", "bold")
        doc.text(f.label, xPos + 5, yPos)

        doc.setTextColor(71, 85, 105)
        doc.setFont("helvetica", "normal")
        doc.text(`: ${f.value}`, xPos + 45, yPos)
      })

      // --- Footer Summary ---
      const summaryY = nextY + 85
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2])
      doc.setLineWidth(0.5)
      doc.line(margin, summaryY, pageWidth - margin, summaryY)

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text(`TOTAL PAID: INR ${invoice.amount?.toFixed(2)}`, pageWidth - margin, summaryY + 15, { align: "right" })

      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184) // Slate-400
      doc.text("CloudVault Inc. | support@cloudvault.com | www.cloudvault.com", pageWidth / 2, 285, { align: "center" })

      doc.save(`CloudVault_Invoice_${invoice.id.toUpperCase()}.pdf`)

      toast({
        title: "Invoice Downloaded",
        description: "Your premium invoice has been saved.",
      })
    } catch (error) {
      console.error("PDF Error", error)
      toast({
        title: "Error",
        description: "Failed to generate invoice PDF",
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    try {
      await changePassword(currentPassword, newPassword)
      setShowChangePasswordModal(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast({
        title: "Success",
        description: "Password changed successfully",
      })
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to change password. check your current password",
        variant: "destructive",
      })
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!authUser?.uid) return
    if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) return

    try {
      await deleteDoc(doc(db, "users", authUser.uid, "invoices", invoiceId))
      toast({
        title: "Invoice Deleted",
        description: "The invoice has been removed from your history.",
      })
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast({
        title: "Error",
        description: "Failed to delete invoice.",
        variant: "destructive",
      })
    }
  }

  // 2FA Handlers
  const handleStartEnable2FA = async () => {
    try {
      const secret = authenticator.generateSecret()
      const userEmail = user.email || "user@cloudvault.com"
      const otpauth = authenticator.keyuri(userEmail, "CloudVault", secret)
      const imageUrl = await toDataURL(otpauth)

      setTwoFactorSecret(secret)
      setTwoFactorQrCode(imageUrl)
      setIsSetupTwoFactor(true)
    } catch (error) {
      console.error("Error generating 2FA:", error)
      toast({
        title: "Error",
        description: "Failed to generate 2FA secret",
        variant: "destructive",
      })
    }
  }

  const handleVerifyAndEnable2FA = async () => {
    try {
      const isValid = authenticator.check(twoFactorVerifyCode, twoFactorSecret)
      if (!isValid) {
        toast({
          title: "Invalid Code",
          description: "Please enter a valid code from your authenticator app.",
          variant: "destructive",
        })
        return
      }

      await enable2FA(twoFactorSecret)
      setIsSetupTwoFactor(false)
      setTwoFactorSecret("")
      setTwoFactorQrCode("")
      setTwoFactorVerifyCode("")
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled.",
      })
    } catch (error) {
      console.error("Error enabling 2FA:", error)
      toast({
        title: "Error",
        description: "Failed to enable 2FA",
        variant: "destructive",
      })
    }
  }

  const handleDisable2FA = async () => {
    try {
      if (confirm("Are you sure you want to disable 2FA? Your account will be less secure.")) {
        await disable2FA()
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled.",
        })
      }
    } catch (error) {
      console.error("Error disabling 2FA:", error)
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      })
    }
  }

  const handleCancel2FASetup = () => {
    setIsSetupTwoFactor(false)
    setTwoFactorSecret("")
    setTwoFactorQrCode("")
    setTwoFactorVerifyCode("")
  }

  useEffect(() => {
    const currentTheme = user.theme || "system"

    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (currentTheme === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [user.theme])

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-foreground/60 mt-2">Manage your account and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
              {settingsMenu.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSettings(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeSettings === item.id ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted/60"
                      }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {activeSettings === "account" && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">Account Information</h2>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground/70 mb-2 block">Full Name</label>
                        <div className="relative">
                          {isEditingName ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newDisplayName}
                                onChange={(e) => setNewDisplayName(e.target.value)}
                                className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                autoFocus
                              />
                              <button
                                onClick={handleSaveName}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingName(false)
                                  setNewDisplayName(user.displayName)
                                }}
                                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="text"
                                value={user.displayName}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                readOnly
                              />
                              <button
                                onClick={() => setIsEditingName(true)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-lg transition"
                                title="Edit name"
                              >
                                <Edit2 size={16} className="text-foreground/60" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground/70 mb-2 block">Email</label>
                        <input
                          type="email"
                          value={user.email}
                          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          readOnly
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-2 block">Current Plan</label>
                      <div className="bg-muted/40 border border-border rounded-lg px-4 py-3">
                        <p className="font-semibold text-foreground capitalize">
                          {plan} Plan - {storageTotalGB.toFixed(0)}GB
                        </p>
                        <p className="text-xs text-foreground/60 mt-1">{getPlanPrice()} per month</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-2 block">Member Since</label>
                      <p className="text-foreground font-medium">{formatDate(user.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-2 block">Theme</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleThemeChange("light")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${theme === "light"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted border-border hover:bg-muted/80 text-foreground"
                            }`}
                        >
                          <Sun size={18} />
                          <span>Light</span>
                        </button>
                        <button
                          onClick={() => handleThemeChange("dark")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${theme === "dark"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted border-border hover:bg-muted/80 text-foreground"
                            }`}
                        >
                          <Moon size={18} />
                          <span>Dark</span>
                        </button>
                        <button
                          onClick={() => handleThemeChange("system")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${theme === "system"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted border-border hover:bg-muted/80 text-foreground"
                            }`}
                        >
                          <Monitor size={18} />
                          <span>System</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSettings === "security" && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">Security Settings</h2>
                  <div className="space-y-4">

                    <div className="space-y-4">
                      <div className="p-4 bg-muted/40 border border-border rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">Password</p>
                          <p className="text-xs text-foreground/60 mt-1">Manage your password</p>
                        </div>
                        <button
                          onClick={() => setShowChangePasswordModal(true)}
                          className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition"
                        >
                          Change
                        </button>
                      </div>

                      <div className="p-4 bg-muted/40 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-semibold text-foreground">Two-Factor Authentication (2FA)</p>
                            <p className="text-xs text-foreground/60 mt-1">Add an extra layer of security to your account</p>
                          </div>
                          {user.twoFactorEnabled ? (
                            <div className="flex flex-col items-end gap-2">
                              <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-medium border border-green-500/20">Enabled</span>
                              <button
                                onClick={handleDisable2FA}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Disable
                              </button>
                            </div>
                          ) : (
                            !isSetupTwoFactor && (
                              <button
                                onClick={handleStartEnable2FA}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm"
                              >
                                Enable 2FA
                              </button>
                            )
                          )}
                        </div>

                        {isSetupTwoFactor && (
                          <div className="mt-4 p-4 border border-border bg-background rounded-lg space-y-4">
                            <h4 className="font-semibold text-foreground">Setup 2FA</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <p className="text-sm text-foreground/80">1. Scan the QR code using Google Authenticator or any other TOTP app.</p>
                                {twoFactorQrCode && (
                                  <div className="bg-white p-2 w-fit rounded-lg">
                                    <img src={twoFactorQrCode} alt="2FA QR Code" className="w-40 h-40" />
                                  </div>
                                )}
                                <p className="text-xs text-foreground/60">
                                  Can't scan? Use this code: <span className="font-mono bg-muted px-1 rounded select-all">{twoFactorSecret}</span>
                                </p>
                              </div>
                              <div className="space-y-4">
                                <p className="text-sm text-foreground/80">2. Enter the 6-digit code from your app.</p>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={twoFactorVerifyCode}
                                    onChange={(e) => setTwoFactorVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-center tracking-widest text-lg"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleVerifyAndEnable2FA}
                                    disabled={twoFactorVerifyCode.length !== 6}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Verify & Enable
                                  </button>
                                  <button
                                    onClick={handleCancel2FASetup}
                                    className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSettings === "notifications" && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">Notification Preferences</h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 hover:bg-muted/40 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.fileUploads}
                        onChange={(e) => handleNotificationToggle("fileUploads", e.target.checked)}
                        className="rounded"
                      />
                      <div>
                        <p className="font-medium text-foreground">File uploads</p>
                        <p className="text-xs text-foreground/60">Notify when files are uploaded</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 hover:bg-muted/40 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.sharedFiles}
                        onChange={(e) => handleNotificationToggle("sharedFiles", e.target.checked)}
                        className="rounded"
                      />
                      <div>
                        <p className="font-medium text-foreground">Shared files</p>
                        <p className="text-xs text-foreground/60">Notify when files are shared with you</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 hover:bg-muted/40 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.storageAlerts}
                        onChange={(e) => handleNotificationToggle("storageAlerts", e.target.checked)}
                        className="rounded"
                      />
                      <div>
                        <p className="font-medium text-foreground">Storage alerts</p>
                        <p className="text-xs text-foreground/60">Notify when storage is running low</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSettings === "billing" && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">Billing & Subscription</h2>
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl">
                      <p className="text-sm text-foreground/70 mb-2">Current Subscription</p>
                      <p className="text-3xl font-bold text-foreground capitalize mb-2">
                        {plan} Plan
                      </p>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-foreground/80">
                          <span className="text-2xl font-bold text-primary">₹{getCurrentPlanDetails().price}</span>
                          {getCurrentPlanDetails().price > 0 && <span className="text-foreground/60">/{getCurrentPlanDetails().period}</span>}
                        </p>
                        {user.planExpiry && (
                          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <Check size={12} />
                            Expires: {formatDate(user.planExpiry)}
                          </p>
                        )}
                        <p className="text-sm text-foreground/70">Storage: {getCurrentPlanDetails().storage}GB</p>
                        <p className="text-sm text-foreground/70">Links/Month: {getCurrentPlanDetails().links === 999999 ? "Unlimited" : getCurrentPlanDetails().links}</p>
                        <p className="text-sm text-foreground/70">BG Removals: {getCurrentPlanDetails().bgRemovalLimit === 999999 ? "Unlimited" : `${getCurrentPlanDetails().bgRemovalLimit}/mo`}</p>
                        <p className="text-sm text-foreground/70">Bandwidth: {getCurrentPlanDetails().bandwidth === 999999 ? "Unlimited" : `${getCurrentPlanDetails().bandwidth}GB`}/month</p>
                      </div>
                      <div className="mt-6">
                        <button
                          onClick={() => onNavigate("plans")}
                          className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          See All Plans <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Invoices Section */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Payment History & Invoices</h3>
                      <div className="bg-card border border-border rounded-xl theme-transition overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/50 border-b border-border text-left">
                                <th className="px-4 py-3 font-medium text-foreground/70">Invoice ID</th>
                                <th className="px-4 py-3 font-medium text-foreground/70">Date</th>
                                <th className="px-4 py-3 font-medium text-foreground/70">Plan</th>
                                <th className="px-4 py-3 font-medium text-foreground/70">Amount</th>
                                <th className="px-4 py-3 font-medium text-foreground/70">Status</th>
                                <th className="px-4 py-3 font-medium text-foreground/70 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition">
                                  <td className="px-4 py-3 font-medium text-foreground">{invoice.id.substring(0, 8)}...</td>
                                  <td className="px-4 py-3 text-foreground/80">{formatDate(invoice.date)}</td>
                                  <td className="px-4 py-3 text-foreground/80">{invoice.planName}</td>
                                  <td className="px-4 py-3 text-foreground font-medium">₹{invoice.amount}</td>
                                  <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-semibold border border-green-500/20">
                                      {invoice.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2 ml-auto">
                                      <button
                                        onClick={() => handleDownloadInvoice(invoice)}
                                        className="text-primary hover:underline font-medium text-xs flex items-center gap-1"
                                      >
                                        Download
                                      </button>
                                      <button
                                        onClick={() => handleDeleteInvoice(invoice.id)}
                                        className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition"
                                        title="Delete Invoice"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>


                  </div>
                </div>
              </div>
            )}
          </div>
        </div >
      </div >

      {showPaymentModal && (
        <PaymentModal
          planId={selectedPlanId}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false)
            // Instantly updated via AuthContext
          }}
        />
      )
      }

      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-foreground mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
