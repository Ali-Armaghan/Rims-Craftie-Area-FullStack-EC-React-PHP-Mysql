import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tracking/live')({
  component: () => <div>Live Traffic Page (Coming Soon)</div>,
})
