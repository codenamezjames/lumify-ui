type StickyNoteProps = {
  title: string
  body: string
  position: { x: number; y: number }
  width?: number
  onDragStart: (event: React.PointerEvent<HTMLDivElement>) => void
}

export function StickyNote({ title, body, position, width = 280, onDragStart }: StickyNoteProps) {
  return (
    <div
      className="absolute cursor-grab rounded-xl border border-[#2d3038] bg-[#0f1116] px-4 py-3 text-sm text-white/75 shadow-[0_10px_30px_rgba(0,0,0,0.45)] active:cursor-grabbing"
      style={{ left: position.x, top: position.y, width }}
      onPointerDown={onDragStart}
      data-canvas-interactive="true"
    >
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/60">{title}</div>
      <div className="leading-relaxed">{body}</div>
    </div>
  )
}
