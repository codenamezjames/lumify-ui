import type { FlowNode, StepKind } from '@/routes/threat-flows/flow-types'

export type FieldType = 'text' | 'textarea' | 'select' | 'tags'

export type FieldConfig = {
  key: keyof FlowNode
  label: string
  type: FieldType
  options?: string[]
  placeholder?: string
}

export const nodeFieldConfig: Record<StepKind, FieldConfig[]> = {
  sensor: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Step title' },
    { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Describe what this step does' },
    { key: 'signals', label: 'Data Sources', type: 'tags', placeholder: 'Add signal source' },
  ],
  enrich: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Step title' },
    { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Describe the enrichment' },
    { key: 'owner', label: 'Owner', type: 'text', placeholder: 'Who maintains this' },
  ],
  decision: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Step title' },
    { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Describe the condition' },
    { key: 'status', label: 'Status', type: 'select', options: ['Ready', 'Draft', 'Paused'] },
  ],
  action: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Step title' },
    { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Describe the action' },
    { key: 'owner', label: 'Owner', type: 'text', placeholder: 'Who maintains this' },
    { key: 'status', label: 'Status', type: 'select', options: ['Ready', 'Draft', 'Paused'] },
  ],
  notify: [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Step title' },
    { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Describe the notification' },
    { key: 'owner', label: 'Owner', type: 'text', placeholder: 'Who maintains this' },
  ],
}
