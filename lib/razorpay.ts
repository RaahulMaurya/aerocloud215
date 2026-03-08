// Razorpay configuration and utilities

export interface UniversalPlan {
  id: string
  name: string
  price: number // in INR
  period: string

  // Cloud Storage
  storage: number // in GB

  // File to URL
  links: number // max links per month
  bgRemovalLimit: number // max images processed per month
  bandwidth: number // GB per month
  expirationDays: number // 0 means never expires

  // Features
  chatbot: boolean
  vault: boolean
  fileToURL: boolean
}

// Universal Plans - Unified across all features
export const UNIVERSAL_PLANS: Record<string, UniversalPlan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    storage: 5,
    links: 5,
    bgRemovalLimit: 5,
    bandwidth: 1,
    expirationDays: 2,
    chatbot: true, // Chatbot accessible in all plans
    vault: false,
    fileToURL: false,
  },
  basic: {
    id: "basic",
    name: "Basic",
    price: 49,
    period: "monthly",
    storage: 50,
    links: 50,
    bgRemovalLimit: 50,
    bandwidth: 10,
    expirationDays: 30,
    chatbot: true,
    vault: true,
    fileToURL: true,
  },
  lite: {
    id: "lite",
    name: "Lite",
    price: 89,
    period: "monthly",
    storage: 100,
    links: 100,
    bgRemovalLimit: 100,
    bandwidth: 20,
    expirationDays: 60,
    chatbot: true,
    vault: true,
    fileToURL: true,
  },
  standard: {
    id: "standard",
    name: "Standard",
    price: 189,
    period: "monthly",
    storage: 200,
    links: 200,
    bgRemovalLimit: 200,
    bandwidth: 50,
    expirationDays: 180,
    chatbot: true,
    vault: true,
    fileToURL: true,
  },
  plus: {
    id: "plus",
    name: "Plus",
    price: 299,
    period: "monthly",
    storage: 1024, // 1TB
    links: 500,
    bgRemovalLimit: 500,
    bandwidth: 100,
    expirationDays: 365,
    chatbot: true,
    vault: true,
    fileToURL: true,
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 499,
    period: "monthly",
    storage: 2048, // 2TB
    links: 1000,
    bgRemovalLimit: 1000,
    bandwidth: 200,
    expirationDays: 365,
    chatbot: true,
    vault: true,
    fileToURL: true,
  },
  premium_plus: {
    id: "premium_plus",
    name: "Premium Plus",
    price: 11990,
    period: "monthly",
    storage: 30720, // 30TB
    links: 999999, // Unlimited
    bgRemovalLimit: 999999, // Unlimited
    bandwidth: 999999, // Unlimited
    expirationDays: 0, // Never expires
    chatbot: true,
    vault: true,
    fileToURL: true,
  },
}

// Legacy plans (for backwards compatibility during migration)
export interface Plan {
  id: string
  name: string
  storage: number // in GB
  price: number // in USD
  period: string
}

export interface FileToURLPlan {
  id: string
  name: string
  price: number // in USD
  period: string
  expirationDays: number // 0 means never expires
  links: number // max links per month
  bandwidth: number // GB per month
  priority: boolean
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Free",
    storage: 5,
    price: 0,
    period: "forever",
  },
  basic: {
    id: "basic",
    name: "Basic",
    storage: 50,
    price: 49,
    period: "monthly",
  },
  lite: {
    id: "lite",
    name: "Lite",
    storage: 100,
    price: 89,
    period: "monthly",
  },
  standard: {
    id: "standard",
    name: "Standard",
    storage: 200,
    price: 189,
    period: "monthly",
  },
  plus: {
    id: "plus",
    name: "Plus",
    storage: 1024,
    price: 299,
    period: "monthly",
  },
  premium: {
    id: "premium",
    name: "Premium",
    storage: 2048,
    price: 499,
    period: "monthly",
  },
  premium_plus: {
    id: "premium_plus",
    name: "Premium Plus",
    storage: 30720,
    price: 11990,
    period: "monthly",
  },
}

export const FILE_TO_URL_PLANS: Record<string, FileToURLPlan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    expirationDays: 2,
    links: 5,
    bandwidth: 1,
    priority: false,
  },
  basic: {
    id: "basic",
    name: "Basic",
    price: 49,
    period: "monthly",
    expirationDays: 30,
    links: 50,
    bandwidth: 10,
    priority: false,
  },
  lite: {
    id: "lite",
    name: "Lite",
    price: 89,
    period: "monthly",
    expirationDays: 60,
    links: 100,
    bandwidth: 20,
    priority: false,
  },
  standard: {
    id: "standard",
    name: "Standard",
    price: 189,
    period: "monthly",
    expirationDays: 180,
    links: 200,
    bandwidth: 50,
    priority: false,
  },
  plus: {
    id: "plus",
    name: "Plus",
    price: 299,
    period: "monthly",
    expirationDays: 365,
    links: 500,
    bandwidth: 100,
    priority: true,
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 499,
    period: "monthly",
    expirationDays: 365,
    links: 1000,
    bandwidth: 200,
    priority: true,
  },
  premium_plus: {
    id: "premium_plus",
    name: "Premium Plus",
    price: 11990,
    period: "monthly",
    expirationDays: 0,
    links: 999999,
    bandwidth: 999999,
    priority: true,
  },
}

// Helper function to calculate storage usage percentage
export function calculateStoragePercentage(used: number, total: number): number {
  return Math.round((used / total) * 100)
}

// Helper function to format bytes to GB
export function bytesToGB(bytes: number): number {
  return Number((bytes / (1024 * 1024 * 1024)).toFixed(2))
}

// Helper function to check if user can upload based on storage
export function canUpload(currentUsageGB: number, fileSizeBytes: number, planStorageGB: number): boolean {
  const fileSizeGB = bytesToGB(fileSizeBytes)
  return currentUsageGB + fileSizeGB <= planStorageGB
}

// Get plan by ID from universal plans
export function getPlanById(planId: string): UniversalPlan | null {
  return UNIVERSAL_PLANS[planId] || null
}

// Get user's plan from subscription plan string
export function getUserPlan(subscriptionPlan: string | undefined): UniversalPlan {
  return UNIVERSAL_PLANS[subscriptionPlan || "free"] || UNIVERSAL_PLANS.free
}

// Server-only function to get Razorpay config
export function getRazorpayConfig() {
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_SECRET

  if (!key_id || !key_secret) {
    console.warn("WARNING: Razorpay keys are missing in environment variables. Using placeholder keys which may cause 401 errors.")
  }

  // Using server-side env vars (not prefixed with NEXT_PUBLIC)
  return {
    key_id: key_id || "rzp_test_RoR3OCkJF6aJL6",
    key_secret: key_secret || "bO4RxqhdizMlf1EPkRNHgvyH",
  }
}
