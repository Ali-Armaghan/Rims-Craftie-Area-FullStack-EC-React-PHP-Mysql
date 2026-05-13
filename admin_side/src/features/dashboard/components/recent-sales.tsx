import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type RecentOrder = {
  id: number | string
  customer_name: string
  customer_email?: string
  total: number | string
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'G'
}

export function RecentSales({ orders }: { orders: RecentOrder[] }) {
  if (!orders.length) {
    return (
      <div className='py-8 text-center text-sm text-muted-foreground'>
        No recent orders yet.
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {orders.map((order) => (
        <div key={order.id} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarFallback>{getInitials(order.customer_name)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>
                {order.customer_name || 'Guest'}
              </p>
              <p className='text-sm text-muted-foreground'>
                {order.customer_email || 'No email'}
              </p>
            </div>
            <div className='font-medium'>
              +PKR {Number(order.total).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
