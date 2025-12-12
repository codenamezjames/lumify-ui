import type { DataField } from '../flow-types'

/**
 * Extract template placeholders from a string
 * Placeholders use the format: {{field.path}}
 */
export function extractTemplatePlaceholders(template: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const placeholders: string[] = []
  let match

  while ((match = regex.exec(template)) !== null) {
    placeholders.push(match[1].trim())
  }

  return [...new Set(placeholders)] // dedupe
}

/**
 * Render a template with sample values for preview
 */
export function renderTemplatePreview(
  template: string,
  availableFields: DataField[]
): string {
  const fieldMap = new Map(availableFields.map((f) => [f.path, f.sample ?? `[${f.path}]`]))

  return template.replace(/\{\{([^}]+)\}\}/g, (_, fieldPath) => {
    const trimmed = fieldPath.trim()
    return fieldMap.get(trimmed) ?? `[${trimmed}]`
  })
}

/**
 * Insert a field placeholder at cursor position in a string
 */
export function insertFieldAtCursor(
  text: string,
  cursorPos: number,
  fieldPath: string
): { text: string; newCursorPos: number } {
  const placeholder = `{{${fieldPath}}}`
  const before = text.slice(0, cursorPos)
  const after = text.slice(cursorPos)
  return {
    text: before + placeholder + after,
    newCursorPos: cursorPos + placeholder.length,
  }
}

/**
 * Validate that all placeholders in a template have corresponding fields
 */
export function validateTemplatePlaceholders(
  template: string,
  availableFields: DataField[]
): { valid: boolean; missingFields: string[] } {
  const placeholders = extractTemplatePlaceholders(template)
  const availablePaths = new Set(availableFields.map((f) => f.path))
  const missingFields = placeholders.filter((p) => !availablePaths.has(p))

  return {
    valid: missingFields.length === 0,
    missingFields,
  }
}
