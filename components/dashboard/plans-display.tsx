'use client'

import { Crown, Check, X, Zap } from 'lucide-react'
import { UNIVERSAL_PLANS } from '@/lib/razorpay'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { PaymentModal } from './payment-modal'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export function PlansDisplay() {
  const { userData, downgradeToFree } = useAuth()
  const currentPlan = userData?.subscriptionPlan || 'free'
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [isDowngrading, setIsDowngrading] = useState(false)
  const { toast } = useToast()

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Get started with cloud storage',
      highlight: false,
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 49,
      period: 'monthly',
      description: 'For individuals & small teams',
      highlight: false,
    },
    {
      id: 'lite',
      name: 'Lite',
      price: 89,
      period: 'monthly',
      description: 'For moderate storage needs',
      highlight: false,
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 189,
      period: 'monthly',
      description: 'For growing teams',
      highlight: true,
    },
    {
      id: 'plus',
      name: 'Plus',
      price: 299,
      period: 'monthly',
      description: 'Advanced storage capacity',
      highlight: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 499,
      period: 'monthly',
      description: 'For large organizations',
      highlight: false,
    },
    {
      id: 'premium_plus',
      name: 'Premium Plus',
      price: 11990,
      period: 'monthly',
      description: 'Ultimate storage power',
      highlight: false,
    },
  ]

  const features = [
    { name: 'Cloud Storage', key: 'storage' },
    { name: 'File to URL Links/month', key: 'links' },
    { name: 'Bandwidth/month', key: 'bandwidth' },
    { name: 'Link Expiry', key: 'expirationDays' },
    { name: 'Personal Vault', key: 'vault' },
    { name: 'File to URL Feature', key: 'fileToURL' },

    { name: 'AI Chatbot', key: 'chatbot' },
    { name: 'Background Removals', key: 'bgRemovalLimit' },
  ]

  const formatValue = (key: string, value: any) => {
    if (typeof value === 'boolean') {
      return value ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-red-400" />
    }
    if (key === 'storage') return `${value} GB`
    if (key === 'bandwidth') return value === 999999 ? 'Unlimited' : `${value} GB`
    if (key === 'bandwidth') return value === 999999 ? 'Unlimited' : `${value} GB`
    if (key === 'links') return value === 999999 ? 'Unlimited' : value
    if (key === 'bgRemovalLimit') return value === 999999 ? 'Unlimited' : `${value}/mo`
    if (key === 'expirationDays') {
      if (value === 0) return 'Never ✨'
      if (value === 2) return '2 days'
      if (value === 30) return '30 days'
      if (value === 365) return '365 days'
      return `${value} days`
    }
    return value
  }

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Unified Pricing Plans</h2>
          <p className="text-lg text-foreground/60">All features, all plans, one simple choice</p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const planData = UNIVERSAL_PLANS[plan.id as keyof typeof UNIVERSAL_PLANS]
            const isCurrentPlan = currentPlan === plan.id
            const isNotPaid = plan.id === 'free' && currentPlan !== 'free'

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border transition-all ${plan.highlight
                  ? 'border-primary bg-gradient-to-br from-primary/10 to-accent/10 shadow-2xl scale-105'
                  : 'border-border/50 bg-card hover:border-primary/50'
                  } ${isCurrentPlan ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
              >
                {/* Highlight Badge */}
                {false && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-500/20 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Current Plan
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-6">
                  {/* Plan Name */}
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                      {plan.name}
                      {plan.id === 'premium' && <Crown className="w-5 h-5 text-yellow-500" />}
                    </h3>
                    <p className="text-sm text-foreground/60">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="text-4xl font-bold text-foreground">
                      {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                    </div>
                    {plan.price > 0 && <p className="text-sm text-foreground/60">/{plan.period}</p>}
                    {plan.period === 'forever' && plan.price === 0 && (
                      <p className="text-sm text-foreground/60">always free</p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    disabled={isCurrentPlan || (plan.id === 'free' && isDowngrading)}
                    onClick={async () => {
                      if (plan.id === 'free') {
                        if (!confirm("Are you sure you want to switch to the Free plan? Your storage limit will be reduced to 5GB.")) return

                        try {
                          setIsDowngrading(true)
                          await downgradeToFree()
                          toast({
                            title: "Plan Updated",
                            description: "You have been switched to the Free plan.",
                          })
                        } catch (error: any) {
                          toast({
                            title: "Cannot Downgrade",
                            description: error.message,
                            variant: "destructive"
                          })
                        } finally {
                          setIsDowngrading(false)
                        }
                        return
                      }

                      if (!isCurrentPlan && plan.id !== 'free') {
                        setSelectedPlanId(plan.id)
                        setShowPaymentModal(true)
                      }
                    }}
                    className={`w-full ${isCurrentPlan
                      ? 'bg-muted text-foreground/70 cursor-not-allowed'
                      : plan.highlight
                        ? 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg'
                        : ''
                      }`}
                  >
                    {isCurrentPlan ? 'Current Plan' : plan.id === 'free' ? (isDowngrading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Switch to Free') : 'Upgrade'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Features Comparison Table */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr key={feature.key} className={`border-b border-border/50 ${idx % 2 === 0 ? 'bg-background/50' : ''}`}>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{feature.name}</td>
                    {plans.map((plan) => {
                      const planData = UNIVERSAL_PLANS[plan.id as keyof typeof UNIVERSAL_PLANS]
                      const value = planData[feature.key as keyof typeof planData]
                      return (
                        <td key={`${plan.id}-${feature.key}`} className="px-6 py-4 text-center text-sm">
                          {formatValue(feature.key, value)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-foreground/60 mb-4">Need help choosing a plan?</p>
          <a href="/support" className="text-primary hover:text-primary/80 font-medium transition">
            Contact our support team →
          </a>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          planId={selectedPlanId}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false)
            // Instantly updated via AuthContext
          }}
        />
      )}
    </div>
  )
}
