import { useMemo, useState, type ReactNode } from 'react'

import { createFileRoute, Link } from '@tanstack/react-router'
import { FolderGit2, ListPlus, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { flows, type ThreatFlow } from '@/data/flows'
import { cn } from '@/lib/utils'

const badgeTone = {
  Live: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Testing: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Draft: 'bg-primary/10 text-primary border-primary/30',
} satisfies Record<ThreatFlow['status'], string>

function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-xs font-medium text-white/80',
        className,
      )}
    >
      {children}
    </span>
  )
}

export const Route = createFileRoute('/threat-flow/templates')({ component: ThreatFlowsList })

function ThreatFlowsList() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'name' | 'status' | 'coverage'>('name')

  const filteredFlows = useMemo(() => {
    const query = search.trim().toLowerCase()
    const statusOrder = { Live: 0, Testing: 1, Draft: 2 } as const

    const base = !query
      ? flows
      : flows.filter((flow) => {
          const haystack = `${flow.name} ${flow.id} ${flow.owner}`.toLowerCase()
          return haystack.includes(query)
        })

    return [...base].sort((a, b) => {
      if (sort === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sort === 'status') {
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
      }
      return (b.coverage ?? 0) - (a.coverage ?? 0)
    })
  }, [search, sort])

  return (
    <div className="min-h-screen text-white bg-transparent">
      <div className="relative w-full px-6 md:px-10 pt-12 pb-6 space-y-8">
        <div
          className="relative rounded-2xl border border-primary/20 p-8 mb-8 overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(to right bottom, oklab(0.793973 -0.0650616 -0.100488 / 0.1) 0%, oklab(0.793973 -0.0650616 -0.100488 / 0.05) 50%, rgba(0, 0, 0, 0) 100%)',
          }}
        >
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h1 className="text-primary">Threat Flow Templates</h1>
              <p className="text-lg md:text-lg max-w-4xl leading-relaxed">
                Curated, reusable flow templates spanning detection, enrichment, and response. Start
                from a proven pattern and adapt it to your environment in minutes.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/threat-flows/$flowId" params={{ flowId: 'new' }}>
                  <Button>
                    <ListPlus className="h-4 w-4 mr-2" />
                    New template
                  </Button>
                </Link>
                <Link to="/threat-flow/templates">
                  <Button variant="outline" className="border-white/15">
                    <FolderGit2 className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-[#0a0a0a] shadow-xl rounded-xl p-4">
                <CardHeader className="pb-0 px-0 pt-0">
                  <CardTitle className="text-xs text-white/70 font-normal">Published templates</CardTitle>
                </CardHeader>
                <CardContent className="flex items-baseline gap-2 pb-0 px-0">
                  <span className="text-2xl font-semibold text-white">12</span>
                  <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +2 this week
                  </span>
                </CardContent>
              </Card>
              <Card className="bg-[#0a0a0a] shadow-xl rounded-xl p-4">
                <CardHeader className="pb-0 px-0 pt-0">
                  <CardTitle className="text-xs text-white/70 font-normal">Avg. coverage</CardTitle>
                </CardHeader>
                <CardContent className="flex items-baseline gap-2 pb-0 px-0">
                  <span className="text-2xl font-semibold text-white">83%</span>
                  <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +4% MoM
                  </span>
                </CardContent>
              </Card>
              <Card className="bg-[#0a0a0a] shadow-xl rounded-xl p-4">
                <CardHeader className="pb-0 px-0 pt-0">
                  <CardTitle className="text-xs text-white/70 font-normal">Active installs</CardTitle>
                </CardHeader>
                <CardContent className="flex items-baseline gap-2 pb-0 px-0">
                  <span className="text-2xl font-semibold text-white">18</span>
                </CardContent>
              </Card>
              <Card className="bg-[#0a0a0a] shadow-xl rounded-xl p-4">
                <CardHeader className="pb-0 px-0 pt-0">
                  <CardTitle className="text-xs text-white/70 font-normal">MTTD last 24h</CardTitle>
                </CardHeader>
                <CardContent className="flex items-baseline gap-2 pb-0 px-0">
                  <span className="text-2xl font-semibold text-white">3m 20s</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates by name, ID, or owner"
              className="w-full text-sm"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="border rounded-md px-3 py-2 text-sm text-white"
              >
                <option value="name">Name A → Z</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFlows.map((flow) => (
              <Card key={flow.id} className="border bg-transparent shadow-none rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-white/60">{flow.id}</span>
                      <Separator orientation="vertical" className="h-6 bg-white/10" />
                    </div>
                    <span
                      className={cn(
                        'rounded-full border px-1.5 py-0 text-[12px] font-medium',
                        badgeTone[flow.status as keyof typeof badgeTone],
                      )}
                    >
                      {flow.status}
                    </span>
                  </div>
                  <CardTitle className="text-lg text-white">{flow.name}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                      {flow.installs}
                    </div>
                  </div>
                  <p className="text-sm text-white/70">
                    Maintainer
                    <span className="ml-2 inline-block rounded-full bg-white/10 border border-white/15 px-2 py-0.5 text-xs text-white/80 font-mono">
                      {flow.owner}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 text-sm text-white/70">Updated {flow.updated}</div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {flow.signals.map((signal) => (
                      <Pill key={signal}>{signal}</Pill>
                    ))}
                  </div>
                  <hr className="my-4 border-white/10" />
                  <div className="flex">
                    <Link to="/threat-flows/$flowId" params={{ flowId: flow.id }} className="w-full">
                      <Button className="w-full" size="sm">
                        Set up template
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

