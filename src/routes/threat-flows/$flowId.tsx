import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Activity,
  Bot,
  Cpu,
  Database,
  Download,
  GitBranch,
  Grid,
  Hourglass,
  Layers,
  LogOut,
  Network,
  OctagonMinus,
  Play,
  MessageSquare,
  StickyNote as StickyNoteIcon,
  Ticket,
  Star,
  Radar,
  Repeat,
  Search,
  ShieldHalf,
  Sparkles,
  Split,
  Workflow,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { flows } from '@/data/flows'
import { cn } from '@/lib/utils'

type StepKind = 'sensor' | 'enrich' | 'decision' | 'action' | 'notify'
type StepStatus = 'Ready' | 'Draft' | 'Paused'
type Edge = { from: string; to: string; label?: string }
type PaletteIcon =
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
type InfoNote = { id: string; title?: string; body: string; x: number; y: number; width?: number }
type InfoBoardState = { x: number; y: number }

type FlowNode = {
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

const NODE_WIDTH = 280
const NODE_HEIGHT = 150
const MIN_SCALE = 0.5
const MAX_SCALE = 1.8

const iconMap: Record<PaletteIcon, ReactNode> = {
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

const paletteTone: Record<PaletteIcon, string> = {
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

const nodeIconTone: Partial<Record<PaletteIcon, string>> = {
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

const kindMeta: Record<
  StepKind,
  {
    label: string
    accent: string
    fallbackIcon: ReactNode
  }
> = {
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

const statusTone: Record<StepStatus, string> = {
  Ready: 'text-emerald-100 border-emerald-500/40 bg-emerald-500/10',
  Draft: 'text-amber-100 border-amber-500/40 bg-amber-500/10',
  Paused: 'text-neutral-200 border-neutral-500/40 bg-neutral-500/10',
}

const paletteGroups: {
  label: string
  icon: ReactNode
  items: { label: string; kind: StepKind; icon: PaletteIcon }[]
}[] = [
  {
    label: 'Triggers',
    icon: <Activity className="h-4 w-4" />,
    items: [
      { label: 'Threat Event Trigger', kind: 'sensor', icon: 'trigger' },
      { label: 'Manual / Test Run Trigger', kind: 'sensor', icon: 'test-trigger' },
    ],
  },
  {
    label: 'Enrichment',
    icon: <Database className="h-4 w-4" />,
    items: [
      { label: 'Get Detection Details', kind: 'enrich', icon: 'get-detection' },
      { label: 'Get User Details', kind: 'enrich', icon: 'get-user' },
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
      { label: 'Send Webhook Event', kind: 'notify', icon: 'action-webhook' },
      { label: 'Add to Watchlist / IOC', kind: 'action', icon: 'action-watchlist' },
    ],
  },
  {
    label: 'Notifications',
    icon: <MessageSquare className="h-4 w-4" />,
    items: [{ label: 'Slack Notification', kind: 'notify', icon: 'notify-slack' }],
  },
  {
    label: 'Meta',
    icon: <StickyNoteIcon className="h-4 w-4" />,
    items: [{ label: 'Comment / Annotation', kind: 'notify', icon: 'meta-comment' }],
  },
]

export const Route = createFileRoute('/threat-flows/$flowId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { flowId } = Route.useParams()
  const baseFlow = useMemo(() => flows.find((f) => f.id === flowId), [flowId])

  const [flowMeta, setFlowMeta] = useState(() => ({
    name: baseFlow?.name ?? 'New threat flow',
    owner: baseFlow?.owner ?? 'Detection Engineer',
    severity: baseFlow?.severity ?? 'High',
    status: baseFlow?.status ?? 'Draft',
    signals: baseFlow?.signals ?? ['EDR', 'IAM', 'Email'],
  }))

  const [paletteSearch, setPaletteSearch] = useState('')
  const [nodes, setNodes] = useState<FlowNode[]>(() => seedNodes(baseFlow))
  const [edges, setEdges] = useState<Edge[]>(() => seedEdges(seedNodes(baseFlow)))
  const [selectedId, setSelectedId] = useState<string | null>(() => nodes[0]?.id ?? null)
  const [paletteOpen, setPaletteOpen] = useState(true)
  const [stickyState, setStickyState] = useState<InfoBoardState>({ x: 900, y: 660 })
  const [infoNotesState, setInfoNotesState] = useState<InfoNote[]>([
    {
      id: 'note-trigger',
      title: 'Trigger mapping',
      body: 'Match the trigger to an identifier in the incoming payload.',
      x: 900,
      y: 40,
      width: 260,
    },
    {
      id: 'note-setup',
      title: 'Integration setup',
      body: 'Notify Slack if a new IOC is generated; keep mappings in sync.',
      x: 900,
      y: 170,
      width: 260,
    },
    {
      id: 'note-detections',
      title: 'Detection fetch',
      body: 'Pull detections for the incident using a filter based on device id.',
      x: 900,
      y: 320,
      width: 260,
    },
    {
      id: 'note-hashes',
      title: 'Hash lookup',
      body: 'If detections are found, inspect behaviors for SHA256 hashes.',
      x: 900,
      y: 500,
      width: 260,
    },
  ])
  const stickyDragRef = useRef<{ offsetX: number; offsetY: number } | null>(null)
  const infoNoteDragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 })
  const panDragRef = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
    active: boolean
  } | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    id: string
    offsetX: number
    offsetY: number
  } | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 700 })

  useEffect(() => {
    const nextNodes = seedNodes(baseFlow)
    const nextEdges = seedEdges(nextNodes)
    setNodes(nextNodes)
    setEdges(nextEdges)
    setSelectedId(nextNodes[0]?.id ?? null)
    setFlowMeta((prev) => ({
      ...prev,
      name: baseFlow?.name ?? 'New threat flow',
      owner: baseFlow?.owner ?? 'Detection Engineer',
      severity: baseFlow?.severity ?? 'High',
      status: baseFlow?.status ?? 'Draft',
      signals: baseFlow?.signals ?? ['EDR', 'IAM', 'Email'],
    }))
  }, [baseFlow, flowId])

  useEffect(() => {
    if (!canvasRef.current) return
    const updateSize = () => {
      const bounds = canvasRef.current
      if (!bounds) return
      setCanvasSize({ width: bounds.clientWidth, height: bounds.clientHeight })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragRef.current || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
    const x = clamp(event.clientX - rect.left - dragRef.current.offsetX, 12, rect.width - NODE_WIDTH - 12)
    const y = clamp(event.clientY - rect.top - dragRef.current.offsetY, 12, rect.height - NODE_HEIGHT - 12)
      setNodes((prev) =>
        prev.map((node) => (node.id === dragRef.current?.id ? { ...node, x, y } : node)),
      )
    }

    const onUp = () => {
      dragRef.current = null
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  useEffect(() => {
    if (selectedId && !nodes.some((node) => node.id === selectedId)) {
      setSelectedId(nodes[0]?.id ?? null)
    }
  }, [nodes, selectedId])

  const addStep = (kind: StepKind, overrides?: Partial<FlowNode>) => {
    const layoutOffset = nodes.length * 230
    const newNode: FlowNode = {
      id: crypto.randomUUID?.() ?? `node-${Date.now()}`,
      kind,
      iconName: overrides?.iconName,
      title: overrides?.title ?? defaultTitle(kind, nodes.length + 1),
      summary: overrides?.summary ?? defaultSummary(kind),
      owner: flowMeta.owner,
      signals: [flowMeta.signals[0] ?? 'Telemetry'],
      status: 'Draft',
      x: 220 + ((nodes.length % 2) * (NODE_WIDTH + 100)),
      y: 180 + layoutOffset,
    }
    setNodes((prev) => [...prev, newNode])
    setEdges((prev) =>
      prev.length === 0
        ? [{ from: newNode.id, to: newNode.id }]
        : [...prev, { from: prev[prev.length - 1].to, to: newNode.id }],
    )
    setSelectedId(newNode.id)
  }

  const removeStep = (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id))
    setEdges((prev) => prev.filter((edge) => edge.from !== id && edge.to !== id))
  }

  const snapToGrid = () => {
    setNodes((prev) => normalizeLayout(prev, canvasSize.width))
  }

  const onStartDrag = (id: string, event: React.PointerEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    const node = nodes.find((n) => n.id === id)
    if (!rect || !node) return
    dragRef.current = {
      id,
      offsetX: event.clientX - rect.left - node.x,
      offsetY: event.clientY - rect.top - node.y,
    }
  }

  const onStickyDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    stickyDragRef.current = {
      offsetX: event.clientX - rect.left - stickyState.x,
      offsetY: event.clientY - rect.top - stickyState.y,
    }
  }

  const onInfoNoteDragStart = (id: string, event: React.PointerEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const note = infoNotesState.find((n) => n.id === id)
    if (!note) return
    infoNoteDragRef.current = {
      id,
      offsetX: event.clientX - rect.left - note.x,
      offsetY: event.clientY - rect.top - note.y,
    }
  }

  const isCanvasInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false
    if (target.closest('button, a, input, textarea, select, option')) return true
    return Boolean(target.closest('[data-canvas-interactive="true"]'))
  }

  const onPanPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const isMiddle = event.button === 1
    const withShift = event.shiftKey
    const isPrimary = event.button === 0
    const isInteractiveTarget = isCanvasInteractiveTarget(event.target)
    const shouldPan = isMiddle || withShift || (isPrimary && !isInteractiveTarget)
    if (!shouldPan) return
    event.preventDefault()
    panDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: viewport.x,
      originY: viewport.y,
      active: true,
    }
  }

  const onCanvasWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const cursorX = event.clientX - rect.left
    const cursorY = event.clientY - rect.top

    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      event.preventDefault()
      const worldX = (cursorX - viewport.x) / viewport.scale
      const worldY = (cursorY - viewport.y) / viewport.scale
      const nextScale = clamp(
        viewport.scale * (event.deltaY < 0 ? 1.05 : 0.95),
        MIN_SCALE,
        MAX_SCALE,
      )
      const nextX = cursorX - worldX * nextScale
      const nextY = cursorY - worldY * nextScale
      setViewport({ x: nextX, y: nextY, scale: nextScale })
      return
    }

    setViewport((prev) => ({
      ...prev,
      x: prev.x - event.deltaX,
      y: prev.y - event.deltaY,
    }))
  }

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()

      if (stickyDragRef.current) {
        const x = clamp(
          event.clientX - rect.left - stickyDragRef.current.offsetX,
          8,
          rect.width - 340,
        )
        const y = clamp(event.clientY - rect.top - stickyDragRef.current.offsetY, 8, rect.height - 200)
        setStickyState({ x, y })
      }

      if (infoNoteDragRef.current) {
        const currentId = infoNoteDragRef.current.id
        const x = clamp(
          event.clientX - rect.left - infoNoteDragRef.current.offsetX,
          8,
          rect.width - 320,
        )
        const y = clamp(event.clientY - rect.top - infoNoteDragRef.current.offsetY, 8, rect.height - 220)
        setInfoNotesState((prev) =>
          prev.map((note) => (note.id === currentId ? { ...note, x, y } : note)),
        )
      }

      if (panDragRef.current?.active) {
        setViewport((prev) => ({
          ...prev,
          x: panDragRef.current!.originX + (event.clientX - panDragRef.current!.startX),
          y: panDragRef.current!.originY + (event.clientY - panDragRef.current!.startY),
        }))
      }
    }
    const onUp = () => {
      stickyDragRef.current = null
      infoNoteDragRef.current = null
      if (panDragRef.current) {
        panDragRef.current.active = false
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  const filteredPaletteGroups = paletteGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(paletteSearch.trim().toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0 || !paletteSearch.trim())

  return (
    <div className="fixed inset-0 z-[2147483000] isolate bg-neutral-950 text-white overflow-hidden">
      <div className="fixed left-0 right-0 top-0 z-[2147483001] flex flex-wrap items-center justify-between gap-3 border-b border-[#2d3038] bg-neutral-950 px-4 py-3">
        <div className="flex items-center gap-3 text-sm">
          <Link to="/threat-flows">
            <Button size="sm" variant="outline" className="border-[#2d3038] bg-[#14161c]">
              Back to threat flows
            </Button>
          </Link>
        </div>
        <div className="flex flex-1 min-w-[260px] items-center gap-3 text-sm">
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">New threat flow</div>
            <div className="text-xs text-white/60">
              Drag-and-drop canvas — visually map detections and actions.
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" className="gap-2">
            <Play className="h-4 w-4" />
            Pretend run
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 border-[#2d3038] bg-[#14161c]"
            onClick={snapToGrid}
          >
            <Grid className="h-4 w-4" />
            Auto layout
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 border-[#2d3038] bg-[#14161c]"
            disabled={!selectedId}
            onClick={() => selectedId && removeStep(selectedId)}
          >
            Remove selected
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-[#2d3038] bg-[#14161c]"
            onClick={() => setPaletteOpen((v) => !v)}
          >
            {paletteOpen ? 'Hide steps' : 'Show steps'}
          </Button>
        </div>
      </div>

      <div className="relative h-full w-full max-w-none px-0 pb-0 pt-16 overflow-hidden flex flex-col">

        {paletteOpen && (
          <div className="fixed left-4 top-28 z-20 hidden h-[calc(100vh-140px)] w-80 flex-shrink-0 overflow-hidden rounded-xl border-[#2d3038] bg-[#0f1115]/95 shadow-[0_14px_40px_rgba(0,0,0,0.5)] backdrop-blur md:block">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-sm font-semibold text-white">Steps</div>
                <Badge className="bg-white/10 text-white/80">Palette</Badge>
              </div>
              <div className="px-4 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                  <Input
                    value={paletteSearch}
                    onChange={(e) => setPaletteSearch(e.target.value)}
                    placeholder="Search steps"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                {filteredPaletteGroups.map((group) => (
                  <div key={group.label} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/50">
                      {group.icon}
                      {group.label}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {group.items.map((item) => (
                        <button
                          key={item.label}
                          onClick={() =>
                            addStep(item.kind, { title: item.label, iconName: item.icon })
                          }
                          className={cn(
                            'group flex h-20 w-full flex-col items-center justify-center rounded-lg border px-2 py-2 text-center text-xs transition hover:border-white/50 hover:shadow-[0_10px_20px_rgba(0,0,0,0.45)]',
                            paletteTone[item.icon],
                          )}
                        >
                          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
                            {iconMap[item.icon]}
                          </div>
                          <div className="leading-tight text-white">{item.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={cn('flex-1 transition-all flex flex-col', paletteOpen ? 'md:pl-0' : 'md:pl-2')}>
            <Card className="flex-1 border-white/15 bg-black/35 backdrop-blur p-0">
              <CardContent className="flex-1 p-0 flex flex-col">

                <div
                  className="relative flex-1 overflow-hidden rounded-b-2xl border-t border-[#2d3038] bg-[radial-gradient(circle_at_1px_1px,#2b2c33_1px,transparent_0)] bg-[length:18px_18px] cursor-grab active:cursor-grabbing"
                  onWheel={onCanvasWheel}
                  onPointerDown={onPanPointerDown}
                >
                  <div
                    ref={canvasRef}
                    className="relative h-full w-full"
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        transform: `translate(${viewport.x + (paletteOpen ? 320 : 0)}px, ${viewport.y}px) scale(${viewport.scale})`,
                        transformOrigin: '0 0',
                      }}
                    >
                      {infoNotesState.map((note) => (
                        <div
                          key={note.id}
                          className="absolute cursor-grab rounded-xl border border-[#2d3038] bg-[#0f1116] px-4 py-3 text-sm text-white/75 shadow-[0_10px_30px_rgba(0,0,0,0.45)] active:cursor-grabbing"
                          style={{
                            left: note.x,
                            top: note.y,
                            width: note.width ?? 260,
                          }}
                          data-canvas-interactive="true"
                          onPointerDown={(e) => onInfoNoteDragStart(note.id, e)}
                        >
                          {note.title && (
                            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                              {note.title}
                            </div>
                          )}
                          <div className="leading-relaxed">{note.body}</div>
                        </div>
                      ))}

                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        width={canvasSize.width}
                        height={canvasSize.height}
                      >
                        {edges.map((edge) => {
                          const from = nodes.find((n) => n.id === edge.from)
                          const to = nodes.find((n) => n.id === edge.to)
                          if (!from || !to) return null
                          const startX = from.x + NODE_WIDTH / 2
                          const startY = from.y + NODE_HEIGHT
                          const endX = to.x + NODE_WIDTH / 2
                          const endY = to.y
                          const midY = (startY + endY) / 2
                          return (
                            <g key={`${edge.from}-${edge.to}`}>
                              <path
                                d={`M ${startX} ${startY} C ${startX} ${midY} ${endX} ${midY} ${endX} ${endY}`}
                                fill="none"
                                className="stroke-[#5a606e]"
                                strokeWidth={2}
                                strokeDasharray="6 8"
                              />
                              {edge.label && (
                                <text
                                  x={(startX + endX) / 2}
                                  y={midY - 6}
                                  textAnchor="middle"
                                  className="fill-white/70 text-[11px]"
                                >
                                  {edge.label}
                                </text>
                              )}
                              <circle
                                cx={endX}
                                cy={endY}
                                r={5}
                                className="fill-[#f97316]"
                              />
                            </g>
                          )
                        })}
                      </svg>

                      {edges.map((edge) => {
                        const from = nodes.find((n) => n.id === edge.from)
                        const to = nodes.find((n) => n.id === edge.to)
                        if (!from || !to) return null
                        const startX = from.x + NODE_WIDTH / 2
                        const startY = from.y + NODE_HEIGHT
                        const endX = to.x + NODE_WIDTH / 2
                        const endY = to.y
                        return (
                          <button
                            key={`plus-${edge.from}-${edge.to}`}
                            className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#3a3d45] bg-[#11131a] text-white/80 shadow-md backdrop-blur transition hover:border-white/50 hover:text-white"
                            style={{
                              left: (startX + endX) / 2,
                              top: (startY + endY) / 2,
                            }}
                            aria-label="Insert step"
                            type="button"
                            data-canvas-interactive="true"
                          >
                            +
                          </button>
                        )
                      })}

                      {nodes.map((node) => (
                        <div
                          key={node.id}
                          role="button"
                          onPointerDown={(event) => {
                            onStartDrag(node.id, event)
                            setSelectedId(node.id)
                          }}
                          onClick={() => setSelectedId(node.id)}
                        className={cn(
                          'absolute select-none rounded-xl border shadow-[0_10px_25px_rgba(0,0,0,0.45)] transition will-change-transform',
                          'bg-[#0f1014]',
                          selectedId === node.id
                            ? 'border-[#f97316] ring-2 ring-[#f97316]/50'
                            : 'border-[#2d3038] hover:border-white/40',
                        )}
                        style={{
                          width: NODE_WIDTH,
                          height: NODE_HEIGHT,
                          transform: `translate(${node.x}px, ${node.y}px)`,
                        }}
                          data-canvas-interactive="true"
                      >
                          <div className="flex items-center justify-between border-b border-[#2d3038] px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'flex h-8 w-8 items-center justify-center rounded-md border text-white',
                                  node.iconName && nodeIconTone[node.iconName]
                                    ? nodeIconTone[node.iconName]
                                    : 'border-white/15 bg-white/10 text-white',
                                )}
                              >
                                {node.iconName ? iconMap[node.iconName] : kindMeta[node.kind].fallbackIcon}
                              </div>
                              <div className="flex flex-col leading-tight">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                                  {kindMeta[node.kind].label}
                                </span>
                                <span className="text-[12px] font-semibold text-white">{node.title}</span>
                              </div>
                            </div>
                            <Badge className={cn('text-[11px] font-medium', statusTone[node.status])}>
                              {node.status}
                            </Badge>
                          </div>
                          <div className="space-y-3 p-3">
                            <div className="text-sm font-semibold leading-tight text-white">{node.title}</div>
                            <div className="text-xs text-white/65 truncate">{node.summary}</div>
                          <div className="flex flex-wrap gap-1.5 max-w-full">
                              {node.signals.map((signal) => (
                                <Badge key={signal} className="border-white/10 bg-white/5 text-[11px] text-white">
                                  {signal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      <StickyNote
                        title="Metadata check"
                        body="Need to see if this is pulling the metadata yet. It was broken after the outage."
                        position={stickyState}
                        onDragStart={onStickyDragStart}
                        width={260}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function defaultSummary(kind: StepKind) {
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

function defaultTitle(kind: StepKind, index: number) {
  const base =
    {
      sensor: 'Collect signals',
      enrich: 'Enrich context',
      decision: 'Decision gate',
      action: 'Respond',
      notify: 'Notify & log',
    } as const
  return `${base[kind]} #${index}`
}

function seedNodes(flow: (typeof flows)[number] | undefined): FlowNode[] {
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

function seedEdges(seed: FlowNode[]): Edge[] {
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

function normalizeLayout(nodes: FlowNode[], width: number) {
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

function StickyNote({
  title,
  body,
  position,
  width = 280,
  onDragStart,
}: {
  title: string
  body: string
  position: { x: number; y: number }
  width?: number
  onDragStart: (event: React.PointerEvent<HTMLDivElement>) => void
}) {
  return (
    <div
      className="absolute cursor-grab rounded-xl border border-[#2d3038] bg-[#0f1116] px-4 py-3 text-sm text-white/75 shadow-[0_10px_30px_rgba(0,0,0,0.45)] active:cursor-grabbing"
      style={{ left: position.x, top: position.y, width }}
      onPointerDown={onDragStart}
      data-canvas-interactive="true"
    >
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/60">
        {title}
      </div>
      <div className="leading-relaxed">{body}</div>
    </div>
  )
}
