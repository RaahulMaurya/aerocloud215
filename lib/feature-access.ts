// Feature Access Control Documentation
// This file documents the robust feature access logic for CloudVault

/**
 * FEATURE ACCESS MATRIX
 * 
 * Free Plan:
 * - Upload Files: ✓ Available
 * - Cloud Storage: 5GB
 * - File to URL: ✗ LOCKED (requires Starter+)
 * - Chatbot: ✗ LOCKED (requires Pro+)
 * - Secret Vault: ✓ Available
 * 
 * Starter Plan (₹299/month):
 * - Upload Files: ✓ Available
 * - Cloud Storage: 50GB
 * - File to URL: ✓ Available (50 links/month)
 * - Chatbot: ✗ LOCKED (requires Pro+)
 * - Secret Vault: ✓ Available
 * 
 * Pro Plan (₹699/month):
 * - Upload Files: ✓ Available
 * - Cloud Storage: 200GB
 * - File to URL: ✓ Available (500 links/month)
 * - Chatbot: ✓ Available
 * - Secret Vault: ✓ Available
 * 
 * Enterprise Plan (₹1999/month):
 * - Upload Files: ✓ Available
 * - Cloud Storage: 1024GB
 * - File to URL: ✓ Available (Unlimited)
 * - Chatbot: ✓ Available
 * - Secret Vault: ✓ Available
 */

/**
 * IMPLEMENTATION DETAILS
 * 
 * File-to-URL Feature Blocking (Starter+ only):
 * 1. Dashboard: File-to-URL tab only shows for non-free users (app/dashboard/page.tsx)
 * 2. Component: Upload disabled with lock screen for free users (file-to-url.tsx)
 * 3. Handler: processFiles() checks isFileToURLAllowed and shows upgrade prompt
 * 4. UI: Shows amber banner and locked upload area for free users
 * 
 * Chatbot Feature Gating (Pro+ only):
 * 1. Component: isPremium checks for 'pro' OR 'enterprise' (ai-chatbot-dialog.tsx)
 * 2. Handler: Blocks message sending if user not on Pro/Enterprise
 * 3. UI: Button only visible with handleSendMessage validation
 * 
 * Data Persistence:
 * - User subscription stored in Firebase: userData.subscriptionPlan
 * - Plan updated on successful Razorpay payment verification
 * - Backend updates maxStorage based on plan during payment
 * - Frontend reads plan from UNIVERSAL_PLANS constant
 */

export const featureAccessControl = {
  fileToURL: {
    name: "File to URL",
    allowedPlans: ["starter", "pro", "enterprise"],
    defaultAllowed: false,
    description: "Create shareable links for files",
  },
  chatbot: {
    name: "AI Chatbot",
    allowedPlans: ["pro", "enterprise"],
    defaultAllowed: false,
    description: "AI-powered file chat assistant",
  },
  cloudStorage: {
    name: "Cloud Storage",
    allowedPlans: ["free", "starter", "pro", "enterprise"],
    defaultAllowed: true,
    description: "Upload and manage files",
  },
  secretVault: {
    name: "Secret Vault",
    allowedPlans: ["free", "starter", "pro", "enterprise"],
    defaultAllowed: true,
    description: "Encrypted file storage",
  },
}

// Helper function to check feature access
export function hasFeatureAccess(plan: string, featureName: keyof typeof featureAccessControl): boolean {
  const feature = featureAccessControl[featureName]
  return feature.allowedPlans.includes(plan)
}
