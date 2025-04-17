/**
 * Validates an incoming HTTP request
 * @param request The incoming request object
 * @param requiredFields Optional object specifying required fields and their types
 * @returns The validated request data
 */
export async function validateRequest(request: Request, requiredFields?: Record<string, string>) {
  try {
    // Check request method
    const method = request.method.toUpperCase()

    // For GET requests, parse URL parameters
    if (method === "GET") {
      const url = new URL(request.url)
      const params: Record<string, string> = {}

      url.searchParams.forEach((value, key) => {
        params[key] = value
      })

      // Validate required fields if specified
      if (requiredFields) {
        for (const [field, type] of Object.entries(requiredFields)) {
          if (!params[field]) {
            throw new Error(`Missing required field: ${field}`)
          }

          // Basic type validation
          if (type === "number" && isNaN(Number(params[field]))) {
            throw new Error(`Field ${field} must be a number`)
          }
        }
      }

      return params
    }

    // For POST/PUT/PATCH requests, parse JSON body
    if (["POST", "PUT", "PATCH"].includes(method)) {
      // Check content type
      const contentType = request.headers.get("Content-Type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Content-Type must be application/json")
      }

      // Parse JSON body
      const body = await request.json().catch(() => {
        throw new Error("Invalid JSON body")
      })

      // Validate required fields if specified
      if (requiredFields) {
        for (const [field, type] of Object.entries(requiredFields)) {
          if (body[field] === undefined) {
            throw new Error(`Missing required field: ${field}`)
          }

          // Basic type validation
          if (type === "number" && typeof body[field] !== "number") {
            throw new Error(`Field ${field} must be a number`)
          } else if (type === "string" && typeof body[field] !== "string") {
            throw new Error(`Field ${field} must be a string`)
          } else if (type === "boolean" && typeof body[field] !== "boolean") {
            throw new Error(`Field ${field} must be a boolean`)
          } else if (type === "array" && !Array.isArray(body[field])) {
            throw new Error(`Field ${field} must be an array`)
          } else if (
            type === "object" &&
            (typeof body[field] !== "object" || Array.isArray(body[field]) || body[field] === null)
          ) {
            throw new Error(`Field ${field} must be an object`)
          }
        }
      }

      return body
    }

    // For other methods, return empty object
    return {}
  } catch (error) {
    console.error("Request validation error:", error)
    throw error
  }
}
