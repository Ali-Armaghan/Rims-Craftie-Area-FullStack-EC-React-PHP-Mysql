import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/forgot-password')({
  beforeLoad: () => {
    throw redirect({ to: '/sign-in' })
  },
})
