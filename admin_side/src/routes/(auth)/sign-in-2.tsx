import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/sign-in-2')({
  beforeLoad: () => {
    throw redirect({ to: '/sign-in' })
  },
})
