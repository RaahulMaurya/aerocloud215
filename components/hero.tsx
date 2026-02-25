"use client"

import { ArrowRight, Cloud, Shield, Zap, Upload, Lock, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function Hero() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse-glow"></div>
        <div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-accent/30 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className={`space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary backdrop-blur-sm animate-slide-up">
              <Sparkles size={16} className="animate-pulse" />
              Trusted by 10,000+ users worldwide
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h1 className="text-5xl md:text-6xl lg:text-5xl font-bold text-balance text-foreground leading-tight mb-6">
                Your Files,{" "}
                <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400 bg-clip-text text-transparent font-extrabold drop-shadow-sm">
  Secure & Accessible
</span>

                </span>
              </h1>
              <p className="text-xl md:text-2xl text-foreground/70 text-balance leading-relaxed">
                Enterprise-grade cloud storage with military-level encryption. Store, sync, and share your files
                securely from anywhere, anytime.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <button
                onClick={() => router.push("/auth")}
                className="relative px-8 py-4 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] text-primary-foreground rounded-xl font-semibold hover:shadow-2xl transition-all flex items-center justify-center gap-2 group transform hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10">Start Free - Get 5GB</span>
                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition" />
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <button
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                }}
                className="px-8 py-4 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/10 transition-all backdrop-blur-sm"
              >
                Learn More
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 animate-slide-up" style={{ animationDelay: "0.6s" }}>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:scale-105">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AES-256</p>
                  <p className="text-xs text-foreground/60">Encrypted</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-accent/50 transition-all hover:scale-105">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">99.9%</p>
                  <p className="text-xs text-foreground/60">Uptime</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-secondary/50 transition-all hover:scale-105">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">GDPR</p>
                  <p className="text-xs text-foreground/60">Compliant</p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`hidden lg:block relative transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          >
            {/* Floating cloud animation with upload icon */}
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center animate-float backdrop-blur-sm">
                <Upload className="w-10 h-10 text-primary" />
              </div>

              <div
                className="absolute -bottom-10 -right-10 w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center animate-float backdrop-blur-sm"
                style={{ animationDelay: "0.5s" }}
              >
                <Shield className="w-8 h-8 text-accent" />
              </div>

              {/* Main animated illustration - cloud with files */}
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl border border-border/50 shadow-2xl">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <Cloud size={200} className="text-primary/80 animate-float" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-accent/30 rounded-full animate-pulse-glow"></div>
                    </div>
                  </div>

                  {/* Animated file upload visualization */}
                  <div className="w-full space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-background/80 rounded-lg backdrop-blur-sm border border-border animate-slide-up">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-primary animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-shimmer bg-[length:200%_100%]"
                            style={{ width: "75%" }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-3 p-3 bg-background/80 rounded-lg backdrop-blur-sm border border-border animate-slide-up"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">End-to-end encrypted</p>
                        <p className="text-xs text-muted-foreground">Your files are secure</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center p-2">
          <div className="w-1.5 h-3 bg-primary/50 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
