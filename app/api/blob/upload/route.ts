import { NextResponse } from "next/server"
import { handleUpload } from "@vercel/blob"
import { serverEnv } from "@/lib/env"

export async function POST(request: Request) {
  try {
    const response = await handleUpload({
      request,
      token: {
        // Use the blob read-write token from environment variables
        readWriteToken: serverEnv.blobReadWriteToken,
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Blob upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 },
    )
  }
}

export const runtime = "nodejs"
