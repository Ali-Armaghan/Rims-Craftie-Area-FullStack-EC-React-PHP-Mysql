import { createFileRoute } from '@tanstack/react-router'
import { PageAnalytics } from '@/features/tracking/page-analytics'

export const Route = createFileRoute('/_authenticated/tracking/page-analytics')({
  component: PageAnalytics,
})
