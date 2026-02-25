"use client"

import { useState, useEffect } from "react"
import { CURRENCIES, type Currency, getCurrencyFromLocalStorage, setCurrencyToLocalStorage } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: Currency) => void
}

export function CurrencySelector({ onCurrencyChange }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("INR")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = getCurrencyFromLocalStorage()
    setSelectedCurrency(stored)
  }, [])

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency)
    setCurrencyToLocalStorage(currency)
    setIsOpen(false)
    onCurrencyChange?.(currency)
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="bg-transparent" disabled>
        Loading...
      </Button>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="bg-transparent flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {CURRENCIES[selectedCurrency].symbol} {selectedCurrency}
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg z-50 w-48">
          {Object.entries(CURRENCIES).map(([code, config]) => (
            <button
              key={code}
              onClick={() => handleCurrencyChange(code as Currency)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition flex items-center justify-between ${
                selectedCurrency === code ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
              }`}
            >
              <div>
                <div className="font-medium">{code}</div>
                <div className="text-xs opacity-60">{config.name}</div>
              </div>
              <span className="text-lg">{config.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
