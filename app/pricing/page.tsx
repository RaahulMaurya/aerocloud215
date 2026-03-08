"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Crown, Zap, Shield, Lock, ArrowRight } from "lucide-react"
import { UNIVERSAL_PLANS } from "@/lib/razorpay"
import { PaymentModal } from "@/components/dashboard/payment-modal"
import { useAuth } from "@/contexts/auth-context"

export default function PricingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [hoveredPlan, setHoveredPlan] = useState<string | null>("premium")
  const [mounted, setMounted] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const planOrder = ["free", "basic", "lite", "standard", "plus", "premium", "premium_plus"]
  const plans = planOrder.map(planId => ({
    ...UNIVERSAL_PLANS[planId as keyof typeof UNIVERSAL_PLANS],
    id: planId,
  }))

  const features = [
    { name: "Cloud Storage", key: "storage" },
    { name: "Links per Month", key: "links" },
    { name: "Bandwidth/Month", key: "bandwidth" },
    { name: "Link Expiration", key: "expiration" },
    { name: "Personal Vault", key: "vault" },
    { name: "AI Chatbot", key: "chatbot" },
    { name: "Background Removals", key: "bgRemovalLimit" },
    { name: "File to URL", key: "fileToURL" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-xl font-bold text-foreground">
            CloudVault
          </button>
          <button
            onClick={() => router.push("/auth")}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-24 pb-12 px-4 text-center">
        <div className="mb-4 inline-block">
          <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
            Simple, Transparent Pricing
          </span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4 text-balance">
          Plans for Every Need
        </h1>
        <p className="text-xl text-foreground/60 max-w-2xl mx-auto text-balance">
          Start free with 5GB. Upgrade anytime to unlock powerful file management features and unlimited potential.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex overflow-x-auto pb-8 gap-6 snap-x -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {mounted && plans.map((plan, index) => (
            <div
              key={plan.id}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan("premium")}
              className={`relative rounded-2xl border-2 transition-all duration-300 min-w-[300px] sm:min-w-[320px] flex-shrink-0 snap-center ${plan.id === "premium"
                ? "border-primary bg-gradient-to-br from-primary/10 to-accent/5 shadow-2xl transform scale-100"
                : hoveredPlan === plan.id
                  ? "border-primary/60 bg-card shadow-lg transform scale-[1.02]"
                  : "border-border bg-card hover:border-primary/40"
                } overflow-hidden`}
              style={{
                animation: mounted && plan.id === "premium"
                  ? `float 3s ease-in-out infinite`
                  : "none"
              }}
            >
              {/* Badge */}
              {plan.id === "premium" && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 rounded-bl-lg text-sm font-bold flex items-center gap-1">
                  <Crown size={16} />
                  Most Popular
                </div>
              )}

              <div className="p-6 sm:p-8">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-foreground capitalize mb-2">
                  {plan.name}
                </h3>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-foreground">₹{plan.price}</span>
                    {plan.price > 0 && (
                      <span className="text-foreground/60 text-lg">/{plan.period}</span>
                    )}
                  </div>
                  {plan.price === 0 && (
                    <p className="text-foreground/60 mt-2">Forever free</p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => {
                    if (plan.id === "free") {
                      router.push("/auth")
                    } else {
                      if (!user) {
                        router.push("/auth")
                        return
                      }
                      setSelectedPlanId(plan.id)
                      setShowPaymentModal(true)
                    }
                  }}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 mb-8 flex items-center justify-center gap-2 ${plan.id === "premium"
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:scale-105"
                    : plan.id === "free"
                      ? "bg-muted text-foreground hover:bg-muted/80"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                >
                  {plan.id === "free" ? "Get Started" : "Upgrade Now"}
                  <ArrowRight size={18} />
                </button>

                {/* Features */}
                <div className="space-y-3 border-t border-border pt-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary">
                      {plan.storage >= 1024 ? `${plan.storage / 1024}TB` : `${plan.storage}GB`}
                    </span>
                    <span className="text-foreground/70">Storage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary">{plan.links === 999999 ? "∞" : plan.links}</span>
                    <span className="text-foreground/70">Links/month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary">{plan.bandwidth === 999999 ? "∞" : `${plan.bandwidth}GB`}</span>
                    <span className="text-foreground/70">Bandwidth</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                    <span className="text-foreground/70">
                      {plan.expirationDays === 0 ? "Never expires" : `${plan.expirationDays}-day expiry`}
                    </span>
                  </div>

                  {/* Premium Features */}
                  <div className="pt-4 space-y-2">
                    {plan.vault && (
                      <div className="flex items-center gap-2 text-sm">
                        <Lock size={16} className="text-green-500 flex-shrink-0" />
                        <span className="text-foreground/80">Personal Vault</span>
                      </div>
                    )}
                    {plan.chatbot && (
                      <div className="flex items-center gap-2 text-sm">
                        <Zap size={16} className="text-yellow-500 flex-shrink-0" />
                        <span className="text-foreground/80">AI Chatbot</span>
                      </div>
                    )}
                    {!plan.vault && (
                      <div className="flex items-center gap-2 text-sm">
                        <X size={16} className="text-foreground/30 flex-shrink-0" />
                        <span className="text-foreground/40">Vault Locked</span>
                      </div>
                    )}
                    {!plan.chatbot && plan.price > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <X size={16} className="text-foreground/30 flex-shrink-0" />
                        <span className="text-foreground/40">Chatbot Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
          Detailed Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                {plans.map(plan => (
                  <th key={plan.id} className="text-center py-4 px-4 font-semibold text-foreground capitalize">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map(feature => (
                <tr key={feature.key} className="border-b border-border/50 hover:bg-muted/50 transition">
                  <td className="py-4 px-4 text-foreground/70 font-medium">{feature.name}</td>
                  {plans.map(plan => (
                    <td key={plan.id} className="text-center py-4 px-4">
                      {feature.key === "storage" && (
                        <span className="font-semibold text-foreground">
                          {plan.storage >= 1024 ? `${plan.storage / 1024}TB` : `${plan.storage}GB`}
                        </span>
                      )}
                      {feature.key === "links" && (
                        <span className="font-semibold text-foreground">
                          {plan.links === 999999 ? "Unlimited" : plan.links}
                        </span>
                      )}
                      {feature.key === "bandwidth" && (
                        <span className="font-semibold text-foreground">
                          {plan.bandwidth === 999999 ? "Unlimited" : `${plan.bandwidth}GB`}
                        </span>
                      )}
                      {feature.key === "expiration" && (
                        <span className="font-semibold text-foreground">
                          {plan.expirationDays === 0 ? "Never" : `${plan.expirationDays}d`}
                        </span>
                      )}
                      {feature.key === "vault" && (
                        <div className="flex justify-center">
                          {plan.vault ? (
                            <Check size={20} className="text-green-500" />
                          ) : (
                            <X size={20} className="text-foreground/30" />
                          )}
                        </div>
                      )}
                      {feature.key === "chatbot" && (
                        <div className="flex justify-center">
                          {plan.chatbot ? (
                            <Check size={20} className="text-green-500" />
                          ) : (
                            <X size={20} className="text-foreground/30" />
                          )}
                        </div>
                      )}
                      {feature.key === "fileToURL" && (
                        <div className="flex justify-center">
                          {plan.fileToURL ? (
                            <Check size={20} className="text-green-500" />
                          ) : (
                            <X size={20} className="text-foreground/30" />
                          )}
                        </div>
                      )}
                      {feature.key === "bgRemovalLimit" && (
                        <span className="font-semibold text-foreground">
                          {plan.bgRemovalLimit === 999999 ? "Unlimited" : plan.bgRemovalLimit}/mo
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <details className="group border border-border rounded-lg p-6 hover:border-primary/50 transition">
            <summary className="flex items-center justify-between cursor-pointer font-semibold text-foreground">
              Can I change my plan anytime?
              <span className="text-primary group-open:rotate-180 transition">▼</span>
            </summary>
            <p className="mt-4 text-foreground/70">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </details>

          <details className="group border border-border rounded-lg p-6 hover:border-primary/50 transition">
            <summary className="flex items-center justify-between cursor-pointer font-semibold text-foreground">
              What happens to my files if I downgrade?
              <span className="text-primary group-open:rotate-180 transition">▼</span>
            </summary>
            <p className="mt-4 text-foreground/70">
              Your files remain safe. If you exceed your new plan's storage limit, you'll need to delete files to continue uploading.
            </p>
          </details>

          <details className="group border border-border rounded-lg p-6 hover:border-primary/50 transition">
            <summary className="flex items-center justify-between cursor-pointer font-semibold text-foreground">
              Is there a free trial for paid plans?
              <span className="text-primary group-open:rotate-180 transition">▼</span>
            </summary>
            <p className="mt-4 text-foreground/70">
              Start with our Free plan to explore CloudVault. Upgrade when you need more features and storage.
            </p>
          </details>

          <details className="group border border-border rounded-lg p-6 hover:border-primary/50 transition">
            <summary className="flex items-center justify-between cursor-pointer font-semibold text-foreground">
              What payment methods do you accept?
              <span className="text-primary group-open:rotate-180 transition">▼</span>
            </summary>
            <p className="mt-4 text-foreground/70">
              We accept all major credit cards and digital payment methods through Razorpay. Your data is securely encrypted.
            </p>
          </details>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-primary-foreground/90 mb-8 text-lg">
            Join thousands of users already using CloudVault for secure file management.
          </p>
          <button
            onClick={() => router.push("/auth")}
            className="px-8 py-4 bg-primary-foreground text-primary rounded-lg font-bold hover:shadow-lg transition inline-flex items-center gap-2"
          >
            Start Your Free Account
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          planId={selectedPlanId}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedPlanId("")
          }}
          onSuccess={() => {
            setShowPaymentModal(false)
            setSelectedPlanId("")
            // Instantly updated via AuthContext
          }}
        />
      )}
    </div>
  )
}
