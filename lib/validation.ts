/**
 * Validate email address
 * @param email Email address to validate
 */
export function isValidEmail(email: string): boolean {
  // Basic email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Validate username
 * @param username Username to validate
 */
export function isValidUsername(username: string): boolean {
  // Allow alphanumeric, underscore, hyphen, 3-30 chars
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username)
}

/**
 * Validate password strength
 * @param password Password to validate
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
  score: number
} {
  const errors = []
  let score = 0

  // Check length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  } else {
    score += 1
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  } else {
    score += 1
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  } else {
    score += 1
  }

  // Check for numbers
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  } else {
    score += 1
  }

  // Check for special characters
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character")
  } else {
    score += 1
  }

  // Check for common passwords
  const commonPasswords = [
    "password",
    "password123",
    "123456",
    "qwerty",
    "admin",
    "welcome",
    "letmein",
    "monkey",
    "abc123",
    "football",
  ]

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common")
    score = 0
  }

  return {
    valid: errors.length === 0,
    errors,
    score,
  }
}

/**
 * Validate URL
 * @param url URL to validate
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate date
 * @param date Date to validate
 */
export function isValidDate(date: string): boolean {
  const d = new Date(date)
  return !isNaN(d.getTime())
}

/**
 * Validate phone number
 * @param phone Phone number to validate
 */
export function isValidPhone(phone: string): boolean {
  // Basic international phone number validation
  return /^\+?[0-9]{10,15}$/.test(phone)
}

/**
 * Validate credit card number (Luhn algorithm)
 * @param cardNumber Credit card number to validate
 */
export function isValidCreditCard(cardNumber: string): boolean {
  // Remove spaces and dashes
  const digits = cardNumber.replace(/[\s-]/g, "")

  // Check if contains only digits
  if (!/^\d+$/.test(digits)) return false

  // Luhn algorithm
  let sum = 0
  let shouldDouble = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(digits.charAt(i))

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}
