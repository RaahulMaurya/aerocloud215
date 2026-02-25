"use client"

import { Shield, Key, Eye } from "lucide-react"

export function Security() {
  const securityFeatures = [
    {
      icon: Shield,
      title: "Military-Grade Encryption",
      description:
        "Your files are encrypted with AES-256 encryption, the same technology used by government agencies worldwide.",
    },
    {
      icon: Key,
      title: "Zero-Knowledge Architecture",
      description: "We cannot access your files. Only you hold the encryption keys, ensuring complete privacy.",
    },
    {
      icon: Eye,
      title: "Compliance & Certifications",
      description: "SOC 2 Type II certified, GDPR compliant, and audited by independent security firms.",
    },
  ]

  return (
    <section id="security" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Your Security is Our Priority</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
            Enterprise-grade security to protect what matters most
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {securityFeatures.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div key={i} className="space-y-4 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-16 p-12 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Security Certifications</h3>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">SOC 2</div>
                <p className="text-sm text-foreground/70">Type II</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">GDPR</div>
                <p className="text-sm text-foreground/70">Compliant</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">ISO</div>
                <p className="text-sm text-foreground/70">27001</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
