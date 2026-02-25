import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface DuplicateCheckResult {
  isDuplicate: boolean
  existingFile?: {
    id: string
    name: string
    uploadedAt: Date
    size: number
  }
  suggestion?: string
}

/**
 * Check if a file with the same name already exists in the folder
 */
export async function checkFileDuplicate(
  userId: string,
  fileName: string,
  folder: string,
): Promise<DuplicateCheckResult> {
  try {
    const parentPath = folder === "root" || folder === "" 
      ? `uploads/${userId}/` 
      : folder.startsWith("uploads/")
        ? folder.endsWith("/") 
          ? folder 
          : `${folder}/`
        : `uploads/${userId}/${folder}/`

    // Query Firestore for files with the same name in the same folder
    const q = query(
      collection(db, `files/${userId}/userFiles`),
      where("displayName", "==", fileName),
      where("parentPath", "==", parentPath),
    )

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return {
        isDuplicate: false,
      }
    }

    const existingDoc = querySnapshot.docs[0]
    const existingData = existingDoc.data()

    return {
      isDuplicate: true,
      existingFile: {
        id: existingDoc.id,
        name: existingData.displayName || fileName,
        uploadedAt: existingData.createdAt?.toDate() || new Date(),
        size: existingData.size || 0,
      },
      suggestion: `${getNameWithoutExtension(fileName)} (1)${getFileExtension(fileName)}`,
    }
  } catch (error) {
    console.error("[v0] Error checking duplicate file:", error)
    // Return non-duplicate on error to allow upload to proceed
    return { isDuplicate: false }
  }
}

/**
 * Get the file name without extension
 */
export function getNameWithoutExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".")
  return lastDot === -1 ? fileName : fileName.substring(0, lastDot)
}

/**
 * Get the file extension including the dot
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".")
  return lastDot === -1 ? "" : fileName.substring(lastDot)
}

/**
 * Generate a unique file name by appending (1), (2), etc.
 */
export function generateUniqueFileName(fileName: string, existingNumber: number = 1): string {
  const nameWithout = getNameWithoutExtension(fileName)
  const extension = getFileExtension(fileName)
  return `${nameWithout} (${existingNumber})${extension}`
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
