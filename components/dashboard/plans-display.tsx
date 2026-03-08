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



  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Unified Pricing Plans</h2>
          <p className="text-lg text-foreground/60">All features, all plans, one simple choice</p>
        </div>

        {/* Plans Grid */}
        <div className="flex overflow-x-auto pb-8 gap-6 snap-x -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide mb-12">
          {plans.map((plan) => {
            const planData = UNIVERSAL_PLANS[plan.id as keyof typeof UNIVERSAL_PLANS]
            const isCurrentPlan = currentPlan === plan.id
            const isNotPaid = plan.id === 'free' && currentPlan !== 'free'

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border transition-all min-w-[300px] sm:min-w-[320px] flex-shrink-0 snap-center ${plan.highlight
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
                      {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
                    </div>
                    {plan.price > 0 && <p className="text-sm text-foreground/60">/{plan.period}</p>}
                    {plan.period === 'forever' && plan.price === 0 && (
                      <p className="text-sm text-foreground/60">always free</p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 pt-4 border-t border-border/10">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground/80">
                        {planData.storage >= 1024 ? `${planData.storage / 1024}TB` : `${planData.storage}GB`} Storage
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      {planData.chatbot ? <Check className="w-5 h-5 text-green-500 flex-shrink-0" /> : <X className="w-5 h-5 text-foreground/30 flex-shrink-0" />}
                      <span className={`text-sm font-medium ${planData.chatbot ? 'text-foreground/80' : 'text-foreground/40'}`}>AI Chatbot</span>
                    </div>
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
