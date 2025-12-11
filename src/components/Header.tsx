import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  LayoutDashboard,
  LayoutGrid,
  Monitor,
  Network,
  Search,
  Shield,
  ShieldCheck,
  Users,
  Webhook,
  Workflow,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type NavGroup = {
  title: string
  items: { title: string; url: string; icon?: React.ComponentType<any> }[]
}

export function AppSidebar() {
  const navMain: NavGroup[] = useMemo(
    () => [
      {
        title: 'Data Exploration',
        items: [
          { title: 'Dashboards', url: '/dashboard', icon: LayoutDashboard },
          { title: 'Reports', url: '/reports', icon: Network },
          { title: 'Quick Search', url: '/quick-search', icon: Search },
        ],
      },
      {
        title: 'Alert Configuration',
        items: [
          { title: 'Searches', url: '/searches', icon: Shield },
          { title: 'Threat Flows', url: '/threat-flows', icon: Workflow },
        ],
      },
      {
        title: 'Endpoints',
        items: [
          { title: 'Endpoint Policies', url: '/endpoint-policies', icon: ShieldCheck },
          { title: 'Devices', url: '/endpoints', icon: Monitor },
        ],
      },
      {
        title: 'Tickets',
        items: [
          { title: 'Incidents', url: '/incidents', icon: AlertTriangle },
          { title: 'Requests', url: '/requests', icon: Workflow },
        ],
      },
      {
        title: 'Customers',
        items: [
          { title: 'Clients', url: '/clients', icon: Users },
        ],
      },
      {
        title: 'Marketplace',
        items: [
          { title: 'Integrations', url: '/integrations', icon: LayoutGrid },
          { title: 'Templates', url: '/threat-flow/templates', icon: LayoutGrid },
          { title: 'Status', url: '/status', icon: Network },
          { title: 'Secrets Management', url: '/secrets', icon: Shield },
          { title: 'Webhooks', url: '/webhooks', icon: Webhook },
        ],
      },
    ],
    [],
  )

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10">
      <SidebarHeader className="px-3 py-4">
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        {navMain.map((group, idx) => (
          <div key={group.title}>
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/60">{group.title}</SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={false}>
                      <Link to={item.url} className="text-white/80 hover:text-white">
                        {item.icon ? <item.icon className="h-4 w-4" /> : null}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            {idx < navMain.length - 1 ? <SidebarSeparator /> : null}
          </div>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export function Topbar() {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
      <SidebarTrigger className="inline-flex border border-white/10 bg-white/5 text-white/80 hover:border-primary/50" />
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-white/10 bg-white/5">
          <AvatarFallback>SV</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

export function SidebarBrand() {
  const { state } = useSidebar()

  return (
    <Link
      to="/"
      className="flex items-center gap-2 justify-start group-data-[collapsible=icon]:justify-center p-1 text-xl font-semibold uppercase leading-none"
    >
      <img
        src="/icon.svg"
        alt="ShieldVision logo"
        className={cn(
          'shrink-0 transition-all duration-200',
          state === 'collapsed' ? 'h-10 w-10' : 'h-6 w-6',
        )}
      />
      <span className={state === 'collapsed' ? 'hidden' : 'block'}>ShieldVision</span>
    </Link>
  )
}

// Legacy default export retained (renders only the topbar)
export default function Header() {
  return <Topbar />
}
