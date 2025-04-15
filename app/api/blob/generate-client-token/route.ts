import { NextResponse } from "next/server"
import { generateClientTokenFromReadWriteToken } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    const { pathname, allowedContentTypes } = await request.json()

    // Validate input
    if (!pathname) {
      return NextResponse.json({ error: "Pathname is required" }, { status: 400 })
    }

    // Generate client token
    const clientToken = await generateClientTokenFromReadWriteToken({
      pathname,
      readWriteToken: process.env.BLOB_READ_WRITE_TOKEN!,
      options: {
        ...(allowedContentTypes && { allowedContentTypes }),
      },
    })

    return NextResponse.json({
      clientToken,
      uploadUrl: `https://upload.vercel-blob.com/upload/client-token/${clientToken}`,
    })
  } catch (error) {
    console.error("Error generating client token:", error)
    return NextResponse.json({ error: "Failed to generate client token" }, { status: 500 })
  }
}
