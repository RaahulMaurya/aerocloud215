import { Cloud } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Aero Cloud</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
        <p className="text-foreground/60 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground/80">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create an account, upload files, or use our
              services. This includes your name, email address, and files you store on our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">3. Data Security</h2>
            <p>
              We use Firebase Authentication and Storage to secure your data. All files are stored securely with
              industry-standard encryption. We implement appropriate security measures to protect your personal
              information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">4. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information
              only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@aerocloud.com" className="text-primary hover:underline">
                privacy@aerocloud.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
