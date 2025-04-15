import { createServerSupabaseClient } from "./supabase"
import { validateTableName, validateColumnName } from "./sql-protection"

/**
 * Secure database query wrapper
 */
export const secureDb = {
  /**
   * Securely select data from a table
   * @param table Table name
   * @param columns Columns to select
   * @param where Where conditions
   * @param orderBy Order by clause
   * @param limit Limit
   */
  async select(
    table: string,
    columns: string[] = ["*"],
    where: Record<string, any> = {},
    orderBy?: { column: string; direction?: "asc" | "desc" },
    limit?: number,
  ) {
    // Validate table name
    if (!validateTableName(table)) {
      throw new Error(`Invalid table name: ${table}`)
    }

    // Validate column names
    if (columns.length > 0 && columns[0] !== "*") {
      for (const column of columns) {
        if (!validateColumnName(column)) {
          throw new Error(`Invalid column name: ${column}`)
        }
      }
    }

    // Validate order by
    if (orderBy && !validateColumnName(orderBy.column)) {
      throw new Error(`Invalid order by column: ${orderBy.column}`)
    }

    const supabase = createServerSupabaseClient()
    let query = supabase.from(table).select(columns.join(","))

    // Add where conditions
    Object.entries(where).forEach(([key, value]) => {
      if (validateColumnName(key)) {
        query = query.eq(key, value)
      } else {
        throw new Error(`Invalid column name in where clause: ${key}`)
      }
    })

    // Add order by
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.direction !== "desc" })
    }

    // Add limit
    if (limit) {
      query = query.limit(limit)
    }

    return query
  },

  /**
   * Securely insert data into a table
   * @param table Table name
   * @param data Data to insert
   */
  async insert(table: string, data: Record<string, any>) {
    // Validate table name
    if (!validateTableName(table)) {
      throw new Error(`Invalid table name: ${table}`)
    }

    // Validate column names
    for (const key of Object.keys(data)) {
      if (!validateColumnName(key)) {
        throw new Error(`Invalid column name: ${key}`)
      }
    }

    const supabase = createServerSupabaseClient()
    return supabase.from(table).insert(data)
  },

  /**
   * Securely update data in a table
   * @param table Table name
   * @param data Data to update
   * @param where Where conditions
   */
  async update(table: string, data: Record<string, any>, where: Record<string, any>) {
    // Validate table name
    if (!validateTableName(table)) {
      throw new Error(`Invalid table name: ${table}`)
    }

    // Validate column names
    for (const key of Object.keys(data)) {
      if (!validateColumnName(key)) {
        throw new Error(`Invalid column name: ${key}`)
      }
    }

    // Validate where columns
    for (const key of Object.keys(where)) {
      if (!validateColumnName(key)) {
        throw new Error(`Invalid column name in where clause: ${key}`)
      }
    }

    const supabase = createServerSupabaseClient()
    let query = supabase.from(table).update(data)

    // Add where conditions
    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    return query
  },

  /**
   * Securely delete data from a table
   * @param table Table name
   * @param where Where conditions
   */
  async delete(table: string, where: Record<string, any>) {
    // Validate table name
    if (!validateTableName(table)) {
      throw new Error(`Invalid table name: ${table}`)
    }

    // Validate where columns
    for (const key of Object.keys(where)) {
      if (!validateColumnName(key)) {
        throw new Error(`Invalid column name in where clause: ${key}`)
      }
    }

    const supabase = createServerSupabaseClient()
    let query = supabase.from(table).delete()

    // Add where conditions
    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    return query
  },

  /**
   * Execute a raw SQL query (use with caution)
   * @param sql SQL query
   * @param params Query parameters
   */
  async raw(sql: string, params: any[] = []) {
    const supabase = createServerSupabaseClient()
    return supabase.rpc("execute_sql", { sql, params })
  },
}
