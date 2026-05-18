import { createFileRoute } from '@tanstack/react-router'
import { Commissions } from '@/features/resale/commissions'

export const Route = createFileRoute('/_authenticated/resale/commissions')({
  component: Commissions,
})
