import { createFileRoute } from '@tanstack/react-router'
import { LiveTraffic } from '@/features/tracking/live-traffic'

export const Route = createFileRoute('/_authenticated/tracking/live')({
  component: LiveTraffic,
})
