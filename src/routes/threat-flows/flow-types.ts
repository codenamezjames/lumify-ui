import type { ReactNode } from 'react'

export type StepKind = 'sensor' | 'enrich' | 'decision' | 'action' | 'notify'
export type StepStatus = 'Ready' | 'Draft' | 'Paused'
export type Edge = { from: string; to: string; label?: string }

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
