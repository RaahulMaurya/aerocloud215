"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Cloud, ArrowRight, Loader2, Mail, ArrowLeft, X, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function AuthPage() {
  const { signUp, logIn, resetPassword, userData, is2FAVerified, verify2FALogin } = useAuth()
  const { toast } = useToast()
  const [isLogin, setIsLogin] = useState(true)
  const [show2FA, setShow2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const router = useRouter() // Added missing router initialization

  // Logic to redirect only if 2FA satisfied
  React.useEffect(() => {
    if (userData) {
      if (userData.twoFactorEnabled && !is2FAVerified) {
        setShow2FA(true)
      } else {
        router.push("/dashboard")
      }
    }
  }, [userData, is2FAVerified, router])

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault()
    if (verify2FALogin(twoFactorCode)) {
      toast({
        title: "Verified",
        description: "Two-factor authentication verified.",
      })
      router.push("/dashboard")
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid code from your authenticator app.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await logIn(email, password)
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your account.",
        })
      } else {
        await signUp(email, password, name)
        toast({
          title: "Account created!",
          description: "Welcome to Aero Cloud. You have 5GB free storage.",
        })
      }
      // router.push("/dashboard") // Handled by useEffect now
    } catch (error: any) {
      console.error("[v0] Auth error:", error)
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await resetPassword(resetEmail)
      setResetSent(true)
      toast({
        title: "Success!",
        description: "Password reset email sent. Check your inbox.",
      })
      setTimeout(() => {
        setShowForgotPassword(false)
        setResetEmail("")
        setResetSent(false)
      }, 2000)
    } catch (error: any) {
      console.error("[v0] Password reset error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Cloud className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Aero Cloud</span>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-foreground mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p className="text-foreground/70 mb-6">
            {isLogin ? "Sign in to access your cloud storage" : "Join Aero Cloud today and get 5GB free"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-accent transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-accent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-accent transition"
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-sm text-foreground/70">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-foreground/70">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-semibold">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg max-w-md w-full">
            {!resetSent ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="p-1 hover:bg-muted rounded-lg transition"
                  >
                    <X size={20} className="text-foreground/70" />
                  </button>
                </div>
                <p className="text-foreground/70 mb-6">Enter your email address and we'll send you a link to reset your password.</p>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail size={18} />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Check Your Email</h3>
                <p className="text-foreground/70">We've sent a password reset link to {resetEmail}. Click the link in the email to reset your password.</p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* 2FA Modal */}
      {show2FA && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Two-Factor Authentication</h2>
              <p className="text-foreground/70 mt-2">Enter the 6-digit code from your authenticator app.</p>
            </div>

            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-primary transition text-center tracking-[0.5em] text-xl font-mono"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                Verify
              </button>

              <button
                type="button"
                onClick={() => {
                  setShow2FA(false)
                  // Optionally log out
                }}
                className="w-full py-2 text-sm text-foreground/60 hover:text-foreground"
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
