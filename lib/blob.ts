import { put, list, del } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

// Generate a client token for client-side uploads
export async function generateUploadToken(
  pathname: string,
  options?: {
    maxSizeInBytes?: number
    expiresInSeconds?: number
  },
) {
  try {
    // Create a unique filename with UUID
    const uniquePathname = `${pathname.split(".")[0]}-${uuidv4()}.${pathname.split(".").pop()}`

    // Use the put function to generate a client token
    const { url, token } = await put(uniquePathname, {
      access: "public",
      handleUploadUrl: "/api/blob/upload",
      ...options,
    })

    return { url, token, pathname: uniquePathname }
  } catch (error) {
    console.error("Error generating upload token:", error)
    throw error
  }
}

// List blobs with a specific prefix
export async function listBlobs(prefix: string) {
  try {
    const blobs = await list({ prefix })
    return blobs
  } catch (error) {
    console.error("Error listing blobs:", error)
    throw error
  }
}

// Delete a blob
export async function deleteBlob(url: string) {
  try {
    await del(url)
    return true
  } catch (error) {
    console.error("Error deleting blob:", error)
    return false
  }
}

// Add the missing uploadFile function
export async function uploadFile(file: File | Blob, pathname: string): Promise<string> {
  try {
    // Create a unique filename with UUID
    const uniquePathname = `${pathname.split(".")[0]}-${uuidv4()}.${pathname.split(".").pop()}`

    // Upload the file directly from the server
    const { url } = await put(uniquePathname, file, {
      access: "public",
    })

    return url
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// Add the generateClientToken function as an alias for generateUploadToken
export const generateClientToken = generateUploadToken
