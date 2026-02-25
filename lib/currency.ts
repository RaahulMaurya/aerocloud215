// Currency conversion utilities

export type Currency = "INR" | "USD" | "EUR" | "GBP" | "AUD" | "CAD"

export interface CurrencyConfig {
  code: Currency
  symbol: string
  name: string
  rate: number // Conversion rate from INR
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    rate: 1,
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    rate: 0.012, // 1 INR = 0.012 USD (approximately)
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    rate: 0.011, // 1 INR = 0.011 EUR (approximately)
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    rate: 0.0095, // 1 INR = 0.0095 GBP (approximately)
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    rate: 0.018, // 1 INR = 0.018 AUD (approximately)
  },
  CAD: {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    rate: 0.016, // 1 INR = 0.016 CAD (approximately)
  },
}

export function convertPrice(priceInINR: number, targetCurrency: Currency): number {
  if (targetCurrency === "INR") return priceInINR
  const rate = CURRENCIES[targetCurrency].rate
  return Math.round(priceInINR * rate * 100) / 100
}

export function formatPrice(price: number, currency: Currency): string {
  const config = CURRENCIES[currency]
  
  if (price === 0) {
    return `${config.symbol}0`
  }
  
  // Format with comma separators for thousands
  const formatted = price.toLocaleString("en-US", {
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
  
  return `${config.symbol}${formatted}`
}

export function getCurrencyFromLocalStorage(): Currency {
  if (typeof window === "undefined") return "INR"
  
  const stored = localStorage.getItem("selectedCurrency")
  if (stored && Object.keys(CURRENCIES).includes(stored)) {
    return stored as Currency
  }
  
  return "INR"
}

export function setCurrencyToLocalStorage(currency: Currency): void {
  if (typeof window === "undefined") return
  localStorage.setItem("selectedCurrency", currency)
}
