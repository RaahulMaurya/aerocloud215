"use client"

import { Lock, Share2, Zap, FileText, Clock, BarChart3 } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export function Features() {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger the card animations
            features.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards((prev) => [...prev, index])
              }, index * 150)
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: Lock,
      title: "Bank-Level Encryption",
      description: "AES-256 encryption protects your files from unauthorized access",
      color: "primary",
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Share files with custom permissions and expiring links",
      color: "accent",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Upload and download speeds optimized for performance",
      color: "secondary",
    },
    {
      icon: FileText,
      title: "File Preview",
      description: "Preview documents, images, and videos without downloading",
      color: "primary",
    },
    {
      icon: Clock,
      title: "Version History",
      description: "Recover previous versions of your files anytime",
      color: "accent",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Track storage usage and monitor file activity",
      color: "secondary",
    },
  ]

  return (
    <section ref={sectionRef} id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Powerful Features</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
            Everything you need for professional cloud storage
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon
            const isVisible = visibleCards.includes(i)
            return (
              <div
                key={i}
                className={`p-8 rounded-xl bg-card border border-border hover:border-accent hover:shadow-2xl transition-all duration-500 group relative overflow-hidden ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-accent/10 transition-all group-hover:scale-110 mb-4">
                    <Icon className="w-6 h-6 text-primary group-hover:text-accent transition" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-foreground/70">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
