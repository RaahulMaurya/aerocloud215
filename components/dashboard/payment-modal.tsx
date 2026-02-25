"use client"

import { useState, useEffect } from "react"
import { X, CreditCard, Loader2, Check } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { UNIVERSAL_PLANS } from "@/lib/razorpay"
import { useToast } from "@/hooks/use-toast"

interface PaymentModalProps {
  planId: string
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({ planId, onClose, onSuccess }: PaymentModalProps) {
  const { userData, recordPaymentSuccess, downgradeToFree } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>("")
  const [selectedPlan, setSelectedPlan] = useState(planId)

  const showAllPlans = !planId
  const plan = selectedPlan ? UNIVERSAL_PLANS[selectedPlan as keyof typeof UNIVERSAL_PLANS] : null

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const response = await fetch("/api/razorpay-key")
        const data = await response.json()
        setRazorpayKeyId(data.keyId)
      } catch (error) {
        console.error("Error fetching Razorpay key:", error)
      }
    }
    fetchKey()
  }, [])

  const handlePayment = async () => {
    if (!userData || !razorpayKeyId || !plan) return

    setLoading(true)

    try {
      if (plan.price === 0) {
        await downgradeToFree()
        toast({
          title: "Plan Updated",
          description: "You have been switched to the Free plan successfully.",
        })
        onSuccess()
        return
      }

      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: plan.price, planId: plan.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || "Failed to create payment order")
      }

      const orderData = await response.json()
      const { orderId } = orderData

      if (!orderId) {
        throw new Error("No Order ID received from Razorpay server")
      }

      if (!(window as any).Razorpay) {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        document.body.appendChild(script)
        await new Promise((resolve) => (script.onload = resolve))
      }

      const options = {
        key: razorpayKeyId,
        amount: plan.price * 100,
        currency: "INR",
        name: "CloudVault",
        description: `${plan.name} Plan - ${plan.storage}GB`,
        order_id: orderId,
        handler: async (response: any) => {
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              planId: selectedPlan,
              uid: userData?.uid,
            }),
          })

          const verifyData = await verifyResponse.json()

          if (verifyResponse.ok && verifyData.success) {
            await recordPaymentSuccess(selectedPlan, {
              orderId: orderData.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            })

            toast({
              title: "Payment successful!",
              description: `You've been upgraded to ${plan.name} plan.`,
            })

            // Force reload to update UI and user state
            // UI update is handled by recordPaymentSuccess via AuthContext state
            // No reload needed provides better UX

            onSuccess()
          } else {
            toast({
              title: "Payment verification failed",
              description: verifyData.error || "Please contact support.",
              variant: "destructive",
            })
          }
        },
        prefill: {
          email: userData.email,
          name: userData.displayName,
        },
        theme: {
          color: "#3b82f6",
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error: any) {
      console.error("Payment error:", error)
      toast({
        title: "Payment gateway error",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-3xl w-full relative max-h-[90vh] overflow-y-auto shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-foreground/60 hover:text-foreground">
          <X size={24} />
        </button>

        {showAllPlans ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Plan</h2>
              <p className="text-foreground/70">Select the perfect plan for your storage needs</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {Object.entries(UNIVERSAL_PLANS).map(([key, planOption]) => (
                <div
                  key={key}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${selectedPlan === key
                    ? "border-primary bg-primary/5"
                    : userData?.plan === key
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-primary/50"
                    }`}
                  onClick={() => setSelectedPlan(key)}
                >
                  {userData?.plan === key && (
                    <div className="flex items-center gap-1 text-accent text-xs font-semibold mb-3">
                      <Check size={14} />
                      Current Plan
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-foreground mb-2 capitalize">{planOption.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-4">₹{planOption.price}</div>
                  <div className="space-y-2 text-sm text-foreground/70">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-primary" />
                      <span>{planOption.storage}GB Storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-primary" />
                      <span>File Upload \u0026 Download</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-primary" />
                      <span>Share via Links</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-primary" />
                      <span>{planOption.bgRemovalLimit === 999999 ? "Unlimited" : planOption.bgRemovalLimit} BG Removals</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !razorpayKeyId || !selectedPlan || userData?.plan === selectedPlan}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : userData?.plan === selectedPlan ? (
                "Current Plan"
              ) : (
                <>
                  <CreditCard size={18} />
                  Upgrade to {UNIVERSAL_PLANS[selectedPlan]?.name}
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Upgrade to {plan?.name}</h2>
              <p className="text-foreground/70">Get {plan?.storage}GB of cloud storage</p>
            </div>

            <div className="bg-muted/30 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-foreground/70">Plan</span>
                <span className="font-semibold text-foreground">{plan?.name}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-foreground/70">Storage</span>
                <span className="font-semibold text-foreground">{plan?.storage}GB</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-foreground/70">BG Removals</span>
                <span className="font-semibold text-foreground">
                  {plan?.bgRemovalLimit === 999999 ? "Unlimited" : plan?.bgRemovalLimit}/mo
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="text-foreground/70">Total</span>
                <span className="text-2xl font-bold text-primary">₹{plan?.price}/month</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !razorpayKeyId}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Pay ₹{plan?.price.toFixed(2)}
                </>
              )}
            </button>
          </>
        )}

        <p className="text-xs text-center text-foreground/60 mt-4">
          Secure payment powered by Razorpay. Test mode enabled.
        </p>
      </div>
    </div>
  )
}
