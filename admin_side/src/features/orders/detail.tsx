import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import apiClient from '@/lib/api-client'

type Order = {
  id: number
  order_number: string
  customer_name: string | null
  customer_email?: string | null
  status: string
  subtotal?: string
  discount?: string
  total: string
  shipping_address?: string | Record<string, unknown>
  created_at: string
}

type OrderItem = {
  id: number
  product_id: number
  product_name: string
  price: string
  quantity: number
  subtotal: string
  color_name?: string | null
  color_hex?: string | null
}

type OrderDetail = Order & {
  items: OrderItem[]
}

const STATUS_OPTIONS = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

function formatCurrency(value: string | number | undefined | null) {
  return `PKR ${Number(value ?? 0).toLocaleString()}`
}

function parseShippingAddress(value?: string | Record<string, unknown>) {
  if (!value) return null

  if (typeof value === 'object') {
    return value as {
      full_name?: string
      phone?: string
      email?: string
      address?: string
      city?: string
      state?: string
      zip?: string
      country?: string
    }
  }

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
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusLoading, setStatusLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const updateStatus = async (status: string) => {
    if (!order) return
    setStatusLoading(true)
    try {
      await apiClient.put('/orders', { id: order.id, status })
      toast.success(`Order marked as ${status}`)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] }),
      ])
    } catch {
      toast.error('Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  const deleteOrder = async () => {
    if (!order) return
    setDeleting(true)
    try {
      await apiClient.delete('/orders', { params: { id: order.id } })
      toast.success(`Order ${order.order_number} deleted`)
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
      setDeleteOpen(false)
      navigate({ to: '/orders' })
    } catch {
      toast.error('Failed to delete order')
    } finally {
      setDeleting(false)
    }
  }

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
        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
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
                View, update status, or delete this order.
              </p>
            </div>
          </div>
          {order && (
            <Button
              variant='destructive'
              size='sm'
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className='h-4 w-4' />
              Delete order
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className='rounded-md border p-8 text-center text-muted-foreground'>
            Loading order details...
          </div>
        ) : order ? (
          <div className='space-y-6'>
            <div className='grid gap-4 md:grid-cols-4'>
              <div className='rounded-md border p-4'>
                <p className='text-xs uppercase text-muted-foreground'>
                  Order #
                </p>
                <p className='font-mono text-sm font-medium'>
                  {order.order_number}
                </p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='mb-2 text-xs uppercase text-muted-foreground'>
                  Status
                </p>
                <Select
                  value={order.status}
                  onValueChange={updateStatus}
                  disabled={statusLoading}
                >
                  <SelectTrigger className='h-8 capitalize'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className='capitalize'>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <p className='text-sm text-muted-foreground'>
                    {shipping.phone}
                  </p>
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
                    <TableHead>Color</TableHead>
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
                        <TableCell>
                          {item.color_name ? (
                            <span className='inline-flex items-center gap-2'>
                              {item.color_hex ? (
                                <span
                                  className='inline-block h-3.5 w-3.5 rounded-full border'
                                  style={{ backgroundColor: item.color_hex }}
                                />
                              ) : null}
                              {item.color_name}
                            </span>
                          ) : (
                            <span className='text-muted-foreground'>—</span>
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className='text-center'>
                        No items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              <div className='rounded-md border p-4'>
                <p className='text-xs uppercase text-muted-foreground'>
                  Subtotal
                </p>
                <p className='font-medium'>{formatCurrency(order.subtotal)}</p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-xs uppercase text-muted-foreground'>
                  Discount
                </p>
                <p className='font-medium'>
                  {Number(order.discount ?? 0) > 0
                    ? formatCurrency(order.discount)
                    : '—'}
                </p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-xs uppercase text-muted-foreground'>
                  Total
                </p>
                <p className='font-medium font-display text-lg'>
                  {formatCurrency(order.total)}
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete order{' '}
              <strong>{order?.order_number}</strong> and its items. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void deleteOrder()
              }}
              disabled={deleting}
              className='bg-red-600 hover:bg-red-700'
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
