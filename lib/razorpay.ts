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
    bgRemovalLimit: 5, // 5 images per month
    bandwidth: 1,
    expirationDays: 2,
    chatbot: false,
    vault: false,
    fileToURL: false,
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 299, // ₹299/month
    period: "monthly",
    storage: 50,
    links: 50,
    bgRemovalLimit: 50, // 50 images per month
    bandwidth: 10,
    expirationDays: 30,
    chatbot: false,
    vault: true,
    fileToURL: true,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 699, // ₹699/month
    period: "monthly",
    storage: 200,
    links: 500,
    bgRemovalLimit: 500, // 500 images per month
    bandwidth: 100,
    expirationDays: 365,
    chatbot: true,
    vault: true,
    fileToURL: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 1999, // ₹1999/month
    period: "monthly",
    storage: 1024, // 1TB
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
  starter: {
    id: "starter",
    name: "Starter",
    storage: 50,
    price: 299,
    period: "monthly",
  },
  pro: {
    id: "pro",
    name: "Pro",
    storage: 200,
    price: 699,
    period: "monthly",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    storage: 1024,
    price: 1999,
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
  starter: {
    id: "starter",
    name: "Starter",
    price: 299, // ₹299
    period: "monthly",
    expirationDays: 30,
    links: 50,
    bandwidth: 10,
    priority: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 699, // ₹699
    period: "monthly",
    expirationDays: 365,
    links: 500,
    bandwidth: 100,
    priority: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 1999, // ₹1999
    period: "monthly",
    expirationDays: 0, // Never expires
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
