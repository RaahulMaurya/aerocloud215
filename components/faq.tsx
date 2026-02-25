"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer:
        "Yes, you can change your plan at any time. If you upgrade, you'll have immediate access to the new features. If you downgrade, it will take effect at the start of your next billing cycle.",
    },
    {
      question: "Is my data safe with Aero Cloud?",
      answer:
        "Absolutely. We use military-grade AES-256 encryption for all files. Your data is encrypted before it leaves your device and remains encrypted while stored on our servers. We cannot access your files.",
    },
    {
      question: "Can I share files with people who don't have Aero Cloud?",
      answer:
        "Yes! You can create shareable links for any file or folder. You can set permissions, expiration dates, and password protection for these links.",
    },
    {
      question: "What happens to my data if I cancel my subscription?",
      answer:
        "Your data is safe. You'll have 30 days to download your files or reactivate your subscription. After 30 days, your account will be deleted along with all files.",
    },
    {
      question: "Do you offer business or team plans?",
      answer:
        "Yes! Our Business plan supports team collaboration features including shared folders, team management, and advanced permission controls.",
    },
    {
      question: "How much data can I upload per file?",
      answer:
        "There's no limit on individual file size. However, larger files may take longer to upload depending on your internet connection.",
    },
  ]

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Frequently Asked Questions</h2>
          <p className="text-xl text-foreground/70 text-balance">Find answers to common questions about Aero Cloud</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-lg bg-card overflow-hidden transition">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition text-left"
              >
                <span className="font-semibold text-foreground text-lg">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-foreground/70 flex-shrink-0 transition ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIndex === i && (
                <div className="px-6 pb-6 text-foreground/70 border-t border-border">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
