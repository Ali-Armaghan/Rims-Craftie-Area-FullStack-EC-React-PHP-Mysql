import { createFileRoute } from '@tanstack/react-router'
import { Ledger } from '@/features/resale/ledger'

export const Route = createFileRoute('/_authenticated/resale/ledger')({
  component: Ledger,
})
