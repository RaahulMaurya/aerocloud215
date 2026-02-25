/**
 * Production-Ready Error Handler
 * Centralized error handling, logging, and user-friendly messages
 */

export enum ErrorType {
  VALIDATION = "validation",
  AUTH = "auth",
  STORAGE = "storage",
  NETWORK = "network",
  QUOTA = "quota",
  RATE_LIMIT = "rate_limit",
  NOT_FOUND = "not_found",
  PERMISSION = "permission",
  UNKNOWN = "unknown",
}

export interface AppError {
  type: ErrorType
  message: string
  userMessage: string
  statusCode: number
  details?: Record<string, any>
  timestamp: Date
}

// Firebase error interface
interface FirebaseError extends Error {
  code?: string
  message: string
}

/**
 * Parse and standardize errors
 */
export function handleError(error: unknown): AppError {
  const timestamp = new Date()

  // Check if error is a Firebase error by looking for Firebase error properties
  if (error && typeof error === "object" && "code" in error && "message" in error) {
    return handleFirebaseError(error as any, timestamp)
  }

  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      userMessage: "An unexpected error occurred. Please try again.",
      statusCode: 500,
      details: { stack: error.stack },
      timestamp,
    }
  }

  return {
    type: ErrorType.UNKNOWN,
    message: String(error),
    userMessage: "An unexpected error occurred.",
    statusCode: 500,
    timestamp,
  }
}

/**
 * Handle Firebase-specific errors
 */
function handleFirebaseError(error: any, timestamp: Date): AppError {
  const code = error.code || ""

  const errorMap: Record<string, { type: ErrorType; message: string; statusCode: number }> = {
    "auth/invalid-email": { type: ErrorType.VALIDATION, message: "Invalid email address", statusCode: 400 },
    "auth/weak-password": { type: ErrorType.VALIDATION, message: "Password is too weak", statusCode: 400 },
    "auth/email-already-in-use": { type: ErrorType.VALIDATION, message: "Email already registered", statusCode: 409 },
    "auth/user-not-found": { type: ErrorType.AUTH, message: "User not found", statusCode: 404 },
    "auth/wrong-password": { type: ErrorType.AUTH, message: "Invalid credentials", statusCode: 401 },
    "storage/object-not-found": { type: ErrorType.NOT_FOUND, message: "File not found", statusCode: 404 },
    "storage/quota-exceeded": { type: ErrorType.QUOTA, message: "Storage quota exceeded", statusCode: 413 },
    "permission-denied": { type: ErrorType.PERMISSION, message: "Permission denied", statusCode: 403 },
  }

  const mapped = errorMap[code]

  if (mapped) {
    return {
      type: mapped.type,
      message: error.message,
      userMessage: getMappedUserMessage(mapped.type),
      statusCode: mapped.statusCode,
      details: { code },
      timestamp,
    }
  }

  return {
    type: ErrorType.UNKNOWN,
    message: error.message || String(error),
    userMessage: "An error occurred while processing your request.",
    statusCode: 500,
    details: { code },
    timestamp,
  }
}

/**
 * Get user-friendly error message
 */
function getMappedUserMessage(type: ErrorType): string {
  const messages: Record<ErrorType, string> = {
    [ErrorType.VALIDATION]: "Please check your input and try again.",
    [ErrorType.AUTH]: "Authentication failed. Please log in again.",
    [ErrorType.STORAGE]: "Storage operation failed. Please try again.",
    [ErrorType.NETWORK]: "Network error. Please check your connection.",
    [ErrorType.QUOTA]: "You've exceeded your storage quota. Upgrade your plan.",
    [ErrorType.RATE_LIMIT]: "Too many requests. Please wait a moment and try again.",
    [ErrorType.NOT_FOUND]: "The requested resource was not found.",
    [ErrorType.PERMISSION]: "You don't have permission to perform this action.",
    [ErrorType.UNKNOWN]: "An unexpected error occurred. Please try again later.",
  }

  return messages[type]
}

/**
 * Log errors to console in development, external service in production
 */
export function logError(error: AppError): void {
  const isDev = process.env.NODE_ENV === "development"

  const logData = {
    timestamp: error.timestamp,
    type: error.type,
    message: error.message,
    statusCode: error.statusCode,
    details: error.details,
  }

  if (isDev) {
    console.error("Error logged:", logData)
  } else {
    // In production, send to error tracking service (Sentry, etc.)
    // await sendToErrorTracker(logData)
    console.error("[PROD ERROR]", logData)
  }
}
