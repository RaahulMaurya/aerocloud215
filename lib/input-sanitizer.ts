/**
 * Input Sanitization & Security Utilities
 * Prevents XSS, injection attacks, and validates user input
 */

/**
 * Sanitize file names to prevent directory traversal and XSS
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== "string") {
    return "file"
  }

  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\.\//g, "").replace(/\.\.\\/g, "")

  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, "")

  // Allow only safe characters: alphanumeric, dots, hyphens, underscores, spaces
  sanitized = sanitized.replace(/[^a-zA-Z0-9._\-\s]/g, "_")

  // Remove multiple consecutive underscores
  sanitized = sanitized.replace(/_+/g, "_")

  // Ensure max length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf("."))
    sanitized = sanitized.substring(0, 255 - ext.length) + ext
  }

  return sanitized || "file"
}

/**
 * Sanitize folder names
 */
export function sanitizeFolderName(folderName: string): string {
  if (!folderName || typeof folderName !== "string") {
    return "folder"
  }

  // Remove path traversal
  let sanitized = folderName.replace(/\.\.\//g, "").replace(/\.\.\\/g, "")

  // Remove leading/trailing spaces
  sanitized = sanitized.trim()

  // Allow only safe characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9_\-\s]/g, "_")

  // Limit length
  if (sanitized.length > 50) {
    sanitized = sanitized.substring(0, 50)
  }

  return sanitized || "folder"
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Validate URL safety
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Only allow http and https
    return ["http:", "https:"].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Check for suspicious file names
 */
export function isSuspiciousFileName(fileName: string): boolean {
  const suspicious = [
    /\x00/, // Null byte
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.com$/i,
    /\.pif$/i,
    /\.scr$/i,
    /\.vbs$/i,
    /\.js$/i,
    /\.jar$/i,
    /\.zip$/i, // Could contain malware
  ]

  return suspicious.some((pattern) => pattern.test(fileName))
}

/**
 * Sanitize display text to prevent XSS
 */
export function sanitizeText(text: string, maxLength = 500): string {
  if (!text || typeof text !== "string") {
    return ""
  }

  let sanitized = text.trim()

  // Remove script tags and event handlers
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  sanitized = sanitized.replace(/on\w+\s*=\s*["']?(?:javascript:)?[^"'`>]*["']?/gi, "")

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + "..."
  }

  return escapeHtml(sanitized)
}
