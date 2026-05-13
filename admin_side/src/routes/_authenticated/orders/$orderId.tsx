import { createFileRoute } from '@tanstack/react-router'
import { OrderDetailPage } from '@/features/orders/detail'

export const Route = createFileRoute('/_authenticated/orders/$orderId')({
  component: OrderDetailRoute,
})

function OrderDetailRoute() {
  const { orderId } = Route.useParams()

  return <OrderDetailPage orderId={orderId} />
}
