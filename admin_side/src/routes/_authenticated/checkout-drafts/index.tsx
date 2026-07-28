import { createFileRoute } from '@tanstack/react-router'
import { AbandonedCheckouts } from '@/features/checkout-drafts'

export const Route = createFileRoute('/_authenticated/checkout-drafts/')({
  component: AbandonedCheckouts,
})
