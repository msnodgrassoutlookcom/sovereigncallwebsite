/**
 * Sanitize SQL input to prevent SQL injection
 * @param input SQL input to sanitize
 */
export function sanitizeSqlInput(input: string): string {
  if (!input) return ""

  // Remove SQL comments
  let sanitized = input.replace(/--.*$/gm, "")

  // Remove multi-line comments
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, "")

  // Escape single quotes
  sanitized = sanitized.replace(/'/g, "''")

  return sanitized
}

/**
 * Validate table name to prevent SQL injection
 * @param tableName Table name to validate
 */
export function validateTableName(tableName: string): boolean {
  // Only allow alphanumeric characters and underscores
  return /^[a-zA-Z0-9_]+$/.test(tableName)
}

/**
 * Validate column name to prevent SQL injection
 * @param columnName Column name to validate
 */
export function validateColumnName(columnName: string): boolean {
  // Only allow alphanumeric characters and underscores
  return /^[a-zA-Z0-9_]+$/.test(columnName)
}

/**
 * Create a parameterized query to prevent SQL injection
 * @param query SQL query with placeholders
 * @param params Parameters to replace placeholders
 */
export function createParameterizedQuery(query: string, params: any[]): { text: string; values: any[] } {
  // Replace ? with $1, $2, etc.
  let paramIndex = 1
  const text = query.replace(/\?/g, () => `$${paramIndex++}`)

  return { text, values: params }
}

/**
 * Validate SQL order by clause
 * @param orderBy Order by clause to validate
 */
export function validateOrderBy(orderBy: string): boolean {
  // Only allow alphanumeric characters, underscores, spaces, commas, and ASC/DESC
  return /^[a-zA-Z0-9_, ]+(ASC|DESC)?$/i.test(orderBy)
}
