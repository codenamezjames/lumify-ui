# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ShieldVision is a threat flow visualization and management application built with TanStack Start (React-based SSR framework), Vite, and Tailwind CSS v4. The application supports both SSR (server-side rendered) and SPA (single-page application) build modes.

## Development Commands

```bash
# Development
npm install           # Install dependencies
npm run dev          # Start dev server on port 3000

# Building
npm run build        # Build SSR application (default)
npm run build:spa    # Build SPA with hash routing (outputs to dist/)
npm run preview      # Preview production build

# Testing
npm run test         # Run all tests with Vitest
```

Note: There is no separate command to run a single test file. Use `npm run test` with Vitest's CLI arguments if needed.

## Architecture Overview

### Dual Build System

This project supports two build configurations:

1. **SSR Mode** (default): Uses TanStack Start with Nitro for server-side rendering
   - Config: [vite.config.ts](vite.config.ts)
   - Entry: Standard TanStack Start setup
   - Plugins: `tanstackStart()`, `nitro()`, devtools

2. **SPA Mode**: Pure client-side single-page application
   - Config: [vite.spa.config.ts](vite.spa.config.ts)
   - Entry: [src/spa.tsx](src/spa.tsx)
   - Uses hash-based routing (`createHashHistory`)
   - Node module stubs: `node:async_hooks`, `node:fs`, `fs` aliased to [src/empty.js](src/empty.js)
   - Base path: `/lumify-ui/` (configurable via `VITE_PUBLIC_BASE`)

### Routing Architecture

- **File-based routing** via TanStack Router
- Routes are defined in [src/routes/](src/routes/)
- Generated route tree: [src/routeTree.gen.ts](src/routeTree.gen.ts) (auto-generated, do not edit)
- Router factory: [src/router.tsx](src/router.tsx) - supports custom history and basepath
- Root layout: [src/routes/__root.tsx](src/routes/__root.tsx)

### Layout Structure

The app uses a persistent sidebar layout defined in `__root.tsx`:
- `SidebarProvider` wraps the entire app
- `AppSidebar` - collapsible navigation sidebar
- `Topbar` - top navigation bar with user avatar
- Content rendered in `SidebarInset`
- Dark theme enforced at root level (`.dark` class, `bg-[#0a0a0a]`)

### Feature Organization

Features are organized in [src/features/](src/features/) with co-located components:

**Threat Flows Feature** ([src/features/threat-flows/](src/features/threat-flows/)):
- Visual flow diagram builder with drag-and-drop nodes
- Main component: `FlowCanvas` - handles node rendering, panning, zooming, edge drawing
- Related route files in [src/routes/threat-flows/](src/routes/threat-flows/)
- Flow state management in route component ([src/routes/threat-flows/$flowId.tsx](src/routes/threat-flows/$flowId.tsx)):
  - Node/edge state
  - Viewport state (pan, zoom)
  - Info notes (sticky notes on canvas)
  - Drag interactions for nodes, sticky notes, and canvas panning

### UI Component System

- **shadcn/ui components** in [src/components/ui/](src/components/ui/)
- Built on Radix UI primitives
- Styled with Tailwind CSS v4
- Utility function `cn()` in [src/lib/utils.ts](src/lib/utils.ts) merges Tailwind classes

### Path Aliases

TypeScript path alias `@/*` maps to `./src/*` (configured in [tsconfig.json](tsconfig.json)):
```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

## Key Technical Patterns

### Route File Structure

Routes follow TanStack Router conventions:
- `index.tsx` - index route
- `$param.tsx` - dynamic parameter route
- `__root.tsx` - root layout component

### State Management

- No external state library (Zustand, Redux, etc.)
- Component-level state with React hooks
- Complex interactions (threat flows) use multiple `useState` and `useRef` hooks
- Viewport/drag state managed via refs to avoid re-renders

### Canvas Interaction Pattern

The threat flow canvas implements:
1. **Pan**: Background drag moves viewport
2. **Zoom**: Mouse wheel adjusts scale (clamped between MIN_SCALE/MAX_SCALE)
3. **Node drag**: Individual node positioning
4. **Sticky note drag**: Info notes with independent positioning

All interactions use pointer events and manage offset calculations via refs.

## Styling

- **Tailwind CSS v4** (uses `@tailwindcss/vite` plugin)
- Main stylesheet: [src/styles.css](src/styles.css)
- Dark theme with custom color palette (`border-white/10`, `bg-white/5`, etc.)
- Component variants use `class-variance-authority`

## Data Layer

- Mock data in [src/data/](src/data/) (e.g., [flows.ts](src/data/flows.ts))
- No API integration yet
- Route loaders can be added for data fetching (see TanStack Router docs)

## Testing

- Test framework: Vitest
- Testing library: @testing-library/react
- Environment: jsdom
- No test config file present (uses Vitest defaults)
