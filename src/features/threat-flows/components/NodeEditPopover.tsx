import { useEffect, useRef } from 'react'
import { X, Copy, Trash2 } from 'lucide-react'

import type { FlowNode } from '@/routes/threat-flows/flow-types'
import type { UpstreamField } from '@/routes/threat-flows/utils/field-context'
import { kindMeta, iconMap } from '@/routes/threat-flows/flow-constants'
import { getConfigSchema, conditionOperators } from '@/routes/threat-flows/config-schemas'

type NodeEditPopoverProps = {
  node: FlowNode | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (id: string, patch: Partial<FlowNode>) => void
  anchorEl: HTMLElement | null
  upstreamFields?: UpstreamField[]
}

function generateStyles(): string {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: transparent; padding: 0; }

    /* Tabs */
    .tabs { display: flex; gap: 0; border-bottom: 1px solid #2d3038; margin-bottom: 16px; }
    .tab { padding: 8px 16px; font-size: 13px; color: rgba(255,255,255,0.5); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; background: none; border-top: none; border-left: none; border-right: none; }
    .tab:hover { color: rgba(255,255,255,0.8); }
    .tab.active { color: white; border-bottom-color: white; }

    /* Parameters Section */
    .params-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .params-title { font-size: 14px; font-weight: 500; color: white; }
    .params-actions { display: flex; gap: 12px; }
    .params-action { color: rgba(255,255,255,0.4); cursor: pointer; background: none; border: none; padding: 4px; }
    .params-action:hover { color: white; }
    .params-action svg { width: 16px; height: 16px; }

    /* Fields */
    .field { margin-bottom: 16px; }
    .field-label { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 6px; display: block; }
    .field-input { width: 100%; background: #1a1d24; border: 1px solid #2d3038; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: white; outline: none; font-family: inherit; }
    .field-input:focus { border-color: #3b82f6; }
    .field-input::placeholder { color: rgba(255,255,255,0.3); }
    textarea.field-input { resize: vertical; min-height: 60px; }
    select.field-input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }

    /* Template input with blue variables */
    .template-input { font-family: "SF Mono", Monaco, Consolas, monospace; font-size: 13px; line-height: 1.5; }

    /* Divider */
    .divider { height: 1px; background: #2d3038; margin: 16px 0; }

    /* Collapsible Section */
    .collapse-section { border-top: 1px solid #2d3038; }
    .collapse-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; cursor: pointer; }
    .collapse-title { font-size: 14px; color: white; font-weight: 500; }
    .collapse-icon { color: rgba(255,255,255,0.4); transition: transform 0.2s; }
    .collapse-icon.open { transform: rotate(180deg); }
    .collapse-content { padding-bottom: 12px; display: none; }
    .collapse-content.show { display: block; }

    /* JSON Editor */
    .json-editor { font-family: "SF Mono", Monaco, Consolas, monospace; font-size: 12px; min-height: 100px; }
    .json-error { color: #f87171; font-size: 12px; margin-top: 6px; }
    .json-input-container { display: none; margin-top: 8px; }
    .json-input-container.show { display: block; }
    .json-toolbar { display: flex; gap: 8px; margin-top: 10px; }
    .json-parse-btn { background: #3b82f6; border: none; color: white; padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; flex: 1; font-weight: 500; }
    .json-parse-btn:hover { background: #2563eb; }
    .json-cancel-btn { background: transparent; border: 1px solid #2d3038; color: rgba(255,255,255,0.6); padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; }
    .json-cancel-btn:hover { border-color: rgba(255,255,255,0.3); color: white; }
    .add-test-data-btn { background: transparent; border: 1px dashed #3b82f6; color: #3b82f6; padding: 10px 14px; border-radius: 8px; font-size: 13px; cursor: pointer; width: 100%; }
    .add-test-data-btn:hover { background: rgba(59, 130, 246, 0.1); }
    .add-test-data-btn.hidden { display: none; }

    /* Output Fields */
    .json-fields { margin-top: 12px; background: #1a1d24; border-radius: 8px; max-height: 160px; overflow-y: auto; }
    .json-fields-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #2d3038; }
    .json-fields-title { font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; }
    .json-fields-actions { display: flex; gap: 10px; }
    .json-fields-action { font-size: 11px; color: #3b82f6; cursor: pointer; background: none; border: none; padding: 0; }
    .json-fields-action:hover { color: #60a5fa; }
    .json-field { font-size: 12px; color: rgba(255,255,255,0.8); padding: 6px 12px; font-family: "SF Mono", Monaco, Consolas, monospace; display: flex; align-items: center; gap: 10px; }
    .json-field:hover { background: rgba(255,255,255,0.03); }
    .json-field input[type="checkbox"] { width: 16px; height: 16px; margin: 0; accent-color: #3b82f6; cursor: pointer; flex-shrink: 0; }
    .json-field-path { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .json-field-type { color: rgba(255,255,255,0.4); font-size: 11px; flex-shrink: 0; }
    .json-field.unselected { opacity: 0.4; }
    .edit-test-data-btn { font-size: 11px; color: #3b82f6; cursor: pointer; background: none; border: none; padding: 0; }
    .edit-test-data-btn:hover { color: #60a5fa; }

    /* Template Editor */
    .template-container { position: relative; }
    .template-toolbar { display: flex; gap: 8px; margin-bottom: 8px; }
    .insert-field-btn { background: #2d3038; border: none; color: rgba(255,255,255,0.7); padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .insert-field-btn:hover { background: #3d4048; color: white; }
    .field-dropdown { position: absolute; top: 32px; left: 0; background: #1a1d24; border: 1px solid #2d3038; border-radius: 8px; min-width: 220px; max-height: 200px; overflow-y: auto; z-index: 100; display: none; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
    .field-dropdown.show { display: block; }
    .field-group-label { font-size: 10px; color: rgba(255,255,255,0.4); padding: 8px 12px 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-option { padding: 8px 12px; font-size: 12px; color: #60a5fa; cursor: pointer; font-family: "SF Mono", Monaco, Consolas, monospace; }
    .field-option:hover { background: #2d3038; }
    .template-preview { margin-top: 10px; padding: 10px 12px; background: #1a1d24; border-radius: 8px; font-size: 13px; color: rgba(255,255,255,0.6); white-space: pre-wrap; word-break: break-word; }
    .template-preview-label { font-size: 10px; color: rgba(255,255,255,0.4); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Field Pills (blue tags for variables) */
    .field-pill { display: inline-flex; align-items: center; gap: 4px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); color: #60a5fa; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-family: "SF Mono", Monaco, Consolas, monospace; cursor: default; white-space: nowrap; }
    .field-pill:hover { background: rgba(59, 130, 246, 0.25); }
    .field-pill .pill-remove { cursor: pointer; opacity: 0.6; margin-left: 2px; }
    .field-pill .pill-remove:hover { opacity: 1; }

    /* Rich Field Input (with pills inside) */
    .rich-field-input { width: 100%; min-height: 42px; background: #1a1d24; border: 1px solid #2d3038; border-radius: 8px; padding: 8px 12px; font-size: 14px; color: white; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; cursor: text; }
    .rich-field-input:focus-within { border-color: #3b82f6; }
    .rich-field-input .text-segment { color: white; font-size: 14px; }
    .rich-field-input input { flex: 1; min-width: 60px; background: transparent; border: none; color: white; font-size: 14px; outline: none; padding: 0; }
    .rich-field-input input::placeholder { color: rgba(255,255,255,0.3); }

    /* Condition Builder - Groups */
    .condition-groups-container { }
    .condition-group { background: #1a1d24; border: 1px solid #2d3038; border-radius: 8px; padding: 12px; margin-bottom: 0; }
    .condition-group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .condition-group-logic { font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; }
    .condition-group-remove { background: transparent; border: none; color: rgba(255,255,255,0.3); cursor: pointer; padding: 4px; border-radius: 4px; font-size: 16px; line-height: 1; }
    .condition-group-remove:hover { color: #f87171; background: rgba(248, 113, 113, 0.1); }

    /* OR Divider between groups */
    .or-divider { display: flex; align-items: center; gap: 12px; margin: 12px 0; }
    .or-divider-line { flex: 1; height: 1px; background: #2d3038; }
    .or-divider-text { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; padding: 0 4px; }

    /* Condition Row */
    .condition-row { display: flex; gap: 8px; margin-bottom: 10px; align-items: flex-start; }
    .condition-row:last-child { margin-bottom: 0; }
    .condition-field-container { flex: 2; position: relative; }
    .condition-field-input { width: 100%; min-height: 38px; background: #0f1115; border: 1px solid #2d3038; border-radius: 6px; padding: 8px 10px; font-size: 13px; color: white; display: flex; align-items: center; gap: 6px; cursor: pointer; }
    .condition-field-input:hover { border-color: #3d4048; }
    .condition-field-input .field-pill { font-size: 11px; padding: 1px 6px; }
    .condition-field-input .placeholder { color: rgba(255,255,255,0.3); }
    .condition-operator { flex: 1; min-width: 100px; }
    .condition-value-input { flex: 1.5; }
    .condition-remove { background: transparent; border: none; color: rgba(255,255,255,0.3); cursor: pointer; padding: 8px 4px; border-radius: 4px; font-size: 18px; line-height: 1; flex-shrink: 0; }
    .condition-remove:hover { color: #f87171; background: rgba(248, 113, 113, 0.1); }

    /* AND label between conditions */
    .and-label { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; margin: 4px 0 10px 0; }

    .add-condition-btn { background: transparent; border: none; color: #3b82f6; padding: 6px 0; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; margin-top: 8px; }
    .add-condition-btn:hover { color: #60a5fa; }
    .add-group-btn { background: transparent; border: 1px dashed #2d3038; color: rgba(255,255,255,0.5); padding: 10px 14px; border-radius: 8px; font-size: 13px; cursor: pointer; width: 100%; margin-top: 12px; }
    .add-group-btn:hover { border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.7); }

    /* Field picker dropdown for conditions */
    .condition-field-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #1a1d24; border: 1px solid #2d3038; border-radius: 8px; max-height: 180px; overflow-y: auto; z-index: 100; display: none; box-shadow: 0 8px 32px rgba(0,0,0,0.4); margin-top: 4px; }
    .condition-field-dropdown.show { display: block; }
    .condition-field-option { padding: 8px 12px; font-size: 12px; color: #60a5fa; cursor: pointer; font-family: "SF Mono", Monaco, Consolas, monospace; }
    .condition-field-option:hover { background: #2d3038; }
  `
}

function generateFieldHtml(field: { key: string; label: string; type: string; placeholder?: string; options?: { value: string; label: string }[]; helpText?: string }, node: FlowNode, upstreamFields: UpstreamField[]): string {
  const getValue = (key: string): string => {
    if (key === 'title') return node.title.replace(/"/g, '&quot;')
    if (key === 'summary') return node.summary.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    if (key === 'owner') return node.owner.replace(/"/g, '&quot;')
    if (key === 'connectionType') return (node.config as { connectionType?: string } | undefined)?.connectionType ?? ''
    if (key === 'channel') return ((node.config as { template?: { channel?: string } } | undefined)?.template?.channel ?? '')
    if (key === 'actionType') return (node.config as { actionType?: string } | undefined)?.actionType ?? ''
    if (key === 'lookupType') return (node.config as { lookupType?: string } | undefined)?.lookupType ?? ''
    if (key === 'testData') return (node.config as { testData?: { rawJson?: string } } | undefined)?.testData?.rawJson ?? ''
    if (key === 'template') return ((node.config as { template?: { template?: string } } | undefined)?.template?.template ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    if (key === 'sourceField') return (node.config as { sourceMappings?: { sourceField?: string }[] } | undefined)?.sourceMappings?.[0]?.sourceField ?? ''
    return ''
  }

  const value = getValue(field.key)

  switch (field.type) {
    case 'text':
      return `
        <div class="field">
          <label class="field-label">${field.label}</label>
          <input type="text" class="field-input" id="${field.key}" value="${value}" placeholder="${field.placeholder ?? ''}" />
        </div>
      `

    case 'textarea':
      return `
        <div class="field">
          <label class="field-label">${field.label}</label>
          <textarea class="field-input" id="${field.key}" placeholder="${field.placeholder ?? ''}">${value}</textarea>
        </div>
      `

    case 'select':
      const options = (field.options ?? []).map(opt =>
        `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>`
      ).join('')
      return `
        <div class="field">
          <label class="field-label">${field.label}</label>
          <select class="field-input" id="${field.key}">
            <option value="">Select...</option>
            ${options}
          </select>
        </div>
      `

    case 'json_editor':
      const parsedFields = (node.config as { testData?: { parsedFields?: { path: string; type: string; selected?: boolean }[] } } | undefined)?.testData?.parsedFields ?? []
      const hasExistingFields = parsedFields.length > 0
      const fieldsHtml = hasExistingFields
        ? `<div class="json-fields" id="json-fields">
            <div class="json-fields-header">
              <span class="json-fields-title">Output Fields</span>
              <div class="json-fields-actions">
                <button type="button" class="json-fields-action" id="select-all-fields">All</button>
                <button type="button" class="json-fields-action" id="select-none-fields">None</button>
                <button type="button" class="edit-test-data-btn" id="edit-test-data">Edit</button>
              </div>
            </div>
            ${parsedFields.map((f, i) => {
              const isSelected = f.selected !== false
              return `<div class="json-field ${isSelected ? '' : 'unselected'}">
                <input type="checkbox" class="field-checkbox" data-index="${i}" data-path="${f.path}" ${isSelected ? 'checked' : ''} />
                <span class="json-field-path">${f.path}</span>
                <span class="json-field-type">${f.type}</span>
              </div>`
            }).join('')}
          </div>`
        : '<div class="json-fields" id="json-fields" style="display:none;"></div>'
      return `
        <div class="field">
          <label class="field-label">${field.label}</label>
          <button type="button" class="add-test-data-btn ${hasExistingFields ? 'hidden' : ''}" id="add-test-data-btn">+ Add Test Data</button>
          <div class="json-input-container" id="json-input-container">
            <textarea id="${field.key}" class="field-input json-editor" placeholder="${field.placeholder ?? ''}">${value}</textarea>
            <div id="json-error" class="json-error" style="display: none;"></div>
            <div class="json-toolbar">
              <button type="button" class="json-cancel-btn" id="json-cancel-btn">Cancel</button>
              <button type="button" class="json-parse-btn" id="json-parse-btn">Parse Fields</button>
            </div>
          </div>
          ${fieldsHtml}
        </div>
      `

    case 'template_editor':
      // Group upstream fields by source node
      const grouped: Record<string, UpstreamField[]> = {}
      for (const uf of upstreamFields) {
        if (!grouped[uf.sourceNodeTitle]) grouped[uf.sourceNodeTitle] = []
        grouped[uf.sourceNodeTitle].push(uf)
      }
      const dropdownHtml = Object.entries(grouped).map(([nodeTitle, fields]) =>
        `<div class="field-group-label">${nodeTitle}</div>
         ${fields.map(f => `<div class="field-option" data-path="${f.fullPath}">${f.fullPath}</div>`).join('')}`
      ).join('')

      return `
        <div class="field template-container">
          <label class="field-label">${field.label}</label>
          <div class="template-toolbar">
            <button type="button" class="insert-field-btn" id="insert-field-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              Insert Field
            </button>
            <div class="field-dropdown" id="field-dropdown">
              ${upstreamFields.length > 0 ? dropdownHtml : '<div style="padding:12px;color:rgba(255,255,255,0.4);font-size:12px;">No upstream fields available</div>'}
            </div>
          </div>
          <textarea id="${field.key}" class="field-input template-input" placeholder="${field.placeholder ?? ''}">${value}</textarea>
          <div class="template-preview" id="template-preview" ${!value ? 'style="display:none"' : ''}>
            <div class="template-preview-label">Preview</div>
            <div id="preview-content">${value}</div>
          </div>
        </div>
      `

    case 'condition_builder':
      const conditionGroups = (node.config as { conditionGroups?: { logic: string; conditions: { fieldPath: string; operator: string; value: string }[] }[] } | undefined)?.conditionGroups ?? []

      const operatorOptions = conditionOperators.map(op =>
        `<option value="${op.value}">${op.label}</option>`
      ).join('')

      // Build dropdown options HTML for field picker
      const fieldDropdownOptions = upstreamFields.map(f =>
        `<div class="condition-field-option" data-path="${f.fullPath}">${f.fullPath}</div>`
      ).join('') || '<div style="padding:12px;color:rgba(255,255,255,0.4);font-size:12px;">No upstream fields available</div>'

      // Generate condition row HTML
      const generateConditionRow = (c: { fieldPath: string; operator: string; value: string }, groupIdx: number, condIdx: number, showAndLabel: boolean) => {
        const fieldDisplay = c.fieldPath
          ? `<span class="field-pill">${c.fieldPath}</span>`
          : '<span class="placeholder">Select field...</span>'

        return `
          ${showAndLabel ? '<div class="and-label">AND</div>' : ''}
          <div class="condition-row" data-group="${groupIdx}" data-index="${condIdx}">
            <div class="condition-field-container">
              <div class="condition-field-input" data-group="${groupIdx}" data-index="${condIdx}" data-value="${c.fieldPath}">
                ${fieldDisplay}
              </div>
              <div class="condition-field-dropdown" data-group="${groupIdx}" data-index="${condIdx}">
                ${fieldDropdownOptions}
              </div>
            </div>
            <select class="field-input condition-operator" data-group="${groupIdx}" data-index="${condIdx}">
              ${operatorOptions.replace(`value="${c.operator}"`, `value="${c.operator}" selected`)}
            </select>
            <input type="text" class="field-input condition-value-input" data-group="${groupIdx}" data-index="${condIdx}" value="${c.value.replace(/"/g, '&quot;')}" placeholder="Value" />
            <button type="button" class="condition-remove" data-group="${groupIdx}" data-index="${condIdx}">&times;</button>
          </div>
        `
      }

      // Generate group HTML
      const generateGroupHtml = (group: { logic: string; conditions: { fieldPath: string; operator: string; value: string }[] }, groupIdx: number, showOrDivider: boolean) => {
        const conditionsHtml = group.conditions.length > 0
          ? group.conditions.map((c, i) => generateConditionRow(c, groupIdx, i, i > 0)).join('')
          : generateConditionRow({ fieldPath: '', operator: 'equals', value: '' }, groupIdx, 0, false)

        return `
          ${showOrDivider ? `
            <div class="or-divider">
              <div class="or-divider-line"></div>
              <span class="or-divider-text">OR</span>
              <div class="or-divider-line"></div>
            </div>
          ` : ''}
          <div class="condition-group" data-group="${groupIdx}">
            <div class="condition-group-header">
              <span class="condition-group-logic">Match all</span>
              ${groupIdx > 0 ? `<button type="button" class="condition-group-remove" data-group="${groupIdx}">&times;</button>` : ''}
            </div>
            <div class="conditions-in-group" data-group="${groupIdx}">
              ${conditionsHtml}
            </div>
            <button type="button" class="add-condition-btn" data-group="${groupIdx}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              Add Condition
            </button>
          </div>
        `
      }

      const groupsHtml = conditionGroups.length > 0
        ? conditionGroups.map((g, i) => generateGroupHtml(g, i, i > 0)).join('')
        : generateGroupHtml({ logic: 'AND', conditions: [] }, 0, false)

      return `
        <div class="field">
          <label class="field-label">${field.label}</label>
          <div class="condition-groups-container" id="condition-groups-container">
            ${groupsHtml}
          </div>
          <button type="button" class="add-group-btn" id="add-group-btn">+ Add OR Group</button>
          ${field.helpText ? `<div class="help-text">${field.helpText}</div>` : ''}
        </div>
      `

    case 'field_picker':
      const pickerOptions = upstreamFields.map(f =>
        `<option value="${f.fullPath}" ${value === f.fullPath ? 'selected' : ''}>${f.fullPath}</option>`
      ).join('')
      return `
        <div class="field">
          <label class="field-label">${field.label}</label>
          <select class="field-input" id="${field.key}">
            <option value="">Select field...</option>
            ${pickerOptions}
          </select>
        </div>
      `

    default:
      return ''
  }
}

function generateScripts(schema: ReturnType<typeof getConfigSchema>, upstreamFields: UpstreamField[], node: FlowNode): string {
  const hasJsonEditor = schema.sections.some(s => s.fields.some(f => f.type === 'json_editor'))
  const hasTemplateEditor = schema.sections.some(s => s.fields.some(f => f.type === 'template_editor'))
  const hasConditionBuilder = schema.sections.some(s => s.fields.some(f => f.type === 'condition_builder'))

  // Get existing parsed fields for initialization
  const existingParsedFields = (node.config as { testData?: { parsedFields?: { path: string; type: string; sample?: string; selected?: boolean }[] } } | undefined)?.testData?.parsedFields ?? []

  let script = `
    function sendUpdate(field, value) {
      window.parent.postMessage({ type: 'nodeUpdate', field, value }, '*');
    }

    // Basic fields
    document.querySelectorAll('input[type="text"], textarea:not(.json-editor):not([id="template"]), select:not(.condition-field):not(.condition-operator)').forEach(el => {
      el.addEventListener('input', (e) => sendUpdate(e.target.id, e.target.value));
      el.addEventListener('change', (e) => sendUpdate(e.target.id, e.target.value));
    });
  `

  if (hasJsonEditor) {
    const existingFieldsJson = JSON.stringify(existingParsedFields)
    script += `
      // JSON Editor
      let currentFields = ${existingFieldsJson};
      const jsonEditor = document.getElementById('testData');
      const addTestDataBtn = document.getElementById('add-test-data-btn');
      const jsonInputContainer = document.getElementById('json-input-container');
      const jsonParseBtn = document.getElementById('json-parse-btn');
      const jsonCancelBtn = document.getElementById('json-cancel-btn');
      const fieldsContainer = document.getElementById('json-fields');

      function showJsonInput() {
        jsonInputContainer.classList.add('show');
        addTestDataBtn.classList.add('hidden');
        jsonEditor.focus();
      }

      function hideJsonInput() {
        jsonInputContainer.classList.remove('show');
        if (currentFields.length === 0) {
          addTestDataBtn.classList.remove('hidden');
        }
        document.getElementById('json-error').style.display = 'none';
      }

      function renderFieldsUI(fields) {
        if (!fieldsContainer) return;

        if (fields.length === 0) {
          fieldsContainer.style.display = 'none';
          addTestDataBtn.classList.remove('hidden');
          return;
        }

        fieldsContainer.style.display = 'block';
        addTestDataBtn.classList.add('hidden');
        fieldsContainer.innerHTML =
          '<div class="json-fields-header">' +
            '<span class="json-fields-title">Output Fields</span>' +
            '<div class="json-fields-actions">' +
              '<button type="button" class="json-fields-action" id="select-all-fields">All</button>' +
              '<button type="button" class="json-fields-action" id="select-none-fields">None</button>' +
              '<button type="button" class="edit-test-data-btn" id="edit-test-data">Edit</button>' +
            '</div>' +
          '</div>' +
          fields.map((f, i) => {
            const isSelected = f.selected !== false;
            return '<div class="json-field ' + (isSelected ? '' : 'unselected') + '">' +
              '<input type="checkbox" class="field-checkbox" data-index="' + i + '" data-path="' + f.path + '" ' + (isSelected ? 'checked' : '') + ' />' +
              '<span class="json-field-path">' + f.path + '</span>' +
              '<span class="json-field-type">' + f.type + '</span>' +
            '</div>';
          }).join('');

        attachFieldListeners();
      }

      function sendFieldsUpdate() {
        sendUpdate('testDataParsed', JSON.stringify(currentFields));
      }

      function attachFieldListeners() {
        document.querySelectorAll('.field-checkbox').forEach(cb => {
          cb.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index);
            currentFields[idx].selected = e.target.checked;
            e.target.closest('.json-field').classList.toggle('unselected', !e.target.checked);
            sendFieldsUpdate();
          });
        });

        document.getElementById('select-all-fields')?.addEventListener('click', () => {
          currentFields.forEach(f => f.selected = true);
          document.querySelectorAll('.field-checkbox').forEach(cb => {
            cb.checked = true;
            cb.closest('.json-field').classList.remove('unselected');
          });
          sendFieldsUpdate();
        });

        document.getElementById('select-none-fields')?.addEventListener('click', () => {
          currentFields.forEach(f => f.selected = false);
          document.querySelectorAll('.field-checkbox').forEach(cb => {
            cb.checked = false;
            cb.closest('.json-field').classList.add('unselected');
          });
          sendFieldsUpdate();
        });

        document.getElementById('edit-test-data')?.addEventListener('click', showJsonInput);
      }

      // Show input when clicking "Add Test Data"
      addTestDataBtn?.addEventListener('click', showJsonInput);

      // Cancel button hides input
      jsonCancelBtn?.addEventListener('click', hideJsonInput);

      // Parse button parses JSON and shows fields
      jsonParseBtn?.addEventListener('click', () => {
        const value = jsonEditor.value;
        sendUpdate('testDataRaw', value);

        try {
          const data = JSON.parse(value);
          currentFields = extractJsonFields(data);
          renderFieldsUI(currentFields);
          sendFieldsUpdate();
          hideJsonInput();

          const errorEl = document.getElementById('json-error');
          if (errorEl) errorEl.style.display = 'none';
        } catch (err) {
          const errorEl = document.getElementById('json-error');
          if (errorEl) {
            errorEl.textContent = 'Invalid JSON: ' + err.message;
            errorEl.style.display = 'block';
          }
        }
      });

      // Initialize field listeners for existing fields
      attachFieldListeners();

      function extractJsonFields(data, prefix = '') {
        const fields = [];
        if (data === null || typeof data !== 'object') return fields;

        if (Array.isArray(data)) {
          if (data.length > 0 && typeof data[0] === 'object') {
            fields.push(...extractJsonFields(data[0], prefix ? prefix + '[0]' : '[0]'));
          }
          return fields;
        }

        for (const [key, value] of Object.entries(data)) {
          const path = prefix ? prefix + '.' + key : key;
          const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
          fields.push({ path, type, sample: String(value).slice(0, 50), selected: true });
          if (type === 'object' || type === 'array') {
            fields.push(...extractJsonFields(value, path));
          }
        }
        return fields;
      }
    `
  }

  if (hasTemplateEditor) {
    const upstreamFieldsJson = JSON.stringify(upstreamFields.map(f => ({ fullPath: f.fullPath, sample: f.sample })))
    script += `
      // Template Editor
      const templateTextarea = document.getElementById('template');
      const insertBtn = document.getElementById('insert-field-btn');
      const dropdown = document.getElementById('field-dropdown');
      const preview = document.getElementById('template-preview');
      const previewContent = document.getElementById('preview-content');
      const upstreamFields = ${upstreamFieldsJson};

      if (insertBtn && dropdown) {
        insertBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('show');
        });

        document.querySelectorAll('.field-option').forEach(opt => {
          opt.addEventListener('click', () => {
            const path = opt.dataset.path;
            const textarea = templateTextarea;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const placeholder = '{{' + path + '}}';
            textarea.value = text.slice(0, start) + placeholder + text.slice(end);
            textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
            textarea.focus();
            dropdown.classList.remove('show');
            sendUpdate('template', textarea.value);
            updatePreview(textarea.value);
          });
        });

        document.addEventListener('click', () => dropdown.classList.remove('show'));
      }

      if (templateTextarea) {
        templateTextarea.addEventListener('input', (e) => {
          sendUpdate('template', e.target.value);
          updatePreview(e.target.value);
        });
      }

      function updatePreview(template) {
        if (!preview || !previewContent) return;
        if (!template) {
          preview.style.display = 'none';
          return;
        }
        preview.style.display = 'block';
        let result = template;
        // Replace field placeholders with styled pills
        const placeholderRegex = /\\{\\{([^}]+)\\}\\}/g;
        result = result.replace(placeholderRegex, function(match, fieldPath) {
          const field = upstreamFields.find(f => f.fullPath === fieldPath);
          const sample = field ? field.sample : fieldPath;
          return '<span class="field-pill">' + (sample || fieldPath) + '</span>';
        });
        previewContent.innerHTML = result;
      }
    `
  }

  if (hasConditionBuilder) {
    const operatorOptionsJson = JSON.stringify(conditionOperators)
    const fieldOptionsJson = JSON.stringify(upstreamFields.map(f => f.fullPath))
    script += `
      // Condition Builder - Multi-group support
      const operatorOptions = ${operatorOptionsJson};
      const fieldOptions = ${fieldOptionsJson};

      // Get all condition groups with their conditions
      function getConditionGroups() {
        const groups = [];
        document.querySelectorAll('.condition-group').forEach((groupEl, groupIdx) => {
          const conditions = [];
          groupEl.querySelectorAll('.condition-row').forEach((row) => {
            const fieldInput = row.querySelector('.condition-field-input');
            const field = fieldInput ? fieldInput.dataset.value : '';
            const operator = row.querySelector('.condition-operator')?.value || 'equals';
            const value = row.querySelector('.condition-value-input')?.value || '';
            conditions.push({ fieldPath: field, operator, value });
          });
          groups.push({ logic: 'AND', conditions });
        });
        return groups;
      }

      function sendConditionsUpdate() {
        const groups = getConditionGroups();
        sendUpdate('conditionGroups', JSON.stringify(groups));
      }

      // Field picker dropdown
      let activeDropdown = null;

      document.addEventListener('click', (e) => {
        // Open field picker dropdown
        if (e.target.closest('.condition-field-input')) {
          const input = e.target.closest('.condition-field-input');
          const dropdown = input.nextElementSibling;
          if (dropdown && dropdown.classList.contains('condition-field-dropdown')) {
            // Close other dropdowns
            document.querySelectorAll('.condition-field-dropdown.show').forEach(d => d.classList.remove('show'));
            dropdown.classList.toggle('show');
            activeDropdown = dropdown.classList.contains('show') ? dropdown : null;
            e.stopPropagation();
          }
          return;
        }

        // Select field from dropdown
        if (e.target.classList.contains('condition-field-option')) {
          const path = e.target.dataset.path;
          const dropdown = e.target.closest('.condition-field-dropdown');
          const input = dropdown.previousElementSibling;
          input.dataset.value = path;
          input.innerHTML = '<span class="field-pill">' + path + '</span>';
          dropdown.classList.remove('show');
          activeDropdown = null;
          sendConditionsUpdate();
          return;
        }

        // Close dropdowns when clicking outside
        if (activeDropdown) {
          activeDropdown.classList.remove('show');
          activeDropdown = null;
        }

        // Remove condition
        if (e.target.classList.contains('condition-remove')) {
          const row = e.target.closest('.condition-row');
          const group = row.closest('.condition-group');
          const rows = group.querySelectorAll('.condition-row');
          if (rows.length > 1) {
            // Remove the AND label if it's the first row being removed
            const prevSibling = row.previousElementSibling;
            if (prevSibling && prevSibling.classList.contains('and-label')) {
              prevSibling.remove();
            }
            row.remove();
            sendConditionsUpdate();
          }
          return;
        }

        // Remove group
        if (e.target.classList.contains('condition-group-remove')) {
          const groupEl = e.target.closest('.condition-group');
          const prevSibling = groupEl.previousElementSibling;
          if (prevSibling && prevSibling.classList.contains('or-divider')) {
            prevSibling.remove();
          }
          groupEl.remove();
          sendConditionsUpdate();
          return;
        }

        // Add condition to group
        if (e.target.closest('.add-condition-btn')) {
          const btn = e.target.closest('.add-condition-btn');
          const groupIdx = btn.dataset.group;
          const group = btn.closest('.condition-group');
          const container = group.querySelector('.conditions-in-group');
          const condIdx = container.querySelectorAll('.condition-row').length;

          const fieldDropdownOpts = fieldOptions.length > 0
            ? fieldOptions.map(f => '<div class="condition-field-option" data-path="' + f + '">' + f + '</div>').join('')
            : '<div style="padding:12px;color:rgba(255,255,255,0.4);font-size:12px;">No upstream fields available</div>';

          const opOpts = operatorOptions.map(o => '<option value="' + o.value + '">' + o.label + '</option>').join('');

          const wrapper = document.createElement('div');
          wrapper.innerHTML =
            '<div class="and-label">AND</div>' +
            '<div class="condition-row" data-group="' + groupIdx + '" data-index="' + condIdx + '">' +
              '<div class="condition-field-container">' +
                '<div class="condition-field-input" data-group="' + groupIdx + '" data-index="' + condIdx + '" data-value="">' +
                  '<span class="placeholder">Select field...</span>' +
                '</div>' +
                '<div class="condition-field-dropdown" data-group="' + groupIdx + '" data-index="' + condIdx + '">' +
                  fieldDropdownOpts +
                '</div>' +
              '</div>' +
              '<select class="field-input condition-operator" data-group="' + groupIdx + '" data-index="' + condIdx + '">' + opOpts + '</select>' +
              '<input type="text" class="field-input condition-value-input" data-group="' + groupIdx + '" data-index="' + condIdx + '" value="" placeholder="Value" />' +
              '<button type="button" class="condition-remove" data-group="' + groupIdx + '" data-index="' + condIdx + '">&times;</button>' +
            '</div>';

          while (wrapper.firstChild) {
            container.appendChild(wrapper.firstChild);
          }
          return;
        }
      });

      // Add new OR group
      document.getElementById('add-group-btn')?.addEventListener('click', () => {
        const container = document.getElementById('condition-groups-container');
        const groupIdx = container.querySelectorAll('.condition-group').length;

        const fieldDropdownOpts = fieldOptions.length > 0
          ? fieldOptions.map(f => '<div class="condition-field-option" data-path="' + f + '">' + f + '</div>').join('')
          : '<div style="padding:12px;color:rgba(255,255,255,0.4);font-size:12px;">No upstream fields available</div>';

        const opOpts = operatorOptions.map(o => '<option value="' + o.value + '">' + o.label + '</option>').join('');

        const wrapper = document.createElement('div');
        wrapper.innerHTML =
          '<div class="or-divider">' +
            '<div class="or-divider-line"></div>' +
            '<span class="or-divider-text">OR</span>' +
            '<div class="or-divider-line"></div>' +
          '</div>' +
          '<div class="condition-group" data-group="' + groupIdx + '">' +
            '<div class="condition-group-header">' +
              '<span class="condition-group-logic">Match all</span>' +
              '<button type="button" class="condition-group-remove" data-group="' + groupIdx + '">&times;</button>' +
            '</div>' +
            '<div class="conditions-in-group" data-group="' + groupIdx + '">' +
              '<div class="condition-row" data-group="' + groupIdx + '" data-index="0">' +
                '<div class="condition-field-container">' +
                  '<div class="condition-field-input" data-group="' + groupIdx + '" data-index="0" data-value="">' +
                    '<span class="placeholder">Select field...</span>' +
                  '</div>' +
                  '<div class="condition-field-dropdown" data-group="' + groupIdx + '" data-index="0">' +
                    fieldDropdownOpts +
                  '</div>' +
                '</div>' +
                '<select class="field-input condition-operator" data-group="' + groupIdx + '" data-index="0">' + opOpts + '</select>' +
                '<input type="text" class="field-input condition-value-input" data-group="' + groupIdx + '" data-index="0" value="" placeholder="Value" />' +
                '<button type="button" class="condition-remove" data-group="' + groupIdx + '" data-index="0">&times;</button>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="add-condition-btn" data-group="' + groupIdx + '">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>' +
              ' Add Condition' +
            '</button>' +
          '</div>';

        while (wrapper.firstChild) {
          container.appendChild(wrapper.firstChild);
        }
        sendConditionsUpdate();
      });

      // Handle operator and value changes
      document.addEventListener('change', (e) => {
        if (e.target.classList.contains('condition-operator')) {
          sendConditionsUpdate();
        }
      });

      document.addEventListener('input', (e) => {
        if (e.target.classList.contains('condition-value-input')) {
          sendConditionsUpdate();
        }
      });
    `
  }

  return script
}

function generateIframeContent(node: FlowNode, upstreamFields: UpstreamField[]): string {
  const schema = getConfigSchema(node.iconName)

  const sectionsHtml = schema.sections.map((section, idx) => `
    ${idx > 0 ? '<div class="divider"></div>' : ''}
    <div class="params-header">
      <span class="params-title">${section.title}</span>
    </div>
    ${section.fields.map(field => generateFieldHtml(field, node, upstreamFields)).join('')}
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${generateStyles()}</style>
    </head>
    <body>
      <div class="tabs">
        <button class="tab active">Properties</button>
        <button class="tab">Mock Output</button>
      </div>
      ${sectionsHtml}
      <script>${generateScripts(schema, upstreamFields, node)}</script>
    </body>
    </html>
  `
}

export function NodeEditPopover({ node, open, onOpenChange, onUpdate, anchorEl, upstreamFields = [] }: NodeEditPopoverProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!node) return
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'nodeUpdate') {
        const { field, value } = event.data

        // Handle different field updates
        if (field === 'title' || field === 'summary' || field === 'owner') {
          onUpdate(node.id, { [field]: value })
        } else if (field === 'connectionType') {
          const existingConfig = node.config ?? { type: 'trigger' }
          onUpdate(node.id, {
            config: { ...existingConfig, connectionType: value } as FlowNode['config'],
          })
        } else if (field === 'testDataRaw') {
          const existingConfig = (node.config ?? { type: 'trigger' }) as { type: 'trigger'; testData?: { rawJson: string; parsedFields: [] } }
          onUpdate(node.id, {
            config: {
              ...existingConfig,
              testData: { ...existingConfig.testData, rawJson: value, parsedFields: existingConfig.testData?.parsedFields ?? [] },
            } as FlowNode['config'],
          })
        } else if (field === 'testDataParsed') {
          const existingConfig = (node.config ?? { type: 'trigger' }) as { type: 'trigger'; testData?: { rawJson: string; parsedFields: [] } }
          const parsedFields = JSON.parse(value)
          onUpdate(node.id, {
            config: {
              ...existingConfig,
              testData: { rawJson: existingConfig.testData?.rawJson ?? '', parsedFields },
            } as FlowNode['config'],
            outputSchema: { fields: parsedFields },
          })
        } else if (field === 'template') {
          const existingConfig = node.config ?? { type: 'notify' }
          const existingTemplate = (existingConfig as { template?: { template: string; channel?: string } }).template ?? { template: '', channel: '' }
          onUpdate(node.id, {
            config: {
              ...existingConfig,
              template: { ...existingTemplate, template: value },
            } as FlowNode['config'],
          })
        } else if (field === 'channel') {
          const existingConfig = node.config ?? { type: 'notify' }
          const existingTemplate = (existingConfig as { template?: { template: string; channel?: string } }).template ?? { template: '', channel: '' }
          onUpdate(node.id, {
            config: {
              ...existingConfig,
              template: { ...existingTemplate, channel: value },
            } as FlowNode['config'],
          })
        } else if (field === 'actionType') {
          const existingConfig = node.config ?? { type: 'action' }
          onUpdate(node.id, {
            config: { ...existingConfig, actionType: value } as FlowNode['config'],
          })
        } else if (field === 'lookupType') {
          const existingConfig = node.config ?? { type: 'enrich' }
          onUpdate(node.id, {
            config: { ...existingConfig, lookupType: value } as FlowNode['config'],
          })
        } else if (field === 'sourceField') {
          const existingConfig = node.config ?? { type: 'enrich' }
          onUpdate(node.id, {
            config: {
              ...existingConfig,
              sourceMappings: [{ sourceField: value, targetField: '' }],
            } as FlowNode['config'],
          })
        } else if (field === 'conditions') {
          const { logic, conditions } = JSON.parse(value)
          const existingConfig = node.config ?? { type: 'decision', conditionGroups: [] }
          onUpdate(node.id, {
            config: {
              ...existingConfig,
              conditionGroups: [{ logic, conditions }],
            } as FlowNode['config'],
          })
        } else if (field === 'conditionGroups') {
          const conditionGroups = JSON.parse(value)
          const existingConfig = node.config ?? { type: 'decision', conditionGroups: [] }
          onUpdate(node.id, {
            config: {
              ...existingConfig,
              conditionGroups,
            } as FlowNode['config'],
          })
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [node, onUpdate])

  if (!open || !node) return null
  if (typeof document === 'undefined') return null

  const nodeIcon = node.iconName ? iconMap[node.iconName] : kindMeta[node.kind].fallbackIcon

  return (
    <div
      className="fixed z-50 w-96 top-4 right-4 bottom-4 rounded-xl border border-[#2d3038] bg-[#0f1115] shadow-2xl overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#2d3038]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1a1d24] flex items-center justify-center flex-shrink-0 text-white/80">
            {nodeIcon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white truncate">{node.title}</h3>
            <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{node.summary || 'No description'}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/5"
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
            node.status === 'Ready' ? 'bg-green-500/20 text-green-400' :
            node.status === 'Draft' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {node.status}
          </span>
          <span>•</span>
          <span>{kindMeta[node.kind].label}</span>
          {node.owner && (
            <>
              <span>•</span>
              <span>{node.owner}</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        <iframe
          ref={iframeRef}
          srcDoc={generateIframeContent(node, upstreamFields)}
          style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
        />
      </div>
    </div>
  )
}
