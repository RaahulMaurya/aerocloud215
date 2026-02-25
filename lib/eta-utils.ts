/**
 * Format seconds into MM:SS format
 * @param seconds Total seconds
 * @returns Formatted string like "2m 34s" or "45s"
 */
export function formatETA(seconds: number): string {
  if (seconds <= 0) return "just now"
  
  // Cap at 24 hours max - if ETA is more than this, something is wrong
  if (seconds > 86400) return "> 24h"
  
  if (seconds < 60) return `${Math.ceil(seconds)}s`
  
  const minutes = Math.floor(seconds / 60)
  const secs = Math.ceil(seconds % 60)
  
  if (minutes === 0) {
    return `${secs}s`
  }
  
  return `${minutes}m ${secs}s`
}

/**
 * Calculate ETA in seconds based on upload progress
 * @param progress Current progress percentage (0-100)
 * @param elapsedMs Elapsed time in milliseconds
 * @returns ETA in seconds
 */
export function calculateETASeconds(progress: number, elapsedMs: number): number {
  // Normalize progress: if it's between 0 and 1, multiply by 100
  let normalizedProgress = progress
  if (progress > 0 && progress < 1) {
    normalizedProgress = progress * 100
  }
  
  // Need at least some progress and time to have passed
  if (normalizedProgress < 1 || elapsedMs < 500) {
    return 0
  }
  
  // Clamp progress between 1 and 99 to get reasonable estimates
  const safeProgress = Math.max(1, Math.min(normalizedProgress, 99))
  
  // Calculate time per percentage point (how long it took to upload this much)
  const timePerPercent = elapsedMs / safeProgress
  
  // Calculate remaining percentage
  const remainingPercent = 100 - safeProgress
  
  // Calculate remaining time in milliseconds
  const remainingTimeMs = remainingPercent * timePerPercent
  
  // Convert to seconds and round up
  const remainingSeconds = Math.ceil(remainingTimeMs / 1000)
  
  return remainingSeconds
}
