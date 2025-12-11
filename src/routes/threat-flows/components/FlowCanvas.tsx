import { useMemo, type MutableRefObject } from 'react'
import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { NODE_HEIGHT, NODE_WIDTH, iconMap, kindMeta, nodeIconTone, statusTone } from '../flow-constants'
import type { Edge, FlowNode, InfoBoardState, InfoNote, ViewportState } from '../flow-types'
import { StickyNote } from './StickyNote'

type FlowCanvasProps = {
  nodes: FlowNode[]
  edges: Edge[]
  infoNotes: InfoNote[]
  stickyPosition: InfoBoardState
  selectedId: string | null
  viewport: ViewportState
  canvasSize: { width: number; height: number }
  canvasRef: MutableRefObject<HTMLDivElement | null>
  onCanvasWheel: (event: React.WheelEvent<HTMLDivElement>) => void
  onPanPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
  onStartDrag: (id: string, event: React.PointerEvent<HTMLDivElement>) => void
  onStickyDragStart: (event: React.PointerEvent<HTMLDivElement>) => void
  onInfoNoteDragStart: (id: string, event: React.PointerEvent<HTMLDivElement>) => void
  onSelectNode: (id: string) => void
  onRemoveNode: (id: string) => void
}

export function FlowCanvas({
  nodes,
  edges,
  infoNotes,
  stickyPosition,
  selectedId,
  viewport,
  canvasSize,
  canvasRef,
  onCanvasWheel,
  onPanPointerDown,
  onStartDrag,
  onStickyDragStart,
  onInfoNoteDragStart,
  onSelectNode,
  onRemoveNode,
}: FlowCanvasProps) {
  const transformStyle = useMemo(
    () => ({
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
      transformOrigin: '0 0',
    }),
    [viewport.scale, viewport.x, viewport.y],
  )

  return (
    <Card className="h-full flex-1 border-white/15 bg-black/35 backdrop-blur p-0">
      <CardContent className="h-full flex-1 p-0 flex flex-col">
        <div
          className="relative flex-1 overflow-hidden rounded-b-2xl border-t border-[#2d3038] bg-[radial-gradient(circle_at_1px_1px,#2b2c33_1px,transparent_0)] bg-[length:18px_18px] cursor-grab active:cursor-grabbing"
          onWheel={onCanvasWheel}
          onPointerDown={onPanPointerDown}
        >
          <div ref={canvasRef} className="relative h-full w-full">
            <div className="absolute inset-0" style={transformStyle}>
              {infoNotes.map((note) => (
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

              <svg className="pointer-events-none absolute inset-0 h-full w-full" width={canvasSize.width} height={canvasSize.height}>
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
                        className="stroke-[#4a4f5d]"
                        strokeWidth={2}
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
                      <circle cx={endX} cy={endY} r={5} className="fill-[#f97316]" />
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
                    className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#262a34] bg-[#0f1118] text-white/80 shadow-md backdrop-blur transition hover:border-white/50 hover:text-white"
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
                    onSelectNode(node.id)
                  }}
                  onClick={() => onSelectNode(node.id)}
                  className={cn(
                    'absolute select-none rounded-xl border shadow-[0_12px_28px_rgba(0,0,0,0.55)] transition will-change-transform',
                    'bg-[#0c0e15] border-[#1c1f27]',
                    selectedId === node.id
                      ? 'border-[#f97316] ring-1 ring-[#f97316]/25 shadow-[0_12px_28px_rgba(249,115,22,0.18)]'
                      : 'hover:border-[#2f3440]',
                  )}
                  style={{
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT,
                    transform: `translate(${node.x}px, ${node.y}px)`,
                  }}
                  data-canvas-interactive="true"
                >
                  <div className="flex flex-col gap-3 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg border text-white',
                            node.iconName && nodeIconTone[node.iconName]
                              ? nodeIconTone[node.iconName]
                              : 'border-white/10 bg-white/5 text-white',
                          )}
                        >
                          {node.iconName ? iconMap[node.iconName] : kindMeta[node.kind].fallbackIcon}
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-semibold text-white">{node.title}</span>
                          <span className="text-[11px] uppercase tracking-wide text-white/60">
                            {kindMeta[node.kind].label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={cn('text-[11px] font-medium', statusTone[node.status])}>{node.status}</Badge>
                        <button
                          type="button"
                          aria-label="Remove node"
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-[#262a34] bg-[#0f1118] text-white/70 hover:border-white/40 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemoveNode(node.id)
                          }}
                          data-canvas-interactive="true"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-white/70 leading-snug line-clamp-2">{node.summary}</div>

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
                position={stickyPosition}
                onDragStart={onStickyDragStart}
                width={260}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
