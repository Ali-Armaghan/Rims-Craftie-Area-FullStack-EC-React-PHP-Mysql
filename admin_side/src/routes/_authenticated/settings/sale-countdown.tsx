import { createFileRoute } from '@tanstack/react-router'
import { SettingsSaleCountdown } from '@/features/settings/sale-countdown'

export const Route = createFileRoute('/_authenticated/settings/sale-countdown')({
  component: SettingsSaleCountdown,
})
