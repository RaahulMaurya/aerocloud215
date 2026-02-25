/**
 * File Validation Utilities
 * Comprehensive validation for file uploads
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate file before upload
 * Now allows ALL file types and sizes - backend will handle restrictions
 */
export function validateFileUpload(file: File): ValidationResult {
  // Check if file exists
  if (!file) {
    return { valid: false, error: "No file selected" }
  }

  // Check file name validity
  if (!file.name || file.name.trim() === "") {
    return { valid: false, error: "File must have a valid name" }
  }

  if (file.name.length > 255) {
    return { valid: false, error: "File name is too long (max 255 characters)" }
  }

  // Allow all file types and sizes - backend handles restrictions
  return { valid: true }
}

/**
 * Check if file is allowed for current plan
 * Note: This is now a pass-through as backend handles quota
 */
export function validateFilesForPlan(
  fileSize: number,
  planName: string,
): ValidationResult {
  // Backend will validate against user's actual quota and plan
  return { valid: true }
}
