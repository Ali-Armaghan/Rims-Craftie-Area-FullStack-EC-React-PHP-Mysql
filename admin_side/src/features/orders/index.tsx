import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import apiClient from '@/lib/api-client'

type Order = {
  id: number
  order_number: string
  customer_name: string
  status: string
  total: string
  commission_earned: string
  resale_credited: number
  created_at: string
}

const STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

function OrderStatusSelect({ order }: { order: Order }) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const updateStatus = async (status: string) => {
    setLoading(true)
    try {
      await apiClient.put('/orders', { id: order.id, status })
      toast.success(`Order ${order.order_number} marked as ${status}`)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    } catch {
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select value={order.status} onValueChange={updateStatus} disabled={loading}>
      <SelectTrigger className='h-7 w-32 text-xs'>
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
  )
}

export function Orders() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await apiClient.get('/orders')
      return response.data
    },
  })

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
        <div className='mb-4'>
          <h2 className='text-2xl font-bold tracking-tight'>Orders</h2>
          <p className='text-muted-foreground'>Manage and update customer orders.</p>
        </div>

        <div className='rounded-md border'>
          {isLoading ? (
            <div className='p-8 text-center text-muted-foreground'>Loading orders...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length ? (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className='font-mono text-sm'>{order.order_number}</TableCell>
                      <TableCell>{order.customer_name ?? 'Guest'}</TableCell>
                      <TableCell>PKR {parseFloat(order.total).toLocaleString()}</TableCell>
                      <TableCell>
                        {parseFloat(order.commission_earned) > 0 ? (
                          <span className='text-green-600'>
                            PKR {parseFloat(order.commission_earned).toFixed(2)}
                          </span>
                        ) : (
                          <span className='text-muted-foreground'>—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <OrderStatusSelect order={order} />
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className='h-24 text-center'>
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Main>
    </>
  )
}
