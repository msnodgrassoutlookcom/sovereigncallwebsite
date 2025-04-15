import { put } from "@vercel/blob"
import { generateSecureToken } from "./security"

// Allowed file types and their corresponding MIME types
const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  avatar: ["image/jpeg", "image/png", "image/webp"],
}

// Maximum file sizes in bytes
const MAX_FILE_SIZES: Record<string, number> = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  avatar: 2 * 1024 * 1024, // 2MB
}

/**
 * Validate file before upload
 * @param file File to validate
 * @param type File type category
 */
export function validateFile(file: File, type: keyof typeof ALLOWED_FILE_TYPES): { valid: boolean; error?: string } {
  // Check if file type is allowed
  if (!ALLOWED_FILE_TYPES[type].includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES[type].join(", ")}`,
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZES[type]) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZES[type] / (1024 * 1024)}MB`,
    }
  }

  return { valid: true }
}

/**
 * Securely upload a file to Vercel Blob
 * @param file File to upload
 * @param type File type category
 * @param folder Folder to upload to
 */
export async function secureUpload(
  file: File,
  type: keyof typeof ALLOWED_FILE_TYPES,
  folder: string,
): Promise<{ url: string; error?: string }> {
  try {
    // Validate file
    const validation = validateFile(file, type)
    if (!validation.valid) {
      return { url: "", error: validation.error }
    }

    // Generate a secure filename
    const fileExtension = file.name.split(".").pop() || ""
    const secureFilename = `${generateSecureToken(16)}.${fileExtension}`
    const pathname = `${folder}/${secureFilename}`

    // Upload to Vercel Blob
    const { url } = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
    })

    return { url }
  } catch (error) {
    console.error("Secure upload error:", error)
    return {
      url: "",
      error: error instanceof Error ? error.message : "Unknown error during upload",
    }
  }
}

/**
 * Validate image dimensions
 * @param file Image file
 * @param minWidth Minimum width
 * @param minHeight Minimum height
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 */
export function validateImageDimensions(
  file: File,
  minWidth: number,
  minHeight: number,
  maxWidth: number,
  maxHeight: number,
): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve({ valid: false, error: "Not an image file" })
      return
    }

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          error: `Image too small. Minimum dimensions: ${minWidth}x${minHeight}px`,
        })
        return
      }

      if (img.width > maxWidth || img.height > maxHeight) {
        resolve({
          valid: false,
          error: `Image too large. Maximum dimensions: ${maxWidth}x${maxHeight}px`,
        })
        return
      }

      resolve({ valid: true })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ valid: false, error: "Failed to load image" })
    }

    img.src = objectUrl
  })
}
