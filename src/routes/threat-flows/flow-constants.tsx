import {
  Activity,
  Bot,
  Cpu,
  Database,
  Download,
  GitBranch,
  Hourglass,
  Layers,
  LogOut,
  MessageSquare,
  Network,
  OctagonMinus,
  Radar,
  Repeat,
  ShieldHalf,
  Sparkles,
  Split,
  Star,
  StickyNote as StickyNoteIcon,
  Ticket,
  Workflow,
} from 'lucide-react'

import type {
  KindMeta,
  PaletteGroup,
  PaletteIcon,
  StepKind,
  StepStatus,
} from './flow-types'

export const NODE_WIDTH = 280
export const NODE_HEIGHT = 150
export const MIN_SCALE = 0.5
export const MAX_SCALE = 1.8

export const iconMap: Record<PaletteIcon, React.ReactNode> = {
  if: <Workflow className="h-4 w-4" />,
  switch: <Split className="h-4 w-4" />,
  'ai-agent': <Bot className="h-4 w-4" />,
  'ai-task': <Cpu className="h-4 w-4" />,
  loop: <Repeat className="h-4 w-4" />,
  break: <OctagonMinus className="h-4 w-4" />,
  collect: <Download className="h-4 w-4" />,
  exit: <LogOut className="h-4 w-4" />,
  wait: <Hourglass className="h-4 w-4" />,
  workflow: <Workflow className="h-4 w-4" />,
  dedup: <Layers className="h-4 w-4" />,
  interact: <Network className="h-4 w-4" />,
  loading: <Activity className="h-4 w-4" />,
  transform: <GitBranch className="h-4 w-4" />,
  webhook: <Network className="h-4 w-4" />,
  notify: <Network className="h-4 w-4" />,
  enrich: <Database className="h-4 w-4" />,
  decision: <ShieldHalf className="h-4 w-4" />,
  action: <Sparkles className="h-4 w-4" />,
  trigger: <Activity className="h-4 w-4" />,
  'test-trigger': <Repeat className="h-4 w-4" />,
  'get-detection': <Radar className="h-4 w-4" />,
  'get-user': <Database className="h-4 w-4" />,
  'logic-if': <Workflow className="h-4 w-4" />,
  'logic-wait': <Hourglass className="h-4 w-4" />,
  'transform-extract': <GitBranch className="h-4 w-4" />,
  'action-ticket': <Ticket className="h-4 w-4" />,
  'action-webhook': <Network className="h-4 w-4" />,
  'action-watchlist': <Star className="h-4 w-4" />,
  'notify-slack': <MessageSquare className="h-4 w-4" />,
  'meta-comment': <StickyNoteIcon className="h-4 w-4" />,
}

export const paletteTone: Record<PaletteIcon, string> = {
  if: 'bg-[#1b2028] border-[#2d3038] text-white',
  switch: 'bg-[#1d222c] border-[#2d3038] text-white',
  'ai-agent': 'bg-[#211c2f] border-[#2d3038] text-white',
  'ai-task': 'bg-[#221c2c] border-[#2d3038] text-white',
  loop: 'bg-[#12222f] border-[#2d3038] text-white',
  break: 'bg-[#2c1a1a] border-[#2d3038] text-white',
  collect: 'bg-[#14232b] border-[#2d3038] text-white',
  exit: 'bg-[#2b1b1b] border-[#2d3038] text-white',
  wait: 'bg-[#262019] border-[#2d3038] text-white',
  workflow: 'bg-[#1a1d26] border-[#2d3038] text-white',
  dedup: 'bg-[#261e16] border-[#2d3038] text-white',
  interact: 'bg-[#1d222b] border-[#2d3038] text-white',
  loading: 'bg-[#1b222b] border-[#2d3038] text-white',
  transform: 'bg-[#14212c] border-[#2d3038] text-white',
  webhook: 'bg-[#1d222b] border-[#2d3038] text-white',
  notify: 'bg-[#1b212f] border-[#2d3038] text-white',
  enrich: 'bg-[#1c201a] border-[#2d3038] text-white',
  decision: 'bg-[#191f2b] border-[#2d3038] text-white',
  action: 'bg-[#1c211a] border-[#2d3038] text-white',
  trigger: 'bg-[#182029] border-[#2d3038] text-white',
  'test-trigger': 'bg-[#1b1f2a] border-[#2d3038] text-white',
  'get-detection': 'bg-[#15222c] border-[#2d3038] text-white',
  'get-user': 'bg-[#1d211e] border-[#2d3038] text-white',
  'logic-if': 'bg-[#191f2b] border-[#2d3038] text-white',
  'logic-wait': 'bg-[#262019] border-[#2d3038] text-white',
  'transform-extract': 'bg-[#14212c] border-[#2d3038] text-white',
  'action-ticket': 'bg-[#231d16] border-[#2d3038] text-white',
  'action-webhook': 'bg-[#1d222b] border-[#2d3038] text-white',
  'action-watchlist': 'bg-[#242016] border-[#2d3038] text-white',
  'notify-slack': 'bg-[#1b212f] border-[#2d3038] text-white',
  'meta-comment': 'bg-[#1f1f24] border-[#2d3038] text-white',
}

export const nodeIconTone: Partial<Record<PaletteIcon, string>> = {
  if: 'bg-[#163529] text-emerald-100 border-emerald-500/30',
  switch: 'bg-[#133041] text-sky-100 border-sky-500/30',
  'ai-agent': 'bg-[#251f38] text-purple-100 border-purple-500/30',
  'ai-task': 'bg-[#231c33] text-purple-100 border-purple-500/30',
  loop: 'bg-[#12314b] text-blue-100 border-blue-500/30',
  break: 'bg-[#3b1a1a] text-red-100 border-red-500/35',
  collect: 'bg-[#10363c] text-cyan-100 border-cyan-500/30',
  exit: 'bg-[#3b1b1b] text-red-100 border-red-500/30',
  wait: 'bg-[#352919] text-amber-100 border-amber-500/30',
  workflow: 'bg-[#1f2430] text-white border-white/20',
  dedup: 'bg-[#362317] text-amber-100 border-amber-500/30',
  interact: 'bg-[#192c3d] text-sky-100 border-sky-500/30',
  loading: 'bg-[#192c3d] text-sky-100 border-sky-500/30',
  transform: 'bg-[#0f2d44] text-blue-100 border-blue-500/30',
  webhook: 'bg-[#192c3d] text-sky-100 border-sky-500/30',
  notify: 'bg-[#2f2418] text-orange-100 border-orange-500/30',
  enrich: 'bg-[#2e2918] text-amber-100 border-amber-500/30',
  decision: 'bg-[#1a2741] text-indigo-100 border-indigo-500/30',
  action: 'bg-[#223119] text-lime-100 border-lime-500/30',
}

export const kindMeta: Record<StepKind, KindMeta> = {
  sensor: {
    label: 'Signal intake',
    accent: 'border-white/15 bg-white/5 text-white',
    fallbackIcon: <Radar className="h-4 w-4" />,
  },
  enrich: {
    label: 'Enrichment',
    accent: 'border-white/15 bg-white/5 text-white',
    fallbackIcon: <Database className="h-4 w-4" />,
  },
  decision: {
    label: 'Decision',
    accent: 'border-white/15 bg-white/5 text-white',
    fallbackIcon: <ShieldHalf className="h-4 w-4" />,
  },
  action: {
    label: 'Response',
    accent: 'border-white/15 bg-white/5 text-white',
    fallbackIcon: <Sparkles className="h-4 w-4" />,
  },
  notify: {
    label: 'Notify',
    accent: 'border-white/15 bg-white/5 text-white',
    fallbackIcon: <Network className="h-4 w-4" />,
  },
}

export const statusTone: Record<StepStatus, string> = {
  Ready: 'text-emerald-100 border-emerald-500/40 bg-emerald-500/10',
  Draft: 'text-amber-100 border-amber-500/40 bg-amber-500/10',
  Paused: 'text-neutral-200 border-neutral-500/40 bg-neutral-500/10',
}

export const paletteGroups: PaletteGroup[] = [
  {
    label: 'Operators',
    icon: <Workflow className="h-4 w-4" />,
    items: [
      { label: 'Collect', kind: 'sensor', icon: 'collect' },
      { label: 'Workflow', kind: 'action', icon: 'workflow' },
      { label: 'Wait', kind: 'notify', icon: 'wait' },
      { label: 'Exit', kind: 'action', icon: 'exit' },
      { label: 'Dedup', kind: 'decision', icon: 'dedup' },
      { label: 'Interact', kind: 'enrich', icon: 'interact' },
      { label: 'Transform', kind: 'enrich', icon: 'transform' },
      { label: 'Loading', kind: 'sensor', icon: 'loading' },
    ],
  },
  {
    label: 'Triggers',
    icon: <Activity className="h-4 w-4" />,
    items: [
      { label: 'Threat', kind: 'sensor', icon: 'trigger' },
      { label: 'Test', kind: 'sensor', icon: 'test-trigger' },
    ],
  },
  {
    label: 'Enrichment',
    icon: <Database className="h-4 w-4" />,
    items: [
      { label: 'Detection Details', kind: 'enrich', icon: 'get-detection' },
      { label: 'User Details', kind: 'enrich', icon: 'get-user' },
    ],
  },
  {
    label: 'Logic',
    icon: <Workflow className="h-4 w-4" />,
    items: [
      { label: 'IF Condition', kind: 'decision', icon: 'logic-if' },
      { label: 'Wait / Delay', kind: 'notify', icon: 'logic-wait' },
    ],
  },
  {
    label: 'Transform',
    icon: <GitBranch className="h-4 w-4" />,
    items: [{ label: 'Extract Field', kind: 'enrich', icon: 'transform-extract' }],
  },
  {
    label: 'Actions',
    icon: <Sparkles className="h-4 w-4" />,
    items: [
      { label: 'Update Ticket', kind: 'action', icon: 'action-ticket' },
      { label: 'Webhook Event', kind: 'notify', icon: 'action-webhook' },
      { label: 'Watchlist / IOC', kind: 'action', icon: 'action-watchlist' },
    ],
  },
  {
    label: 'Notifications',
    icon: <MessageSquare className="h-4 w-4" />,
    items: [{ label: 'Slack Notify', kind: 'notify', icon: 'notify-slack' }],
  },
  {
    label: 'Meta',
    icon: <StickyNoteIcon className="h-4 w-4" />,
    items: [{ label: 'Comment', kind: 'notify', icon: 'meta-comment' }],
  },
]
