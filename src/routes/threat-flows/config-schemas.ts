import type { PaletteIcon } from './flow-types'

/**
 * Field types for configuration UI
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'json_editor'
  | 'template_editor'
  | 'condition_builder'
  | 'field_picker'

/**
 * Configuration field schema
 */
export type ConfigField = {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  options?: { value: string; label: string }[]
  helpText?: string
}

/**
 * Configuration schema for a node type
 */
export type NodeConfigSchema = {
  configType: 'trigger' | 'decision' | 'notify' | 'action' | 'enrich' | 'generic'
  sections: {
    title: string
    fields: ConfigField[]
  }[]
}

/**
 * Connection type options for triggers
 */
const connectionTypeOptions = [
  { value: 'email_inbox', label: 'Email Inbox' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'schedule', label: 'Scheduled' },
  { value: 'api', label: 'API Event' },
  { value: 'siem', label: 'SIEM Alert' },
  { value: 'edr', label: 'EDR Detection' },
]

/**
 * Action type options
 */
const actionTypeOptions = [
  { value: 'create_ticket', label: 'Create Ticket' },
  { value: 'update_ticket', label: 'Update Ticket' },
  { value: 'send_webhook', label: 'Send Webhook' },
  { value: 'update_watchlist', label: 'Update Watchlist' },
  { value: 'isolate_host', label: 'Isolate Host' },
  { value: 'disable_user', label: 'Disable User' },
]

/**
 * Lookup type options for enrich nodes
 */
const lookupTypeOptions = [
  { value: 'user_lookup', label: 'User Lookup' },
  { value: 'detection_lookup', label: 'Detection Lookup' },
  { value: 'ip_reputation', label: 'IP Reputation' },
  { value: 'domain_reputation', label: 'Domain Reputation' },
  { value: 'file_hash', label: 'File Hash Lookup' },
  { value: 'threat_intel', label: 'Threat Intelligence' },
]

/**
 * Channel options for notifications
 */
const channelOptions = [
  { value: 'slack', label: 'Slack' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'email', label: 'Email' },
  { value: 'pagerduty', label: 'PagerDuty' },
]

/**
 * Default schema for basic node editing
 */
const defaultSchema: NodeConfigSchema = {
  configType: 'generic',
  sections: [
    {
      title: 'Basic',
      fields: [
        { key: 'title', label: 'Title', type: 'text', placeholder: 'Node title' },
        { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Description' },
        { key: 'owner', label: 'Owner', type: 'text', placeholder: 'Owner name' },
      ],
    },
  ],
}

/**
 * Schema for trigger nodes
 */
const triggerSchema: NodeConfigSchema = {
  configType: 'trigger',
  sections: [
    {
      title: 'Basic',
      fields: [
        { key: 'title', label: 'Title', type: 'text', placeholder: 'Node title' },
        { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Description' },
      ],
    },
    {
      title: 'Connection',
      fields: [
        {
          key: 'connectionType',
          label: 'Connection Type',
          type: 'select',
          options: connectionTypeOptions,
        },
      ],
    },
    {
      title: 'Test Data',
      fields: [
        {
          key: 'testData',
          label: 'Sample JSON',
          type: 'json_editor',
          placeholder: 'Paste sample JSON data...',
          helpText: 'Paste sample data to extract available fields',
        },
      ],
    },
  ],
}

/**
 * Schema for decision/condition nodes
 */
const decisionSchema: NodeConfigSchema = {
  configType: 'decision',
  sections: [
    {
      title: 'Basic',
      fields: [
        { key: 'title', label: 'Title', type: 'text', placeholder: 'Node title' },
        { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Description' },
      ],
    },
    {
      title: 'Conditions',
      fields: [
        {
          key: 'conditions',
          label: 'When',
          type: 'condition_builder',
          helpText: 'Define conditions using fields from upstream nodes',
        },
      ],
    },
  ],
}

/**
 * Schema for notify nodes
 */
const notifySchema: NodeConfigSchema = {
  configType: 'notify',
  sections: [
    {
      title: 'Basic',
      fields: [
        { key: 'title', label: 'Title', type: 'text', placeholder: 'Node title' },
        { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Description' },
      ],
    },
    {
      title: 'Notification',
      fields: [
        {
          key: 'channel',
          label: 'Channel',
          type: 'select',
          options: channelOptions,
        },
        {
          key: 'template',
          label: 'Message Template',
          type: 'template_editor',
          placeholder: 'Enter message with {{field}} placeholders...',
          helpText: 'Use {{field.path}} to insert values from upstream nodes',
        },
      ],
    },
  ],
}

/**
 * Schema for action nodes
 */
const actionSchema: NodeConfigSchema = {
  configType: 'action',
  sections: [
    {
      title: 'Basic',
      fields: [
        { key: 'title', label: 'Title', type: 'text', placeholder: 'Node title' },
        { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Description' },
      ],
    },
    {
      title: 'Action',
      fields: [
        {
          key: 'actionType',
          label: 'Action Type',
          type: 'select',
          options: actionTypeOptions,
        },
        {
          key: 'template',
          label: 'Configuration',
          type: 'template_editor',
          placeholder: 'Configure action with {{field}} placeholders...',
          helpText: 'Use {{field.path}} to insert values from upstream nodes',
        },
      ],
    },
  ],
}

/**
 * Schema for enrich/lookup nodes
 */
const enrichSchema: NodeConfigSchema = {
  configType: 'enrich',
  sections: [
    {
      title: 'Basic',
      fields: [
        { key: 'title', label: 'Title', type: 'text', placeholder: 'Node title' },
        { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Description' },
      ],
    },
    {
      title: 'Lookup',
      fields: [
        {
          key: 'lookupType',
          label: 'Lookup Type',
          type: 'select',
          options: lookupTypeOptions,
        },
        {
          key: 'sourceField',
          label: 'Source Field',
          type: 'field_picker',
          helpText: 'Select field to lookup',
        },
      ],
    },
  ],
}

/**
 * Map icons to their configuration schemas
 */
export const iconConfigSchemas: Record<PaletteIcon, NodeConfigSchema> = {
  // Triggers
  'trigger': triggerSchema,
  'test-trigger': triggerSchema,
  'collect': triggerSchema,
  'webhook': triggerSchema,

  // Decision/Logic
  'if': decisionSchema,
  'logic-if': decisionSchema,
  'switch': decisionSchema,
  'decision': decisionSchema,

  // Notify
  'notify': notifySchema,
  'notify-slack': notifySchema,

  // Actions
  'action': actionSchema,
  'action-ticket': actionSchema,
  'action-webhook': actionSchema,
  'action-watchlist': actionSchema,

  // Enrich/Lookup
  'enrich': enrichSchema,
  'get-detection': enrichSchema,
  'get-user': enrichSchema,

  // Flow Control
  'loop': defaultSchema,
  'break': defaultSchema,
  'exit': defaultSchema,
  'wait': defaultSchema,
  'logic-wait': defaultSchema,
  'dedup': defaultSchema,

  // AI/Transform
  'ai-agent': defaultSchema,
  'ai-task': defaultSchema,
  'transform': defaultSchema,
  'transform-extract': defaultSchema,

  // Other
  'workflow': defaultSchema,
  'interact': defaultSchema,
  'loading': defaultSchema,
  'meta-comment': defaultSchema,
}

/**
 * Get the configuration schema for a node based on its icon
 */
export function getConfigSchema(iconName: PaletteIcon | undefined): NodeConfigSchema {
  if (!iconName) return defaultSchema
  return iconConfigSchemas[iconName] ?? defaultSchema
}

/**
 * Condition operators for decision nodes
 */
export const conditionOperators = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'does not equal' },
  { value: 'contains', label: 'contains' },
  { value: 'not_contains', label: 'does not contain' },
  { value: 'starts_with', label: 'starts with' },
  { value: 'ends_with', label: 'ends with' },
  { value: 'greater_than', label: 'is greater than' },
  { value: 'less_than', label: 'is less than' },
  { value: 'is_empty', label: 'is empty' },
  { value: 'is_not_empty', label: 'is not empty' },
]
