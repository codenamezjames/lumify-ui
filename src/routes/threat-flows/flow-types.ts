import type { ReactNode } from 'react'

export type StepKind = 'sensor' | 'enrich' | 'decision' | 'action' | 'notify'
export type StepStatus = 'Ready' | 'Draft' | 'Paused'
export type Edge = { from: string; to: string; label?: string }

// Data field extracted from JSON test data
export type DataField = {
  path: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'
  sample?: string
  selected?: boolean
}

// Test data configuration for trigger nodes
export type TestDataConfig = {
  rawJson: string
  parsedFields: DataField[]
}

// Single condition for decision nodes
export type Condition = {
  fieldPath: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  value: string
}

// Group of conditions with AND/OR logic
export type ConditionGroup = {
  logic: 'AND' | 'OR'
  conditions: Condition[]
}

// Message template for notify/action nodes
export type MessageTemplate = {
  template: string
  channel?: string
}

// Field mapping for enrich nodes
export type FieldMapping = {
  sourceField: string
  targetField: string
}

// Node configuration types (discriminated union)
export type NodeConfig =
  | { type: 'trigger'; testData?: TestDataConfig; connectionType?: string }
  | { type: 'decision'; conditionGroups: ConditionGroup[] }
  | { type: 'notify'; template?: MessageTemplate }
  | { type: 'action'; template?: MessageTemplate; actionType?: string }
  | { type: 'enrich'; sourceMappings?: FieldMapping[]; lookupType?: string }

// Output schema - fields that a node produces
export type OutputSchema = {
  fields: DataField[]
}

export type PaletteIcon =
  | 'if'
  | 'switch'
  | 'ai-agent'
  | 'ai-task'
  | 'loop'
  | 'break'
  | 'collect'
  | 'exit'
  | 'wait'
  | 'workflow'
  | 'dedup'
  | 'interact'
  | 'loading'
  | 'transform'
  | 'webhook'
  | 'notify'
  | 'enrich'
  | 'decision'
  | 'action'
  | 'trigger'
  | 'test-trigger'
  | 'get-detection'
  | 'get-user'
  | 'logic-if'
  | 'logic-wait'
  | 'transform-extract'
  | 'action-ticket'
  | 'action-webhook'
  | 'action-watchlist'
  | 'notify-slack'
  | 'meta-comment'

export type InfoNote = {
  id: string
  title?: string
  body: string
  x: number
  y: number
  width?: number
}

export type InfoBoardState = { x: number; y: number }

export type FlowNode = {
  id: string
  title: string
  kind: StepKind
  iconName?: PaletteIcon
  summary: string
  owner: string
  signals: string[]
  status: StepStatus
  x: number
  y: number
  config?: NodeConfig
  outputSchema?: OutputSchema
}

export type ViewportState = { x: number; y: number; scale: number }

export type KindMeta = {
  label: string
  accent: string
  fallbackIcon: ReactNode
}

export type PaletteGroup = {
  label: string
  icon: ReactNode
  items: { label: string; kind: StepKind; icon: PaletteIcon }[]
}
