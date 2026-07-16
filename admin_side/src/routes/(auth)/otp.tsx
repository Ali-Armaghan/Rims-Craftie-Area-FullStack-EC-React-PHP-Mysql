import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/otp')({
  beforeLoad: () => {
    throw redirect({ to: '/sign-in' })
  },
})
