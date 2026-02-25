"use client"

import { Smartphone, Download, QrCode, Apple, Lock } from "lucide-react"

export function MobileAppPromo() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Get Aero Cloud on Your Mobile</h2>
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
            Access your files anywhere, anytime with our mobile apps for iOS and Android
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* App Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-2">Access Files On-the-Go</h3>
                <p className="text-foreground/60">
                  View, upload, and manage your files from anywhere with our mobile apps
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-2">Secure & Private</h3>
                <p className="text-foreground/60">
                  End-to-end encryption and secure PIN-protected Secret Vault on mobile
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-2">Offline Access</h3>
                <p className="text-foreground/60">Download files for offline access and automatic sync when online</p>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="flex items-center justify-center gap-3 px-6 py-3 bg-foreground text-background rounded-xl font-semibold hover:bg-foreground/90 transition">
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-xs">Download on the</p>
                  <p className="text-sm font-bold">App Store</p>
                </div>
              </button>

              <button className="flex items-center justify-center gap-3 px-6 py-3 bg-foreground text-background rounded-xl font-semibold hover:bg-foreground/90 transition">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 0 1-.069-.082c-.033-.042-.062-.088-.088-.136-.017-.032-.032-.065-.045-.099-.013-.033-.024-.068-.034-.103-.009-.034-.017-.069-.023-.105-.006-.034-.01-.069-.012-.104v-.001C3.334 21.446 3.333 21.328 3.333 21.21V2.79c0-.117.001-.235.005-.352.002-.035.006-.07.012-.104.006-.036.014-.071.023-.105.01-.035.021-.07.034-.103.013-.034.028-.067.045-.099.026-.048.055-.094.088-.136.023-.028.047-.055.069-.082zM13.792 12L3.609 1.814l10.183 10.186z" />
                  <path d="M20.755 9.886l-3.073-1.771-3.89 3.885 3.89 3.885 3.073-1.771c.618-.355 1.007-.872 1.007-1.564s-.389-1.21-1.007-1.564z" />
                </svg>
                <div className="text-left">
                  <p className="text-xs">GET IT ON</p>
                  <p className="text-sm font-bold">Google Play</p>
                </div>
              </button>
            </div>
          </div>

          {/* QR Codes */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <QrCode className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Scan to Download</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* iOS QR */}
              <div className="text-center space-y-3">
                <div className="bg-white p-4 rounded-xl inline-block">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-primary" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">iOS App</p>
              </div>

              {/* Android QR */}
              <div className="text-center space-y-3">
                <div className="bg-white p-4 rounded-xl inline-block">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-primary" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">Android App</p>
              </div>
            </div>

            <p className="text-xs text-foreground/60 text-center mt-6">
              Scan with your phone's camera to download the app
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
