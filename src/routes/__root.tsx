import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'

import { AppSidebar, Topbar } from '../components/Header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootLayout,
  shellComponent: RootDocument,
})

function RootLayout() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen text-white" style={{ width: '100%', background: '#0a0a0a' }}>
        <AppSidebar />
        <SidebarInset className="flex flex-col w-full bg-transparent">
          <Topbar />
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="dark text-white bg-[#0a0a0a]">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
