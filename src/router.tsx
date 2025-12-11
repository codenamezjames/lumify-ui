import { createRouter, type History } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = (opts?: { history?: History; basepath?: string }) => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    history: opts?.history,
    basepath: opts?.basepath,
  })

  return router
}
