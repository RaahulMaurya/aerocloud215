"use client"

import { useState } from "react"
import { calculateStoragePercentage, UNIVERSAL_PLANS } from "@/lib/razorpay"
import { useEffect } from "react"
import { PaymentModal } from "./payment-modal"
import { Crown, HardDrive, Zap } from "lucide-react"

interface UserData {
  storageUsed: number
  storageTotal?: number
  maxStorage?: number
  plan?: string
  subscriptionPlan?: string
  planExpiry?: string
  filesCount?: number
}

export function StorageOverview({ user }: { user: UserData }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Use filesCount from userData (kept accurate by server-side atomic increments)
  const actualFileCount = user.filesCount ?? 0

  const plan = user.plan || user.subscriptionPlan || "free"
  const planDetails = UNIVERSAL_PLANS[plan as keyof typeof UNIVERSAL_PLANS]
  const planStorageGB = planDetails ? planDetails.storage : 5

  // Prioritize maxStorage (new field), fallback to plan storage, never use storageTotal
  const storageTotalGB = user.maxStorage ? user.maxStorage / (1024 * 1024 * 1024) : planStorageGB
  const storageUsedGB = user.storageUsed / (1024 * 1024 * 1024)

  const percentage = calculateStoragePercentage(storageUsedGB, storageTotalGB)
  const available = Math.max(0, storageTotalGB - storageUsedGB)

  console.log("[v0] Storage overview:", {
    plan,
    maxStorageBytes: user.maxStorage,
    storageUsedGB: storageUsedGB.toFixed(2),
    storageTotalGB: storageTotalGB.toFixed(2),
    percentage,
    available: available.toFixed(2),
  })

  const handleUpgrade = () => {
    setShowPaymentModal(true)
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Storage Card */}
        {/* Main Storage Card */}
        <div className="md:col-span-2 bg-white dark:bg-card border border-primary/10 dark:border-border rounded-2xl p-8 shadow-xl relative overflow-hidden group transition-all duration-300">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none transition-opacity duration-500" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground tracking-tight">Storage Usage</h2>
                  {plan !== "free" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-500 text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-foreground/60">
                  Plan: <span className="font-semibold text-gray-900 dark:text-foreground capitalize">{plan}</span>
                  {user.planExpiry && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-muted text-xs">
                      Expires: {new Date(user.planExpiry).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transform transition-transform group-hover:scale-110 duration-500">
                <HardDrive className="w-7 h-7 text-white" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <span className="text-4xl font-bold text-gray-900 dark:text-foreground tracking-tight">
                      {storageUsedGB.toFixed(2)}
                      <span className="text-lg text-gray-500 dark:text-foreground/50 font-medium ml-1">GB</span>
                    </span>
                    <div className="text-sm text-gray-500 dark:text-foreground/60 mt-1 font-medium">
                      of {storageTotalGB.toFixed(0)} GB Used
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                    {percentage}%
                  </span>
                </div>

                <div className="w-full bg-gray-100 dark:bg-muted rounded-full h-4 overflow-hidden p-1">
                  <div
                    className="bg-gradient-to-r from-primary via-accent to-primary h-full rounded-full shadow-lg relative overflow-hidden"
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] border-t border-white/20" />
                  </div>
                </div>
              </div>

              {/* Enhanced Storage Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-dashed border-gray-200 dark:border-border/50">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 dark:text-foreground/50 uppercase tracking-wider">Available</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-foreground">{available.toFixed(2)} GB</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 dark:text-foreground/50 uppercase tracking-wider">Total</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-foreground">{storageTotalGB.toFixed(0)} GB</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 dark:text-foreground/50 uppercase tracking-wider">Files</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-foreground">
                    {actualFileCount.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 dark:text-foreground/50 uppercase tracking-wider">Status</p>
                  <p className="text-lg font-bold text-emerald-500 flex items-center gap-1">
                    Active <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Card */}
        <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-gray-900 dark:via-slate-800 dark:to-black border border-primary/10 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative shadow-2xl transition-colors duration-300">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 dark:bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 dark:bg-accent/20 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="p-2 bg-primary/5 dark:bg-white/10 rounded-lg backdrop-blur-md border border-primary/10 dark:border-white/10">
                <Crown className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-gradient-to-r from-yellow-400 to-amber-600 text-white rounded text-[10px] uppercase tracking-wider shadow-sm">
                {plan === "free" ? "FREE PLAN" : "PREMIUM TIER"}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Need More Space?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed font-medium">
              {plan === "free"
                ? "Unlock your creative potential. Upgrade to Basic and get 50GB of premium secure storage."
                : plan === "premium"
                  ? "You are on our best tier! Scale to Premium Plus for 30TB."
                  : "Upgrade now to expand your storage and access unlimited features."}
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3 mb-8">
              {(plan === "free" ? [
                "5 GB Cloud Storage",
                "Advanced Sharing",
                "5 Background Removals/mo"
              ] : plan === "basic" ? [
                "50 GB Cloud Storage",
                "Personal Vault",
                "50 Background Removals/mo"
              ] : [
                "Massive Cloud Storage",
                "Unlimited Background Removals",
                "Huge Expiry Limits"
              ]).map((feature, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3 h-3 text-primary dark:text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            className="relative z-10 w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-100 px-4 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 group"
          >
            <span>View All Plans</span>
            <Zap className="w-4 h-4 text-white dark:text-black group-hover:text-yellow-400 dark:group-hover:text-yellow-500 transition-colors" />
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          planId=""
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false)
            // Instantly updated via AuthContext
          }}
        />
      )}
    </>
  )
}
