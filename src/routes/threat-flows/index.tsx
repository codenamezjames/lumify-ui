import { useMemo, useState } from 'react'

import { createFileRoute, Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Filter,
  Plus,
  Power,
  PowerOff,
  SlidersHorizontal,
  Trash,
  TrendingUp,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { flows, type ThreatFlow } from '@/data/flows'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

const statusTone: Record<ThreatFlow['status'], string> = {
  Live: 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30',
  Testing: 'text-amber-200 bg-amber-500/10 border-amber-500/30',
  Draft: 'text-primary bg-primary/10 border-primary/30',
}

type DialogType = 'enable' | 'disable' | 'delete' | null

export const Route = createFileRoute('/threat-flows/')({
  component: ThreatFlowsTablePage,
})

function ThreatFlowsTablePage() {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})
  const [dialog, setDialog] = useState<DialogType>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return flows
    return flows.filter((flow) => {
      const haystack = `${flow.name} ${flow.owner} ${flow.id} ${flow.signals.join(' ')}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [search])

  const allSelected =
    filtered.length > 0 && filtered.every((flow) => selectedIds[flow.id])
  const selectedCount = Object.values(selectedIds).filter(Boolean).length

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds({})
    } else {
      const next: Record<string, boolean> = {}
      filtered.forEach((flow) => {
        next[flow.id] = true
      })
      setSelectedIds(next)
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const resetSelection = () => setSelectedIds({})

  const closeDialog = () => setDialog(null)

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="px-6 py-6 space-y-4">
        <div className="flex flex-row gap-3">
          <h1 className="font-semibold leading-tight w-full">Threat Flow Catalog</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/threat-flows/$flowId" params={{ flowId: 'new' }}>
              <Button>
                New threat flow
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/threat-flow/templates">
              <Button>
                New threat flow from template
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-2">
                <Button variant="outline" className="border-dashed bg-white/5">
                <Plus className="h-4 w-4 mr-2" />
                Status
                </Button>
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, owner…"
                className="w-full lg:w-72"
                />
                <DropdownMenu modal={false} open={dialog !== null} onOpenChange={(open) => !open && closeDialog()}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={selectedCount === 0}>
                    Actions {selectedCount > 0 ? `(${selectedCount})` : ''}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Bulk actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDialog('enable')}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Enable
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDialog('disable')}>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Disable
                    </DropdownMenuItem>
                    <DropdownMenuItem
                    onClick={() => setDialog('delete')}
                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Columns
                </Button>
            </div>
            </div>
        </div>
          
          <Card className='bg-transparent'>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((flow) => {
                  const isSelected = !!selectedIds[flow.id]
                  return (
                    <TableRow key={flow.id} data-state={isSelected ? 'selected' : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(flow.id)}
                          aria-label={`Select ${flow.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{flow.name}</span>
                          <span className="text-xs text-white/60">{flow.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {flow.status}
                      </TableCell>
                      <TableCell className="text-white/80">{flow.updated}</TableCell>
                      <TableCell className="text-white/80">{flow.owner}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
          </Card>
      </div>

      <BulkDialog
        type={dialog}
        count={selectedCount}
        onClose={() => {
          closeDialog()
          resetSelection()
        }}
      />
    </div>
  )
}

function BulkDialog({
  type,
  count,
  onClose,
}: {
  type: DialogType
  count: number
  onClose: () => void
}) {
  const icon =
    type === 'enable' ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
    ) : type === 'disable' ? (
      <Power className="h-5 w-5 text-amber-300" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-rose-300" />
    )

  const title =
    type === 'enable'
      ? 'Enable threat flows'
      : type === 'disable'
        ? 'Disable threat flows'
        : 'Delete threat flows'

  const body =
    type === 'enable'
      ? 'This is a mocked enable flow. In production this would call the service to enable the selected flows.'
      : type === 'disable'
        ? 'This is a mocked disable flow. In production this would call the service to disable the selected flows.'
        : 'This is a mocked delete flow. In production this would remove the selected flows.'

  return (
    <Dialog open={type !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {body} ({count} selected)
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

