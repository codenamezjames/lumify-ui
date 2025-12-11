import { useEffect, useMemo, useRef, useState } from 'react'

import { createFileRoute, Link } from '@tanstack/react-router'
import { Grid, Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { flows } from '@/data/flows'
import { cn } from '@/lib/utils'

import { FlowCanvas } from './components/FlowCanvas'
import { PaletteSidebar } from './components/PaletteSidebar'
import {
  MAX_SCALE,
  MIN_SCALE,
  NODE_HEIGHT,
  NODE_WIDTH,
  paletteGroups,
} from './flow-constants'
import { clamp, defaultSummary, defaultTitle, normalizeLayout, seedEdges, seedNodes } from './flow-utils'
import type { Edge, FlowNode, InfoBoardState, InfoNote, StepKind, ViewportState } from './flow-types'

export const Route = createFileRoute('/threat-flows/$flowId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { flowId } = Route.useParams()
  const baseFlow = useMemo(() => flows.find((f) => f.id === flowId), [flowId])
  const initialNodes = useMemo(() => seedNodes(baseFlow), [baseFlow])

  const [flowMeta, setFlowMeta] = useState(() => ({
    name: baseFlow?.name ?? 'New threat flow',
    owner: baseFlow?.owner ?? 'Detection Engineer',
    severity: baseFlow?.severity ?? 'High',
    status: baseFlow?.status ?? 'Draft',
    signals: baseFlow?.signals ?? ['EDR', 'IAM', 'Email'],
  }))

  const [paletteSearch, setPaletteSearch] = useState('')
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(() => seedEdges(initialNodes))
  const [selectedId, setSelectedId] = useState<string | null>(() => initialNodes[0]?.id ?? null)
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
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 })
  const panDragRef = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
    active: boolean
  } | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null!)
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
      const x = clamp(
        event.clientX - rect.left - dragRef.current.offsetX,
        12,
        rect.width - NODE_WIDTH - 12,
      )
      const y = clamp(
        event.clientY - rect.top - dragRef.current.offsetY,
        12,
        rect.height - NODE_HEIGHT - 12,
      )
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
          <PaletteSidebar
            paletteSearch={paletteSearch}
            onSearchChange={setPaletteSearch}
            onAddStep={addStep}
            paletteGroups={paletteGroups}
          />
        )}

        <div className={cn('flex-1 transition-all flex flex-col', paletteOpen ? 'md:pl-0' : 'md:pl-2')}>
          <FlowCanvas
            nodes={nodes}
            edges={edges}
            infoNotes={infoNotesState}
            stickyPosition={stickyState}
            selectedId={selectedId}
            viewport={viewport}
            paletteOpen={paletteOpen}
            canvasSize={canvasSize}
            canvasRef={canvasRef}
            onCanvasWheel={onCanvasWheel}
            onPanPointerDown={onPanPointerDown}
            onStartDrag={onStartDrag}
            onStickyDragStart={onStickyDragStart}
            onInfoNoteDragStart={onInfoNoteDragStart}
            onSelectNode={setSelectedId}
          />
        </div>
      </div>
    </div>
  )
}
