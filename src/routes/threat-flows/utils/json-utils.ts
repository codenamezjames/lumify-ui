import type { DataField } from '../flow-types'

/**
 * Safely parse JSON string
 */
export function parseJsonSafe(str: string): { success: true; data: unknown } | { success: false; error: string } {
  try {
    const data = JSON.parse(str)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Invalid JSON' }
  }
}

/**
 * Get the type of a JSON value
 */
function getJsonType(value: unknown): DataField['type'] {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  const type = typeof value
  if (type === 'object') return 'object'
  if (type === 'string') return 'string'
  if (type === 'number') return 'number'
  if (type === 'boolean') return 'boolean'
  return 'string'
}

/**
 * Convert a value to a sample string for display
 */
function toSampleString(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return value.length > 50 ? value.slice(0, 50) + '...' : value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return `[${value.length} items]`
  if (typeof value === 'object') return '{...}'
  return String(value)
}

/**
 * Recursively extract all field paths from a JSON object
 */
export function extractJsonFields(data: unknown, prefix = ''): DataField[] {
  const fields: DataField[] = []

  if (data === null || typeof data !== 'object') {
    return fields
  }

  if (Array.isArray(data)) {
    // For arrays, we extract fields from the first element as representative
    if (data.length > 0) {
      const firstItem = data[0]
      if (typeof firstItem === 'object' && firstItem !== null) {
        const itemFields = extractJsonFields(firstItem, prefix ? `${prefix}[0]` : '[0]')
        fields.push(...itemFields)
      } else {
        fields.push({
          path: prefix ? `${prefix}[0]` : '[0]',
          type: getJsonType(firstItem),
          sample: toSampleString(firstItem),
        })
      }
    }
    return fields
  }

  // For objects, iterate through all keys
  for (const [key, value] of Object.entries(data)) {
    const path = prefix ? `${prefix}.${key}` : key
    const type = getJsonType(value)

    // Add the field
    fields.push({
      path,
      type,
      sample: toSampleString(value),
    })

    // Recursively extract nested fields
    if (type === 'object' || type === 'array') {
      const nestedFields = extractJsonFields(value, path)
      fields.push(...nestedFields)
    }
  }

  return fields
}

/**
 * Parse JSON string and extract all fields
 */
export function parseAndExtractFields(jsonStr: string): { fields: DataField[]; error?: string } {
  const result = parseJsonSafe(jsonStr)
  if (!result.success) {
    return { fields: [], error: result.error }
  }
  return { fields: extractJsonFields(result.data) }
}

/**
 * Build a tree structure from flat field paths for UI display
 */
export type FieldTreeNode = {
  name: string
  path: string
  type: DataField['type']
  sample?: string
  children: FieldTreeNode[]
}

export function buildFieldTree(fields: DataField[]): FieldTreeNode[] {
  const root: FieldTreeNode[] = []

  for (const field of fields) {
    const parts = field.path.split('.')
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      const currentPath = parts.slice(0, i + 1).join('.')

      let node = current.find((n) => n.name === part)
      if (!node) {
        node = {
          name: part,
          path: currentPath,
          type: isLast ? field.type : 'object',
          sample: isLast ? field.sample : undefined,
          children: [],
        }
        current.push(node)
      }

      if (isLast) {
        node.type = field.type
        node.sample = field.sample
      }

      current = node.children
    }
  }

  return root
}
