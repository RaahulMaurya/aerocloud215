import { Cloud, Mail, MessageSquare, Clock, FileText, Eye } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Support - Aero Cloud",
  description: "Get help and support from our team",
}

export default function SupportPage() {
  const supportEmail = "sagarmiishra8169@gmail.com"
  const faqItems = [
    {
      question: "How do I upload files to Aero Cloud?",
      answer:
        "Click the Upload button in the dashboard header or drag and drop files directly into the main area. You can upload multiple files at once.",
    },
    {
      question: "What is the maximum file size I can upload?",
      answer: "Each file can be up to your storage plan limit. Standard plans include 50GB of total storage.",
    },
    {
      question: "Can I share files with others?",
      answer:
        "Yes! Use the Share option to create shareable links. You can customize access permissions and expiration dates.",
    },
    {
      question: "How do I recover a deleted file?",
      answer:
        "Check your Activity Log to see when files were deleted. Contact support if you need help recovering files within 30 days of deletion.",
    },
    {
      question: "Is my data secure?",
      answer:
        "We use industry-standard encryption and Firebase's secure infrastructure to protect your files. All data is encrypted both in transit and at rest.",
    },
    {
      question: "How do I upgrade my plan?",
      answer:
        "Visit your account settings and select a higher storage tier. Your upgrade will be effective immediately.",
    },
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email. We typically respond within 24 hours.",
      action: `mailto:${supportEmail}`,
      label: supportEmail,
    },
    {
      icon: Clock,
      title: "Response Time",
      description: "Our support team is available to help during business hours.",
      action: "#",
      label: "24-48 hours typical response",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Aero Cloud</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-transparent py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            How can we help?
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-balance">
            Find answers to common questions or reach out to our support team. We're here to help you get the most out of Aero Cloud.
          </p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {contactMethods.map((method, index) => {
            const Icon = method.icon
            return (
              <div
                key={index}
                className="bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{method.title}</h3>
                <p className="text-foreground/70 mb-6">{method.description}</p>
                {method.action === "mailto:" + supportEmail ? (
                  <a
                    href={method.action}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
                  >
                    <Mail size={18} />
                    {method.label}
                  </a>
                ) : (
                  <div className="text-sm text-foreground/60 font-medium">{method.label}</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4 mb-20">
          <Link
            href="/privacy"
            className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-xl hover:border-primary/50 hover:bg-muted/50 transition"
          >
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Privacy Policy</span>
          </Link>
          <Link
            href="/terms"
            className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-xl hover:border-primary/50 hover:bg-muted/50 transition"
          >
            <Eye className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Terms of Service</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-xl hover:border-primary/50 hover:bg-muted/50 transition"
          >
            <Cloud className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Back to Dashboard</span>
          </Link>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">Frequently Asked Questions</h2>
          <p className="text-foreground/60 mb-12">
            Find answers to common questions about Aero Cloud and how to use our platform.
          </p>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details
                key={index}
                className="group bg-card border border-border/50 rounded-xl p-6 hover:border-primary/50 transition cursor-pointer"
              >
                <summary className="flex items-start justify-between font-semibold text-foreground leading-relaxed select-none">
                  <span>{item.question}</span>
                  <span className="ml-4 flex-shrink-0 transition group-open:rotate-180">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="text-foreground/70 mt-4 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
              Still need help?
            </h2>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto text-balance">
              Reach out to our support team and we'll be happy to assist you.
            </p>
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              <Mail size={20} />
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-card border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-foreground/60">
            <p>For inquiries, please email us at:</p>
            <a href={`mailto:${supportEmail}`} className="font-semibold text-primary hover:underline">
              {supportEmail}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
