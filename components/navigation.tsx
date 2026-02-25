"use client"

import { Cloud, Menu, X } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground hidden sm:inline font-[family-name:var(--font-comfortaa)] lowercase tracking-tight">aerocloud</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/80 hover:text-foreground transition">
              Features
            </a>
            <a href="#pricing" className="text-foreground/80 hover:text-foreground transition">
              Pricing
            </a>
            <a href="#security" className="text-foreground/80 hover:text-foreground transition">
              Security
            </a>
            <a href="/privacy" className="text-foreground/80 hover:text-foreground transition">
              Privacy
            </a>
            <a href="/terms" className="text-foreground/80 hover:text-foreground transition">
              Terms
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => router.push("/auth")}
              className="px-4 py-2 text-primary hover:bg-muted rounded-lg transition"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/auth")}
              className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition"
            >
              Get Started Free
            </button>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <a href="#features" className="block text-foreground/80 hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="block text-foreground/80 hover:text-foreground">
              Pricing
            </a>
            <a href="#security" className="block text-foreground/80 hover:text-foreground">
              Security
            </a>
            <a href="/privacy" className="block text-foreground/80 hover:text-foreground">
              Privacy
            </a>
            <a href="/terms" className="block text-foreground/80 hover:text-foreground">
              Terms
            </a>
            <button
              onClick={() => router.push("/auth")}
              className="w-full px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold"
            >
              Get Started Free
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
