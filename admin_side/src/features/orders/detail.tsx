import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import apiClient from '@/lib/api-client'

type Order = {
  id: number
  order_number: string
  customer_name: string | null
  customer_email?: string | null
  status: string
  subtotal?: string
  total: string
  shipping_address?: string
  referred_by_code?: string | null
  commission_earned: string
  resale_credited: number
  created_at: string
}

type OrderItem = {
  id: number
  product_id: number
  product_name: string
  price: string
  quantity: number
  subtotal: string
}

type OrderDetail = Order & {
  items: OrderItem[]
}

function formatCurrency(value: string | number | undefined | null) {
  return `PKR ${Number(value ?? 0).toLocaleString()}`
}

function parseShippingAddress(value?: string) {
  if (!value) return null

  try {
    return JSON.parse(value) as {
      full_name?: string
      phone?: string
      email?: string
      address?: string
      city?: string
      state?: string
      zip?: string
      country?: string
    }
  } catch {
    return null
  }
}

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useQuery<OrderDetail | null>({
    queryKey: ['order-detail', orderId],
    queryFn: async () => {
      const response = await apiClient.get('/orders', {
        params: { id: orderId },
      })
      return response.data
    },
  })

  const shipping = parseShippingAddress(order?.shipping_address)

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center gap-3'>
          <Button asChild variant='outline' size='sm'>
            <Link to='/orders'>
              <ArrowLeft className='h-4 w-4' />
              Back
            </Link>
          </Button>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Order Details
            </h2>
            <p className='text-muted-foreground'>
              View complete order history, items, customer, and commission data.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className='rounded-md border p-8 text-center text-muted-foreground'>
            Loading order details...
          </div>
        ) : order ? (
          <div className='space-y-6'>
            <div className='grid gap-4 md:grid-cols-4'>
              <div className='rounded-md border p-4'>
                <p className='text-xs uppercase text-muted-foreground'>Order #</p>
                <p className='font-mono text-sm font-medium'>{order.order_number}</p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-xs uppercase text-muted-foreground'>Status</p>
                <p className='capitalize font-medium'>{order.status}</p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-xs uppercase text-muted-foreground'>Total</p>
                <p className='font-medium'>{formatCurrency(order.total)}</p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-xs uppercase text-muted-foreground'>Date</p>
                <p className='font-medium'>
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-md border p-4'>
                <h3 className='mb-3 font-semibold'>Customer</h3>
                <p>{order.customer_name ?? 'Guest'}</p>
                <p className='text-sm text-muted-foreground'>
                  {order.customer_email ?? shipping?.email ?? 'No email'}
                </p>
                {shipping?.phone && (
                  <p className='text-sm text-muted-foreground'>{shipping.phone}</p>
                )}
              </div>

              <div className='rounded-md border p-4'>
                <h3 className='mb-3 font-semibold'>Shipping Address</h3>
                {shipping ? (
                  <div className='text-sm text-muted-foreground'>
                    <p className='text-foreground'>{shipping.full_name}</p>
                    <p>{shipping.address}</p>
                    <p>
                      {shipping.city}, {shipping.state} {shipping.zip}
                    </p>
                    <p>{shipping.country}</p>
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    Shipping address not available.
                  </p>
                )}
              </div>
            </div>

            <div className='rounded-md border'>
              <div className='border-b p-4'>
                <h3 className='font-semibold'>Items</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className='text-right'>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.length ? (
                    order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className='text-center'>
                        No items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              <div className='rounded-md border p-4'>
                <p className='text-xs uppercase text-muted-foreground'>Subtotal</p>
                <p className='font-medium'>{formatCurrency(order.subtotal)}</p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-xs uppercase text-muted-foreground'>
                  ReSale Code
                </p>
                <p className='font-medium'>{order.referred_by_code ?? '-'}</p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-xs uppercase text-muted-foreground'>
                  Commission
                </p>
                <p className='font-medium'>
                  {Number(order.commission_earned ?? 0) > 0
                    ? formatCurrency(order.commission_earned)
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className='rounded-md border p-8 text-center text-muted-foreground'>
            Order not found.
          </div>
        )}
      </Main>
    </>
  )
}
