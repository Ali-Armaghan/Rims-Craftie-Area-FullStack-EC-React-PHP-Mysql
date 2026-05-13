import { createFileRoute } from '@tanstack/react-router'
import { VisitorSessions } from '@/features/tracking/visitor-sessions'

export const Route = createFileRoute('/_authenticated/tracking/sessions')({
  component: VisitorSessions,
})
