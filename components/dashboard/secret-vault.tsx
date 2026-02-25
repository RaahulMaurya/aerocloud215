"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Lock,
  Unlock,
  FolderLock,
  Download,
  Trash2,
  UploadIcon,
  Eye,
  AlertTriangle,
  KeyRound,
  ShieldAlert,
  Crown,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore"
import { ref, deleteObject, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

export function SecretVault() {
  const { userData } = useAuth()
  const { toast } = useToast()

  // Check if user has access to Secret Vault (Starter+ plans only)
  const vaultAccessible = userData?.subscriptionPlan && ['starter', 'pro', 'enterprise'].includes(userData.subscriptionPlan)

  const [isLocked, setIsLocked] = useState(true)
  const [pin, setPin] = useState("")
  const [pinLength, setPinLength] = useState<4 | 6 | 10>(4)
  const [storedPin, setStoredPin] = useState<string | null>(null)
  const [showSetupPin, setShowSetupPin] = useState(false)
  const [vaultFiles, setVaultFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showResetVault, setShowResetVault] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetPin, setResetPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [newPinLength, setNewPinLength] = useState<4 | 6 | 10>(4)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const resetInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const newPinRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const savedPin = localStorage.getItem(`vault_pin_${userData?.uid}`)
    setStoredPin(savedPin)
    if (!savedPin) {
      setShowSetupPin(true)
    }
  }, [userData])

  useEffect(() => {
    if ((isLocked || showSetupPin) && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [isLocked, showSetupPin, pinLength])

  const handleDigitChange = (index: number, value: string) => {
    const newPin = pin.split("")
    newPin[index] = value
    const updatedPin = newPin.join("").slice(0, showSetupPin ? pinLength : storedPin?.length || 4)
    setPin(updatedPin)

    if (value && index < (showSetupPin ? pinLength : storedPin?.length || 4) - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (updatedPin.length === (showSetupPin ? pinLength : storedPin?.length || 4)) {
      setTimeout(() => handlePinSubmit(updatedPin), 100)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePinSubmit = (pinToVerify?: string) => {
    const currentPin = pinToVerify || pin
    if (!storedPin) {
      if (currentPin.length === pinLength) {
        localStorage.setItem(`vault_pin_${userData?.uid}`, currentPin)
        setStoredPin(currentPin)
        setIsLocked(false)
        setShowSetupPin(false)
        setPin("")
        toast({
          title: "PIN Set Successfully",
          description: "Your Secret Vault is now secured with a PIN.",
        })
        loadVaultFiles()
      } else {
        toast({
          title: "Invalid PIN",
          description: `Please enter a ${pinLength}-digit PIN.`,
          variant: "destructive",
        })
      }
    } else {
      if (currentPin === storedPin) {
        setIsLocked(false)
        setPin("")
        loadVaultFiles()
      } else {
        toast({
          title: "Incorrect PIN",
          description: "Please try again.",
          variant: "destructive",
        })
        setPin("")
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      }
    }
  }

  const loadVaultFiles = async () => {
    if (!userData) return
    setLoading(true)
    try {
      const filesRef = collection(db, "files", userData.uid, "vaultFiles")
      const filesSnapshot = await getDocs(filesRef)
      const files = filesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setVaultFiles(files)
    } catch (error) {
      console.error("Error loading vault files:", error)
    }
    setLoading(false)
  }

  const handleFileUpload = async (file: File) => {
    if (!userData) return
    setUploading(true)
    try {
      const storageRef = ref(storage, `vault/${userData.uid}/${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload error:", error)
          toast({
            title: "Upload Failed",
            description: error.message,
            variant: "destructive",
          })
          setUploading(false)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          const filesRef = collection(db, "files", userData.uid, "vaultFiles")
          await addDoc(filesRef, {
            name: file.name,
            size: file.size,
            contentType: file.type,
            storagePath: `vault/${userData.uid}/${file.name}`,
            downloadURL,
            createdAt: new Date().toISOString(),
          })
          toast({
            title: "File Uploaded",
            description: `${file.name} has been added to your Secret Vault.`,
          })
          setUploading(false)
          loadVaultFiles()
        },
      )
    } catch (error) {
      console.error("Upload error:", error)
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: string, storagePath: string) => {
    if (!userData) return
    try {
      const fileRef = ref(storage, storagePath)
      await deleteObject(fileRef)
      const docRef = doc(db, "files", userData.uid, "vaultFiles", fileId)
      await deleteDoc(docRef)
      toast({
        title: "File Deleted",
        description: "File has been removed from your Secret Vault.",
      })
      loadVaultFiles()
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete file.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (downloadURL: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = downloadURL
    link.download = fileName
    link.click()
  }

  const handleView = (downloadURL: string) => {
    window.open(downloadURL, "_blank")
  }

  const handleResetVault = async () => {
    if (!userData) return
    if (resetPin !== storedPin) {
      toast({
        title: "Incorrect PIN",
        description: "Please enter the correct PIN to reset vault.",
        variant: "destructive",
      })
      setResetPin("")
      return
    }

    try {
      setLoading(true)
      const filesRef = collection(db, "files", userData.uid, "vaultFiles")
      const filesSnapshot = await getDocs(filesRef)

      for (const fileDoc of filesSnapshot.docs) {
        const fileData = fileDoc.data()
        const fileRef = ref(storage, fileData.storagePath)
        await deleteObject(fileRef)
        await deleteDoc(fileDoc.ref)
      }

      setVaultFiles([])
      setShowResetVault(false)
      setResetPin("")
      toast({
        title: "Vault Reset",
        description: "All files have been deleted from your Secret Vault.",
      })
    } catch (error) {
      console.error("Reset vault error:", error)
      toast({
        title: "Reset Failed",
        description: "Failed to reset vault.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = () => {
    if (resetPin !== storedPin) {
      toast({
        title: "Incorrect Current PIN",
        description: "Please enter your current PIN correctly.",
        variant: "destructive",
      })
      setResetPin("")
      return
    }

    if (newPin.length !== newPinLength) {
      toast({
        title: "Invalid New PIN",
        description: `Please enter a ${newPinLength}-digit PIN.`,
        variant: "destructive",
      })
      return
    }

    localStorage.setItem(`vault_pin_${userData?.uid}`, newPin)
    setStoredPin(newPin)
    setShowResetPassword(false)
    setResetPin("")
    setNewPin("")
    toast({
      title: "PIN Changed",
      description: "Your Secret Vault PIN has been updated successfully.",
    })
  }

  const handleResetPinDigitChange = (index: number, value: string) => {
    const newResetPin = resetPin.split("")
    newResetPin[index] = value
    const updatedPin = newResetPin.join("").slice(0, storedPin?.length || 4)
    setResetPin(updatedPin)

    if (value && index < (storedPin?.length || 4) - 1) {
      resetInputRefs.current[index + 1]?.focus()
    }
  }

  const handleNewPinDigitChange = (index: number, value: string) => {
    const newPinArr = newPin.split("")
    newPinArr[index] = value
    const updatedPin = newPinArr.join("").slice(0, newPinLength)
    setNewPin(updatedPin)

    if (value && index < newPinLength - 1) {
      newPinRefs.current[index + 1]?.focus()
    }
  }

  if (!vaultAccessible) {
    return (
      <div className="space-y-6 px-4 sm:px-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center opacity-50">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Secret Vault</h1>
            <p className="text-sm sm:text-base text-foreground/60">Personal PIN-protected storage</p>
          </div>
        </div>

        <div className="max-w-md mx-auto mt-8 sm:mt-16">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Premium Feature</h2>
              <p className="text-sm sm:text-base text-foreground/60 mb-6">
                Secret Vault is available on Starter plan and above.
              </p>
              <p className="text-xs sm:text-sm text-foreground/50 mb-6">
                Upgrade your account to access this secure, PIN-protected storage feature for keeping sensitive files private.
              </p>
            </div>

            <button
              onClick={() => window.location.href = '/pricing'}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition text-sm sm:text-base"
            >
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              View Plans
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLocked || showSetupPin) {
    return (
      <div className="space-y-6 px-4 sm:px-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Secret Vault</h1>
            <p className="text-sm sm:text-base text-foreground/60">Your private, PIN-protected storage</p>
          </div>
        </div>

        <div className="max-w-md mx-auto mt-8 sm:mt-16">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderLock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                {showSetupPin ? "Setup Your PIN" : "Enter PIN to Unlock"}
              </h2>
              <p className="text-sm sm:text-base text-foreground/60">
                {showSetupPin
                  ? `Choose a ${pinLength}-digit PIN to secure your vault`
                  : `Enter your ${storedPin?.length}-digit PIN to access your vault`}
              </p>
            </div>

            {showSetupPin && (
              <div className="flex flex-wrap gap-2 justify-center">
                {[4, 6, 10].map((length) => (
                  <button
                    key={length}
                    onClick={() => {
                      setPinLength(length as 4 | 6 | 10)
                      setPin("")
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm sm:text-base ${pinLength === length
                      ? "bg-gradient-to-r from-primary to-accent text-white"
                      : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                  >
                    {length} digits
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: showSetupPin ? pinLength : storedPin?.length || 4 }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={pin[i] || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      if (value) handleDigitChange(i, value)
                    }}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 border-2 rounded-lg text-center text-xl sm:text-2xl font-bold bg-background transition ${pin[i] ? "border-primary bg-primary/10" : "border-border"
                      } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none`}
                  />
                ))}
              </div>

              <button
                onClick={() => handlePinSubmit()}
                disabled={pin.length !== (showSetupPin ? pinLength : storedPin?.length)}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <Unlock className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                {showSetupPin ? "Set PIN" : "Unlock Vault"}
              </button>

              {!showSetupPin && storedPin && (
                <button
                  onClick={() => setShowResetPassword(true)}
                  className="w-full py-2 text-sm text-primary hover:text-primary/80 font-medium transition"
                >
                  Reset PIN
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reset PIN Modal - Accessible from locked state */}
        {showResetPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Reset PIN</h2>
                <p className="text-foreground/60">Change your Secret Vault PIN</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Current PIN</label>
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: storedPin?.length || 4 }).map((_, i) => (
                      <input
                        key={i}
                        ref={(el) => { resetInputRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={resetPin[i] || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          if (value) handleResetPinDigitChange(i, value)
                        }}
                        className="w-10 h-10 sm:w-12 sm:h-12 border-2 rounded-lg text-center text-xl sm:text-2xl font-bold bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">New PIN Length</label>
                  <div className="flex gap-2 justify-center">
                    {[4, 6, 10].map((length) => (
                      <button
                        key={length}
                        onClick={() => {
                          setNewPinLength(length as 4 | 6 | 10)
                          setNewPin("")
                        }}
                        className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${newPinLength === length
                          ? "bg-gradient-to-r from-primary to-accent text-white"
                          : "bg-muted text-foreground hover:bg-muted/80"
                          }`}
                      >
                        {length} digits
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">New PIN</label>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {Array.from({ length: newPinLength }).map((_, i) => (
                      <input
                        key={i}
                        ref={(el) => { newPinRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={newPin[i] || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          if (value) handleNewPinDigitChange(i, value)
                        }}
                        className="w-10 h-10 sm:w-12 sm:h-12 border-2 rounded-lg text-center text-xl sm:text-2xl font-bold bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowResetPassword(false)
                      setResetPin("")
                      setNewPin("")
                    }}
                    className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={resetPin.length !== (storedPin?.length || 4) || newPin.length !== newPinLength}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Change PIN
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Unlock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Secret Vault</h1>
            <p className="text-sm sm:text-base text-foreground/60">Your vault is unlocked</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowResetPassword(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition text-sm sm:text-base"
          >
            <KeyRound className="w-4 h-4 inline mr-2" />
            Reset PIN
          </button>
          <button
            onClick={() => setShowResetVault(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition text-sm sm:text-base"
          >
            <ShieldAlert className="w-4 h-4 inline mr-2" />
            Reset Vault
          </button>
          <button
            onClick={() => {
              setIsLocked(true)
              setPin("")
            }}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg transition text-sm sm:text-base"
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Lock Vault
          </button>
        </div>
      </div>

      {showResetVault && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Reset Vault?</h2>
              <p className="text-foreground/60">
                This will permanently delete ALL files in your Secret Vault. This action cannot be undone.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Enter your PIN to confirm</label>
                <div className="flex justify-center gap-2">
                  {Array.from({ length: storedPin?.length || 4 }).map((_, i) => (
                    <input
                      key={i}
                      ref={(el) => { resetInputRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={resetPin[i] || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        if (value) handleResetPinDigitChange(i, value)
                      }}
                      className="w-12 h-12 border-2 rounded-lg text-center text-2xl font-bold bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowResetVault(false)
                    setResetPin("")
                  }}
                  className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetVault}
                  disabled={resetPin.length !== (storedPin?.length || 4) || loading}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting..." : "Reset Vault"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
        <label className="flex flex-col items-center gap-3 sm:gap-4 cursor-pointer p-6 sm:p-8 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition">
          <UploadIcon className="w-10 h-10 sm:w-12 sm:h-12 text-foreground/40" />
          <div className="text-center">
            <p className="font-semibold text-foreground text-sm sm:text-base">Upload to Secret Vault</p>
            <p className="text-xs sm:text-sm text-foreground/60">Click to browse files</p>
          </div>
          <input
            type="file"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/60">Loading vault files...</p>
        </div>
      ) : vaultFiles.length === 0 ? (
        <div className="text-center py-12">
          <FolderLock className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <p className="text-foreground/60">Your vault is empty. Upload files to get started.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-foreground">Name</th>
                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-foreground">Size</th>
                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-foreground">Date Added</th>
                <th className="text-right p-3 sm:p-4 text-xs sm:text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vaultFiles.map((file) => (
                <tr key={file.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 sm:p-4 text-foreground text-sm">{file.name}</td>
                  <td className="p-3 sm:p-4 text-foreground/60 text-xs sm:text-sm">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </td>
                  <td className="p-3 sm:p-4 text-foreground/60 text-xs sm:text-sm">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 sm:p-4 text-right">
                    <div className="flex gap-1 sm:gap-2 justify-end">
                      <button
                        onClick={() => handleView(file.downloadURL)}
                        className="p-1.5 sm:p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDownload(file.downloadURL, file.name)}
                        className="p-1.5 sm:p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id, file.storagePath)}
                        className="p-1.5 sm:p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
