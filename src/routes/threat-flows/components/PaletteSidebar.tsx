import { ChevronLeft, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { iconMap, paletteTone } from '../flow-constants'
import type { FlowNode, PaletteGroup, StepKind } from '../flow-types'

type PaletteSidebarProps = {
  paletteSearch: string
  onSearchChange: (value: string) => void
  onAddStep: (kind: StepKind, overrides?: Partial<FlowNode>) => void
  paletteGroups: PaletteGroup[]
  onTogglePalette: () => void
  flowTitle: string
}

export function PaletteSidebar({
  paletteSearch,
  onSearchChange,
  onAddStep,
  paletteGroups,
  onTogglePalette,
  flowTitle,
}: PaletteSidebarProps) {
  const filteredPaletteGroups = paletteGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(paletteSearch.trim().toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0 || !paletteSearch.trim())

  return (
    <div className="hidden md:block sticky top-6 h-[calc(100vh-220px)] w-80 flex-shrink-0 overflow-hidden rounded-xl border border-[#1e222d] bg-[#0f1115]/95 shadow-[0_16px_36px_rgba(0,0,0,0.55)] backdrop-blur">
      <div className="flex h-full flex-col">
            <div className="px-4 pt-4 text-sm font-semibold text-white">{flowTitle || 'New threat flow'}</div>
        <div className="px-4 pb-3 pt-4">
          <div className="flex items-center gap-2">
            <div className="relative rounded-lg border border-[#1f2430] bg-[#0c0f16] px-2 py-1.5 flex-1">
            <Search className="absolute left-4 top-3 h-4 w-4 text-white/40" />
            <Input
              value={paletteSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search steps"
              className="h-9 border-0 bg-transparent pl-9 text-sm placeholder:text-white/40 focus-visible:ring-0"
            />
          </div>
            <button
              type="button"
              aria-label="Hide steps"
              onClick={onTogglePalette}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e222d] bg-[#0f1115]/95 text-white shadow-sm hover:border-white/30 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          {filteredPaletteGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/45">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#171b24] text-white/80">
                  {group.icon}
                </div>
                <span className="font-semibold">{group.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center transition hover:border-white/30 hover:bg-white/5',
                      paletteTone[item.icon],
                    )}
                    onClick={() => onAddStep(item.kind, { iconName: item.icon, title: item.label })}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                      {iconMap[item.icon]}
                    </div>
                    <div className="leading-tight text-white text-center">
                      <span className="text-[10px] font-semibold">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
