"use client"

import { Cloud, Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t border-border py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Aero Cloud</span>
            </div>
            <p className="text-foreground/70">
              Secure cloud storage for everyone. Store, sync, and share with confidence.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <div className="space-y-3 text-foreground/70">
              <a href="#" className="block hover:text-foreground transition">
                Features
              </a>
              <a href="#" className="block hover:text-foreground transition">
                Pricing
              </a>
              <a href="#" className="block hover:text-foreground transition">
                Security
              </a>
              <a href="#" className="block hover:text-foreground transition">
                Apps
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <div className="space-y-3 text-foreground/70">
              <a href="#" className="block hover:text-foreground transition">
                About
              </a>
              <a href="#" className="block hover:text-foreground transition">
                Blog
              </a>
              <a href="#" className="block hover:text-foreground transition">
                Careers
              </a>
              <a href="#" className="block hover:text-foreground transition">
                Contact
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground/70">
                <Mail size={18} />
                <a href="mailto:support@aerocloud.com" className="hover:text-foreground transition">
                  support@aerocloud.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-foreground/70">
                <Phone size={18} />
                <a href="tel:+1234567890" className="hover:text-foreground transition">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-2 text-foreground/70">
                <MapPin size={18} />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-foreground/70 text-sm">
          <p>&copy; {currentYear} Aero Cloud. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground transition">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
