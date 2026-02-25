"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Pricing } from "@/components/pricing"
import { Security } from "@/components/security"
import { Stats } from "@/components/stats"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"

export default function Home() {
  const [isPricingMonthly, setIsPricingMonthly] = useState(true)

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <Stats />
      <Pricing isPricingMonthly={isPricingMonthly} setIsPricingMonthly={setIsPricingMonthly} />
      <Security />
      <FAQ />
      <Footer />
    </main>
  )
}
