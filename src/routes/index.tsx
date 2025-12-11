import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => <Navigate to="/threat-flow/templates" />,
})
 