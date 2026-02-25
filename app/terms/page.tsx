import { Cloud } from "lucide-react"
import Link from "next/link"

export default function TermsOfService() {
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
        <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
        <p className="text-foreground/60 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground/80">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Aero Cloud, you accept and agree to be bound by the terms and provisions of this
              agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">2. Use of Service</h2>
            <p>You agree to use Aero Cloud only for lawful purposes. You are prohibited from:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uploading malicious files or content</li>
              <li>Violating any applicable laws or regulations</li>
              <li>Infringing on intellectual property rights</li>
              <li>Attempting to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">3. Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities
              that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">4. Storage and Content</h2>
            <p>
              You retain all rights to the content you upload to Aero Cloud. By uploading content, you grant us the
              right to store and display your content as necessary to provide the service.
            </p>
            <p className="mt-2">
              We reserve the right to remove content that violates these terms or is deemed inappropriate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">5. Subscription and Payments</h2>
            <p>
              Aero Cloud offers both free and paid subscription plans. Paid subscriptions are billed monthly and can be
              canceled at any time. Refunds are provided in accordance with our refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">6. Limitation of Liability</h2>
            <p>
              Aero Cloud is provided "as is" without warranties of any kind. We are not liable for any damages arising
              from your use of the service, including but not limited to data loss, service interruptions, or security
              breaches.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">7. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time for violations of these terms. Upon
              termination, your right to use the service will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">8. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. We will notify you of any changes by posting the new terms on this
              page. Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">9. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:support@aerocloud.com" className="text-primary hover:underline">
                support@aerocloud.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
