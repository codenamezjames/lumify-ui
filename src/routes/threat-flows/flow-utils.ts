import { flows } from '@/data/flows'

import { NODE_HEIGHT, NODE_WIDTH } from './flow-constants'
import type { Edge, FlowNode, StepKind } from './flow-types'

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function defaultSummary(kind: StepKind) {
  switch (kind) {
    case 'sensor':
      return 'Collect detections, normalize fields, and guard against noisy sources.'
    case 'enrich':
      return 'Decorate events with user, asset, and geo context; score fidelity.'
    case 'decision':
      return 'Apply thresholds, branch on confidence, and deduplicate related alerts.'
    case 'action':
      return 'Run containment, ticket, and notify responders — simulated only.'
    case 'notify':
      return 'Send updates, escalate if no acknowledgement, and log the story.'
  }
}

export function defaultTitle(kind: StepKind, index: number) {
  const base = {
    sensor: 'Collect signals',
    enrich: 'Enrich context',
    decision: 'Decision gate',
    action: 'Respond',
    notify: 'Notify & log',
  } as const
  return `${base[kind]} #${index}`
}

export function seedNodes(flow: (typeof flows)[number] | undefined): FlowNode[] {
  const signals = flow?.signals ?? ['EDR', 'IAM', 'Email']
  const baseOwner = flow?.owner ?? 'Detection Engineer'
  return [
    {
      id: 'trigger',
      title: 'Email Trigger',
      kind: 'sensor',
      summary: 'Entry point for inbound email JSON payloads.',
      owner: baseOwner,
      signals: signals.slice(0, 2),
      status: 'Ready',
      x: 420,
      y: 80,
      iconName: 'collect',
    },
    {
      id: 'if-real',
      title: 'If real email',
      kind: 'decision',
      summary: 'Branch based on real vs. test run flag.',
      owner: baseOwner,
      signals: ['Flag'],
      status: 'Ready',
      x: 420,
      y: 320,
      iconName: 'if',
    },
    {
      id: 'set-false',
      title: 'Set Run Variable',
      kind: 'action',
      summary: 'Set run type to Test. Keep scope limited.',
      owner: baseOwner,
      signals: ['Context'],
      status: 'Ready',
      x: 240,
      y: 540,
      iconName: 'workflow',
    },
    {
      id: 'set-true',
      title: 'Set Run Variable',
      kind: 'action',
      summary: 'Set run type to Real. Allow full flow.',
      owner: baseOwner,
      signals: ['Context'],
      status: 'Ready',
      x: 560,
      y: 540,
      iconName: 'workflow',
    },
    {
      id: 'arr',
      title: 'Put User Email into Array',
      kind: 'action',
      summary: 'Prep recipients for downstream utilities.',
      owner: baseOwner,
      signals: ['Email'],
      status: 'Draft',
      x: 240,
      y: 780,
      iconName: 'transform',
    },
    {
      id: 'email',
      title: 'Email Content',
      kind: 'notify',
      summary: 'Assemble email content and attachments.',
      owner: baseOwner,
      signals: ['Email'],
      status: 'Draft',
      x: 560,
      y: 780,
      iconName: 'notify',
    },
    {
      id: 'test-options',
      title: 'Test Email Options',
      kind: 'notify',
      summary: 'Customize test email template and severity.',
      owner: baseOwner,
      signals: ['Template'],
      status: 'Draft',
      x: 420,
      y: 1020,
      iconName: 'notify',
    },
  ]
}

export function seedEdges(seed: FlowNode[]): Edge[] {
  const byId = Object.fromEntries(seed.map((n) => [n.id, n]))
  const connect = (from: string, to: string, label?: string): Edge | null =>
    byId[from] && byId[to] ? { from, to, label } : null
  return [
    connect('trigger', 'if-real'),
    connect('if-real', 'set-false', 'FALSE'),
    connect('if-real', 'set-true', 'TRUE'),
    connect('set-false', 'arr'),
    connect('set-true', 'email'),
    connect('arr', 'test-options'),
    connect('email', 'test-options'),
  ].filter(Boolean) as Edge[]
}

export function normalizeLayout(nodes: FlowNode[], width: number) {
  const cols = Math.max(1, Math.floor(width / (NODE_WIDTH + 80)))
  return nodes.map((node, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    return {
      ...node,
      x: 60 + col * (NODE_WIDTH + 80),
      y: 160 + row * (NODE_HEIGHT + 170),
    }
  })
}
