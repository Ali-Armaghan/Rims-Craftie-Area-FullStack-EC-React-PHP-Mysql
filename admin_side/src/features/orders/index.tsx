import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Eye, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
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

export type Order = {
  id: number
  order_number: string
  customer_name: string
  customer_email?: string
  status: string
  subtotal?: string
  total: string
  shipping_address?: string
  created_at: string
}

const STATUS_OPTIONS = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

function OrderStatusSelect({ order }: { order: Order }) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const updateStatus = async (status: string) => {
    setLoading(true)
    try {
      await apiClient.put('/orders', { id: order.id, status })
      toast.success(`Order ${order.order_number} marked as ${status}`)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order-detail', String(order.id)] })
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
  const queryClient = useQueryClient()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteTarget, setDeleteTarget] = useState<'single' | 'bulk' | null>(null)
  const [singleOrder, setSingleOrder] = useState<Order | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await apiClient.get('/orders')
      return response.data
    },
  })

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter
      const matchesSearch =
        !q ||
        order.order_number.toLowerCase().includes(q) ||
        (order.customer_name ?? '').toLowerCase().includes(q) ||
        String(order.id).includes(q)
      return matchesStatus && matchesSearch
    })
  }, [orders, search, statusFilter])

  const allVisibleSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((order) => selectedIds.includes(order.id))

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = new Set([...selectedIds, ...filteredOrders.map((o) => o.id)])
      setSelectedIds(Array.from(ids))
      return
    }
    const visible = new Set(filteredOrders.map((o) => o.id))
    setSelectedIds((prev) => prev.filter((id) => !visible.has(id)))
  }

  const toggleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    )
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      if (deleteTarget === 'bulk') {
        if (!selectedIds.length) return
        await apiClient.delete('/orders', { data: { ids: selectedIds } })
        toast.success(`${selectedIds.length} order(s) deleted`)
        setSelectedIds([])
      } else if (deleteTarget === 'single' && singleOrder) {
        await apiClient.delete('/orders', { params: { id: singleOrder.id } })
        toast.success(`Order ${singleOrder.order_number} deleted`)
        setSelectedIds((prev) => prev.filter((id) => id !== singleOrder.id))
        setSingleOrder(null)
      }
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete order(s)')
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
        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Orders</h2>
            <p className='text-muted-foreground'>
              View, update status, and delete customer orders.
            </p>
          </div>
          {selectedIds.length > 0 && (
            <Button
              variant='destructive'
              onClick={() => setDeleteTarget('bulk')}
            >
              <Trash2 className='h-4 w-4' />
              Delete selected ({selectedIds.length})
            </Button>
          )}
        </div>

        <div className='mb-4 flex flex-col gap-3 sm:flex-row'>
          <Input
            placeholder='Search by order # or customer...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='sm:max-w-xs'
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='sm:w-44'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className='capitalize'>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='rounded-md border'>
          {isLoading ? (
            <div className='p-8 text-center text-muted-foreground'>
              Loading orders...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-10'>
                    <Checkbox
                      checked={allVisibleSelected}
                      onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                      aria-label='Select all orders'
                    />
                  </TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length ? (
                  filteredOrders.map((order) => {
                    const isSelected = selectedIds.includes(order.id)
                    return (
                      <TableRow
                        key={order.id}
                        data-state={isSelected ? 'selected' : undefined}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(v) =>
                              toggleSelectOne(order.id, Boolean(v))
                            }
                            aria-label={`Select ${order.order_number}`}
                          />
                        </TableCell>
                        <TableCell className='font-mono text-sm'>
                          {order.order_number}
                        </TableCell>
                        <TableCell>{order.customer_name ?? 'Guest'}</TableCell>
                        <TableCell>
                          PKR {parseFloat(order.total).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <OrderStatusSelect order={order} />
                        </TableCell>
                        <TableCell className='text-muted-foreground text-sm'>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <Button variant='outline' size='icon' asChild>
                              <Link
                                to='/orders/$orderId'
                                params={{ orderId: String(order.id) }}
                                aria-label={`View ${order.order_number}`}
                              >
                                <Eye className='h-4 w-4' />
                              </Link>
                            </Button>
                            <Button
                              variant='outline'
                              size='icon'
                              className='text-destructive hover:text-destructive'
                              onClick={() => {
                                setSingleOrder(order)
                                setDeleteTarget('single')
                              }}
                              aria-label={`Delete ${order.order_number}`}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className='h-24 text-center'>
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Main>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteTarget(null)
            setSingleOrder(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget === 'bulk' ? (
                <>
                  This will permanently delete{' '}
                  <strong>{selectedIds.length}</strong> selected order(s) and
                  their items. This cannot be undone.
                </>
              ) : (
                <>
                  This will permanently delete order{' '}
                  <strong>{singleOrder?.order_number}</strong> and its items.
                  This cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
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
