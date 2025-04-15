import { NextResponse } from "next/server"
import { generateUploadToken } from "@/lib/blob"

export async function POST(request: Request) {
  try {
    const { pathname, maxSize, expiresIn } = await request.json()

    if (!pathname) {
      return NextResponse.json({ error: "Pathname is required" }, { status: 400 })
    }

    const options = {
      maxSizeInBytes: maxSize ? Number(maxSize) : undefined,
      expiresInSeconds: expiresIn ? Number(expiresIn) : undefined,
    }

    const { url, token, pathname: uniquePathname } = await generateUploadToken(pathname, options)

    return NextResponse.json({ url, token, pathname: uniquePathname })
  } catch (error) {
    console.error("Generate token error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate upload token" },
      { status: 500 },
    )
  }
}

export const runtime = "nodejs"
