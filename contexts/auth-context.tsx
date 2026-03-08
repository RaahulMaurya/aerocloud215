"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
// Re-export React so we can use React.useRef below
import React from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, deleteField, collection, addDoc, onSnapshot } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { UNIVERSAL_PLANS } from "@/lib/razorpay"

const PLANS = {
  free: { id: "free", storage: 5 },
  starter: { id: "starter", storage: 50 },
  pro: { id: "pro", storage: 200 },
  enterprise: { id: "enterprise", storage: 1024 },
}

interface UserData {
  uid: string
  email: string
  displayName: string
  createdAt: string
  lastNotificationLevel: number

  maxStorage: number
  storageUsed: number

  subscriptionPlan: "free" | "starter" | "pro" | "enterprise"
  plan: "free" | "starter" | "pro" | "enterprise"

  storageTotal?: number
  bgRemovalsUsed?: number // Track number of images processed this month

  theme: "light" | "dark" | "system"
  notifications: {
    fileUploads: boolean
    sharedFiles: boolean
    storageAlerts: boolean
  }
  fileToURLPlan?: string
  twoFactorEnabled?: boolean
  twoFactorSecret?: string
  planExpiry?: string
  filesCount?: number
}


interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  logIn: (email: string, password: string) => Promise<void>
  logOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserPlan: (planId: string) => Promise<void>
  updateFileToURLPlan: (planId: string) => Promise<void>
  updateStorageUsed: (used: number) => Promise<void>
  updateBgRemovalsUsed: (count: number) => Promise<void>
  updateNotificationSettings: (settings: Partial<UserData["notifications"]>) => Promise<void>
  updateTheme: (theme: UserData["theme"]) => Promise<void>
  updateDisplayName: (name: string) => Promise<void>
  refreshUserData: () => Promise<void>
  enable2FA: (secret: string) => Promise<void>
  disable2FA: () => Promise<void>
  verify2FALogin: (code: string) => boolean
  is2FAVerified: boolean
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  recordPaymentSuccess: (planId: string, transactionDetails: any) => Promise<void>
  downgradeToFree: () => Promise<void>
  updateFilesCount: (count: number) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

import { authenticator } from "@otplib/preset-default"
import { getCountFromServer } from "firebase/firestore"
authenticator.options = { window: 1 }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [is2FAVerified, setIs2FAVerified] = useState(false)
  // Holds the unsubscribe fn for the user doc real-time listener
  const userDocUnsubRef = React.useRef<(() => void) | null>(null)
  // Track whether we've done the initial count sync for this session
  const countSyncedRef = React.useRef(false)

  // Subscribe to user document in real-time (so mobile changes propagate to web immediately)
  const subscribeToUserData = (uid: string) => {
    // Cancel any previous listener first
    if (userDocUnsubRef.current) {
      userDocUnsubRef.current()
      userDocUnsubRef.current = null
    }
    // Reset sync flag for new session
    countSyncedRef.current = false

    const userDocRef = doc(db, "users", uid)
    const unsub = onSnapshot(userDocRef, async (userDoc) => {
      if (!userDoc.exists()) {
        console.log("User document does not exist for uid:", uid)
        return
      }

      const data = userDoc.data() as UserData

      if (!data.notifications) {
        data.notifications = { fileUploads: true, sharedFiles: true, storageAlerts: true }
      }
      if (!data.theme) data.theme = "light"
      if (data.maxStorage && !data.storageTotal) {
        data.storageTotal = data.maxStorage / (1024 * 1024 * 1024)
      }
      data.plan = data.plan ?? data.subscriptionPlan ?? "free"

      // Always reconcile filesCount from the real collection on first load of each session.
      // This fixes stale/wrong counts stored in the user document.
      if (!countSyncedRef.current) {
        countSyncedRef.current = true
        try {
          const filesColl = collection(db, `files/${uid}/userFiles`)
          const snapshot = await getCountFromServer(filesColl)
          const realCount = snapshot.data().count
          data.filesCount = realCount
          // Write back only if it differs from what's stored
          if (userDoc.data()?.filesCount !== realCount) {
            await updateDoc(userDocRef, { filesCount: realCount })
            console.log("Reconciled filesCount:", userDoc.data()?.filesCount, "→", realCount)
          }
        } catch (error) {
          console.error("Error reconciling filesCount:", error)
          data.filesCount = data.filesCount ?? 0
        }
      }

      // Apply theme
      const applyTheme = (theme: UserData["theme"]) => {
        try {
          localStorage.setItem("theme", theme)
          if (theme === "dark") {
            document.documentElement.classList.add("dark")
          } else if (theme === "light") {
            document.documentElement.classList.remove("dark")
          } else {
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
              document.documentElement.classList.add("dark")
            } else {
              document.documentElement.classList.remove("dark")
            }
          }
          window.dispatchEvent(new Event("theme-changed"))
        } catch (error) {
          console.error("Error applying theme:", error)
        }
      }
      applyTheme(data.theme)

      setUserData(data)

      if (data.twoFactorEnabled) {
        setIs2FAVerified(false)
      } else {
        setIs2FAVerified(true)
      }
    }, (error) => {
      console.error("Error in user doc listener:", error)
    })

    userDocUnsubRef.current = unsub
    return unsub
  }

  // Keep fetchUserData as a thin wrapper that just triggers the real-time subscription
  const fetchUserData = async (uid: string) => {
    subscribeToUserData(uid)
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const freePlan = UNIVERSAL_PLANS.free
    const maxStorageBytes = freePlan.storage * 1024 * 1024 * 1024 // Convert GB to bytes

    const newUserData: UserData = {
      uid: userCredential.user.uid,
      email,
      displayName: name,
      createdAt: new Date().toISOString(),
      lastNotificationLevel: 0,
      maxStorage: maxStorageBytes,
      storageUsed: 0,
      subscriptionPlan: "free",
      plan: "free",
      theme: "light",
      notifications: {
        fileUploads: true,
        sharedFiles: true,
        storageAlerts: true,
      },
      filesCount: 0,
    }

    const userDocRef = doc(db, "users", userCredential.user.uid)
    await setDoc(userDocRef, newUserData)
    console.log("Created new user with data:", newUserData)
    setUserData(newUserData)
  }

  // Log in with email and password
  const logIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      console.log("Password reset email sent to:", email)
    } catch (error: any) {
      console.error("Error sending password reset email:", error)
      if (error.code === "auth/user-not-found") {
        throw new Error("No account found with this email address.")
      }
      throw error
    }
  }

  // Log out
  const logOut = async () => {
    // Cancel user doc listener before signing out
    if (userDocUnsubRef.current) {
      userDocUnsubRef.current()
      userDocUnsubRef.current = null
    }
    await signOut(auth)
    setUserData(null)
  }

  // Update user plan
  const updateUserPlan = async (planId: string) => {
    if (!user) return
    const plan = UNIVERSAL_PLANS[planId as keyof typeof UNIVERSAL_PLANS]
    if (!plan) {
      console.error("Invalid plan ID:", planId)
      return
    }

    const maxStorageBytes = plan.storage * 1024 * 1024 * 1024

    const userDocRef = doc(db, "users", user.uid)
    await updateDoc(userDocRef, {
      plan: planId,
      maxStorage: maxStorageBytes,
      subscriptionPlan: planId,
      lastPlanUpgrade: new Date().toISOString(),
    })

    if (userData) {
      setUserData({
        ...userData,
        plan: planId as any,
        maxStorage: maxStorageBytes,
        subscriptionPlan: planId as any,
      })
    }
  }

  const recordPaymentSuccess = async (planId: string, transactionDetails: any) => {
    if (!user) return

    const plan = UNIVERSAL_PLANS[planId as keyof typeof UNIVERSAL_PLANS]
    if (!plan) return

    const now = new Date()
    const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    const maxStorageBytes = plan.storage * 1024 * 1024 * 1024

    // 1. Update User Doc
    const userDocRef = doc(db, "users", user.uid)
    await updateDoc(userDocRef, {
      plan: planId,
      maxStorage: maxStorageBytes,
      subscriptionPlan: planId,
      lastPlanUpgrade: now.toISOString(),
      planExpiry: expiryDate.toISOString(),
      bgRemovalsUsed: 0,
    })

    // 2. Add Invoice to Subcollection
    const invoicesRef = collection(db, "users", user.uid, "invoices")
    await addDoc(invoicesRef, {
      ...transactionDetails,
      planId,
      planName: plan.name,
      amount: plan.price,
      date: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      status: "paid",
    })

    // 3. Update Local State
    if (userData) {
      setUserData({
        ...userData,
        plan: planId as any,
        maxStorage: maxStorageBytes,
        subscriptionPlan: planId as any,
        planExpiry: expiryDate.toISOString(),
        bgRemovalsUsed: 0,
      })
    }
  }

  // Downgrade to Free Plan
  const downgradeToFree = async () => {
    if (!user || !userData) throw new Error("User not authenticated")

    const freePlan = UNIVERSAL_PLANS.free
    const maxStorageBytes = freePlan.storage * 1024 * 1024 * 1024

    // 1. Check Storage Usage
    // Note: user.storageTotal might be populated, or we might need to rely on userData
    // Assuming 'storageTotal' holds current usage in bytes. If it's missing, we skip check (or fetch it).
    // Let's assume userData.storageTotal is accurate.
    const currentUsage = userData.storageTotal || 0

    if (currentUsage > maxStorageBytes) {
      const usedGB = (currentUsage / (1024 * 1024 * 1024)).toFixed(2)
      throw new Error(`Cannot downgrade. Your storage usage (${usedGB}GB) exceeds the Free plan limit (${freePlan.storage}GB). Please delete some files first.`)
    }

    // 2. Update User Doc
    const userDocRef = doc(db, "users", user.uid)
    await updateDoc(userDocRef, {
      plan: "free",
      subscriptionPlan: "free",
      maxStorage: maxStorageBytes,
      planExpiry: deleteField(), // Remove expiry for free plan
      lastPlanUpgrade: new Date().toISOString(),
    })

    // 3. Update Local State
    setUserData({
      ...userData,
      plan: "free",
      subscriptionPlan: "free",
      maxStorage: maxStorageBytes,
      planExpiry: undefined,
    })
  }

  // Update user File to URL plan
  const updateFileToURLPlan = async (planId: string) => {
    if (!user) return

    const userDocRef = doc(db, "users", user.uid)
    await setDoc(
      userDocRef,
      {
        fileToURLPlan: planId,
      },
      { merge: true },
    )

    if (userData) {
      setUserData({
        ...userData,
        fileToURLPlan: planId,
      })
    }
  }

  // Update storage used
  const updateStorageUsed = async (used: number) => {
    if (!user) return
    const usedBytes = Math.round(used)
    const userDocRef = doc(db, "users", user.uid)
    await setDoc(
      userDocRef,
      {
        storageUsed: usedBytes,
      },
      { merge: true },
    )

    if (userData) {
      setUserData({
        ...userData,
        storageUsed: usedBytes,
      })
    }
  }

  // Update files count
  const updateFilesCount = async (count: number) => {
    if (!user) return
    const safeCount = Math.max(0, count)
    const userDocRef = doc(db, "users", user.uid)
    await setDoc(
      userDocRef,
      {
        filesCount: safeCount,
      },
      { merge: true },
    )

    if (userData) {
      setUserData({
        ...userData,
        filesCount: safeCount,
      })
    }
  }

  // Update background removals used
  const updateBgRemovalsUsed = async (count: number) => {
    if (!user) return
    const userDocRef = doc(db, "users", user.uid)
    await setDoc(
      userDocRef,
      {
        bgRemovalsUsed: count,
      },
      { merge: true },
    )

    if (userData) {
      setUserData({
        ...userData,
        bgRemovalsUsed: count,
      })
    }
  }

  // Update notification settings
  const updateNotificationSettings = async (settings: Partial<UserData["notifications"]>) => {
    if (!user || !userData) return
    const userDocRef = doc(db, "users", user.uid)
    const updatedNotifications = { ...userData.notifications, ...settings }
    await setDoc(userDocRef, { notifications: updatedNotifications }, { merge: true })
    setUserData({ ...userData, notifications: updatedNotifications })
  }

  // Update theme
  const updateTheme = async (theme: UserData["theme"]) => {
    if (!user || !userData) return
    const userDocRef = doc(db, "users", user.uid)
    await setDoc(userDocRef, { theme }, { merge: true })
    setUserData({ ...userData, theme })
  }

  // Update display name
  const updateDisplayName = async (name: string) => {
    if (!user) return

    // Update Firebase Auth profile
    await updateProfile(user, { displayName: name })

    // Update Firestore
    const userDocRef = doc(db, "users", user.uid)
    await setDoc(userDocRef, { displayName: name }, { merge: true })

    if (userData) {
      setUserData({ ...userData, displayName: name })
    }
  }

  // Enable 2FA
  const enable2FA = async (secret: string) => {
    if (!user) return
    const userDocRef = doc(db, "users", user.uid)
    await updateDoc(userDocRef, {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    })
    if (userData) {
      setUserData({ ...userData, twoFactorEnabled: true, twoFactorSecret: secret })
      setIs2FAVerified(true) // Should use setState here
    }
    setIs2FAVerified(true)
  }

  // Disable 2FA
  const disable2FA = async () => {
    if (!user) return
    const userDocRef = doc(db, "users", user.uid)
    await updateDoc(userDocRef, {
      twoFactorEnabled: false,
      twoFactorSecret: deleteField(),
    })
    if (userData) {
      const newUserData = { ...userData }
      newUserData.twoFactorEnabled = false
      delete newUserData.twoFactorSecret
      setUserData(newUserData)
      setIs2FAVerified(true)
    }
  }

  // Verify 2FA Login
  const verify2FALogin = (code: string) => {
    if (!userData?.twoFactorSecret) return true // Should not happen if guided correctly
    try {
      const isValid = authenticator.check(code, userData.twoFactorSecret)
      if (isValid) {
        setIs2FAVerified(true)
        return true
      }
      return false
    } catch (e) {
      console.error("Token verification failed", e)
      return false
    }
  }

  // Change Password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error("User not authenticated")

    // 1. Re-authenticate
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)

    // 2. Update Password
    await updatePassword(user, newPassword)
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser?.uid)
      setUser(firebaseUser)
      if (firebaseUser) {
        await fetchUserData(firebaseUser.uid)
      } else {
        // Cancel user doc listener on sign-out
        if (userDocUnsubRef.current) {
          userDocUnsubRef.current()
          userDocUnsubRef.current = null
        }
        setUserData(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    userData,
    loading,
    signUp,
    logIn,
    resetPassword,
    logOut,
    updateUserPlan,
    updateFileToURLPlan,
    updateStorageUsed,
    updateBgRemovalsUsed,
    updateNotificationSettings,
    updateTheme,
    updateDisplayName,
    refreshUserData: () => user ? fetchUserData(user.uid) : Promise.resolve(),
    enable2FA,
    disable2FA,
    verify2FALogin,
    is2FAVerified,
    changePassword,
    recordPaymentSuccess,
    downgradeToFree,
    updateFilesCount,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
