import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createHashHistory } from '@tanstack/react-router'

import './styles.css'
import { getRouter } from './router'

const history = createHashHistory()
const router = getRouter({
  history,
})

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element #root not found')
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
