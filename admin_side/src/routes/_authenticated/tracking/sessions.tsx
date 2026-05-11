import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tracking/sessions')({
  component: () => <div>Visitor Sessions Page (Coming Soon)</div>,
})
