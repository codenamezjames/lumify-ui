import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowUpRight,
  BookOpen,
  DownloadCloud,
  LayoutGrid,
  Puzzle,
  Search,
  Sparkles,
  Wand2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const templates = [
  {
    id: 'tmpl-01',
    name: 'Account Takeover Response',
    installs: '12.5k installs',
    category: 'Authentication',
    tags: ['SSO', 'Enterprise', 'SAML'],
    status: 'Installed',
    updated: 'Updated 3d ago',
    version: 'v2.4.1',
    accent: 'from-cyan-400/15 via-cyan-500/10 to-slate-900',
    actionLabel: 'Configure',
    installed: true,
  },
  {
    id: 'tmpl-02',
    name: 'Endpoint Ransomware Containment',
    installs: '8.3k installs',
    category: 'Endpoint',
    tags: ['EDR', 'Isolation', 'Response'],
    status: 'Featured',
    updated: 'Updated 1w ago',
    version: 'v1.9.0',
    accent: 'from-rose-400/15 via-purple-500/10 to-slate-900',
    actionLabel: 'Set up',
    installed: false,
  },
  {
    id: 'tmpl-03',
    name: 'Data Exfiltration Watch',
    installs: '14.1k installs',
    category: 'DLP',
    tags: ['Proxy', 'Cloud', 'Anomaly'],
    status: 'Installed',
    updated: 'Updated 2d ago',
    version: 'v3.0.2',
    accent: 'from-amber-400/15 via-orange-500/10 to-slate-900',
    actionLabel: 'Configure',
    installed: true,
  },
  {
    id: 'tmpl-04',
    name: 'Insider Threat Play',
    installs: '6.4k installs',
    category: 'Analytics',
    tags: ['UEBA', 'Behavior', 'Signals'],
    status: 'New',
    updated: 'Published today',
    version: 'v1.0.0',
    accent: 'from-emerald-400/15 via-emerald-500/10 to-slate-900',
    actionLabel: 'Set up',
    installed: false,
  },
]

export const Route = createFileRoute('/templates/')({
  component: TemplateLibrary,
})

function Stat({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <Card className="bg-slate-900/70 border-slate-800 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-slate-400 font-normal">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-5">
        <div className="text-3xl font-semibold text-white">{value}</div>
        {helper ? <p className="text-xs text-slate-500 mt-1">{helper}</p> : null}
      </CardContent>
    </Card>
  )
}

function TemplateLibrary() {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <header className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 border border-slate-800 px-3 py-1 text-sm text-slate-300">
                <LayoutGrid className="h-4 w-4 text-cyan-300" />
                Template marketplace
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
                <Badge className="bg-emerald-500/15 text-emerald-200 border-emerald-500/20">
                  Curated
                </Badge>
              </div>
              <p className="text-slate-400 max-w-2xl">
                Reusable flows that combine detections, enrichments, and responses.
                Start from a template and jump straight into the diagram editor.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/threat-flows/$flowId" params={{ flowId: 'new' }}>
                  <Button className="bg-cyan-500 text-slate-900 hover:bg-cyan-400">
                    <Sparkles className="h-4 w-4 mr-2" />
                    New template
                  </Button>
                </Link>
                <Button variant="outline" className="border-slate-800 text-slate-200">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Docs
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full lg:w-[520px]">
              <Stat label="Templates" value="24" helper="+3 this week" />
              <Stat label="Installed" value="9" helper="Active in org" />
              <Stat label="Total downloads" value="167k+" helper="Trending +12%" />
              <Stat label="New this week" value="2" helper="Fresh drops" />
            </div>
          </div>

          <Card className="border-slate-900 bg-slate-950/70">
            <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4">
              <div className="flex items-center gap-3 w-full md:w-[340px]">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search templates by name, description, or tags..."
                    className="bg-slate-900 border-slate-800 pl-10 text-slate-200 placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                <Badge variant="outline" className="bg-slate-900/80 border-slate-800">
                  Featured
                </Badge>
                <Badge variant="outline" className="bg-slate-900/80 border-slate-800">
                  New
                </Badge>
                <Badge variant="outline" className="bg-slate-900/80 border-slate-800">
                  Installed
                </Badge>
                <Badge variant="outline" className="bg-slate-900/80 border-slate-800">
                  Categories
                </Badge>
                <Button variant="ghost" className="text-slate-300">
                  Sort
                </Button>
              </div>
            </CardContent>
          </Card>
        </header>

        <section className="grid xl:grid-cols-[2fr_1fr] gap-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Badge variant="outline" className="bg-slate-900/80 border-slate-800">
                  Marketplace
                </Badge>
                <Separator orientation="vertical" className="h-6 bg-slate-900" />
                Showing {templates.length} of {templates.length} apps
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/15 text-emerald-200 border-emerald-500/20">
                  Service health 9/11
                </Badge>
                <Button variant="link" className="text-cyan-300 p-0">
                  View details
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="border-slate-800 bg-slate-900/70 hover:border-cyan-500/40 transition-colors"
                >
                  <CardHeader className="pb-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 mb-3">
                    <div className="flex items-center justify-between gap-2 text-sm text-slate-300">
                      <div className="inline-flex items-center gap-2">
                        <Puzzle className="h-4 w-4 text-cyan-300" />
                        {template.category}
                      </div>
                      <Badge variant="outline" className="border-slate-800 bg-slate-950/40 text-slate-200">
                        {template.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">{template.updated}</div>
                  </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <DownloadCloud className="h-4 w-4 text-cyan-300" />
                      {template.installs}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {template.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-slate-800 text-slate-300 bg-slate-900/60"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="border-slate-800 text-slate-300 bg-slate-900/60"
                    >
                      {template.version}
                    </Badge>
                    <Badge
                      className={
                        template.installed
                          ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/20'
                          : 'bg-slate-800/60 text-slate-200 border-slate-700'
                      }
                    >
                      {template.installed ? 'Installed' : 'Not installed'}
                    </Badge>
                    <Link to="/threat-flows/$flowId" params={{ flowId: 'new' }}>
                      <Button
                        size="sm"
                        className="ml-auto bg-cyan-500 text-slate-900 hover:bg-cyan-400"
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        {template.actionLabel}
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-slate-400">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-slate-900 bg-slate-950/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-200">Service health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-lg border border-slate-900 bg-slate-900/60 px-3 py-2">
                  <span className="text-slate-400">Services online</span>
                  <span className="text-emerald-300 font-semibold">9/11</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-900 bg-slate-900/60 px-3 py-2">
                  <span className="text-slate-400">Active issues</span>
                  <span className="text-amber-300 font-semibold">2</span>
                </div>
                <Button variant="link" className="text-cyan-300 p-0">
                  View details
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-900 bg-slate-950/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-200">Turn flows into templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <p className="text-slate-400">
                  Save a running flow as a reusable template. Custom code can be generalized or stripped
                  during export.
                </p>
                <Link to="/threat-flows/$flowId" params={{ flowId: 'new' }}>
                  <Button className="w-full bg-cyan-500 text-slate-900 hover:bg-cyan-400">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Open diagram editor
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
