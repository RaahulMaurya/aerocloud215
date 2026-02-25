"use client"

import { Check, Crown, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { UNIVERSAL_PLANS } from "@/lib/razorpay"

interface PricingProps {
  isPricingMonthly: boolean
  setIsPricingMonthly: (value: boolean) => void
}

export function Pricing({ isPricingMonthly, setIsPricingMonthly }: PricingProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState("USD") // Declare selectedCurrency
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null) // Declare hoveredPlan

  useEffect(() => {
    setMounted(true)
  }, [])

  const plans = [
    UNIVERSAL_PLANS.free,
    UNIVERSAL_PLANS.starter,
    UNIVERSAL_PLANS.pro,
    UNIVERSAL_PLANS.enterprise,
  ]

  const getPrice = (priceKey: string) => {
    // Placeholder function to get price based on priceKey and currency
    return `$10`
  }

  if (!mounted) {
    return null
  }

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Simple, Transparent Pricing</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
            Choose the perfect plan for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {mounted && plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl transition-all duration-300 overflow-hidden h-full ${(plan.id === "enterprise")
                  ? "lg:col-span-1 lg:row-span-2 lg:scale-105 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary shadow-xl"
                  : "bg-card border border-border hover:border-primary/50 hover:shadow-lg"
                }`}
            >
              {(plan.id === "enterprise") && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                    <Crown size={12} />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6 sm:p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-foreground capitalize mb-2">{plan.name}</h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      {plan.id === "free" && "Perfect for getting started"}
                      {plan.id === "starter" && "For individuals & small teams"}
                      {plan.id === "pro" && "For growing teams"}
                      {plan.id === "enterprise" && "For large organizations"}
                    </p>
                  </div>

                  <div className="mb-8 py-4 border-y border-border/30">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.price && typeof plan.price === 'number' ? `₹${plan.price}` : '₹0'}
                      </span>
                      {(plan.price && plan.price > 0) && <span className="text-foreground/70 text-sm">/{plan.period}</span>}
                    </div>
                    <p className="text-primary font-semibold">{plan.storage}GB Storage</p>
                  </div>

                  <div className="space-y-3 text-sm mb-8">
                    <div className="flex items-start gap-3">
                      <Check size={16} className="text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{plan.links === 999999 ? "Unlimited" : plan.links} links/mo</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check size={16} className="text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{plan.bandwidth === 999999 ? "Unlimited" : `${plan.bandwidth}GB`} bandwidth</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check size={16} className="text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{plan.expirationDays === 0 ? "Never" : `${plan.expirationDays}d`} expiry</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check size={16} className="text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">
                        {plan.bgRemovalLimit === 999999 ? "Unlimited" : plan.bgRemovalLimit} bg removals/mo
                      </span>
                    </div>
                    {plan.vault && (
                      <div className="flex items-start gap-3 pt-3 border-t border-border/30">
                        <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">Personal Vault</span>
                      </div>
                    )}
                    {plan.chatbot && (
                      <div className="flex items-start gap-3">
                        <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">AI Chatbot</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => router.push("/pricing")}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${(plan.id === "enterprise")
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg"
                      : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                >
                  {plan.id === "free" ? "Get Started" : "Upgrade Now"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push("/pricing")}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
          >
            View All Plans & Pricing Details
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}
