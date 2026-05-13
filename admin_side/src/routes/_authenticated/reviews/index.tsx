import { createFileRoute } from '@tanstack/react-router'
import { Reviews } from '@/features/reviews'

export const Route = createFileRoute('/_authenticated/reviews/')({
  component: Reviews,
})
