import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/resale/commissions')({
  component: () => <div>Commissions Page (Coming Soon)</div>,
})
