import { useMemo, useState, Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Phone } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import apiClient from '@/lib/api-client'

type CartItem = {
  product_id?: number
  name?: string
  price?: number
  quantity?: number
  color_name?: string | null
}

type CheckoutDraft = {
  id: number
  draft_token: string
  full_name?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  referral_code?: string | null
  cart_total?: number | string
  cart_items?: CartItem[]
  status: 'abandoned' | 'converted'
  converted_order_id?: number | null
  updated_at: string
  created_at: string
}

function money(value: string | number | undefined | null) {
  return `Rs. ${Number(value ?? 0).toLocaleString()}`
}

export function AbandonedCheckouts() {
  const [statusFilter, setStatusFilter] = useState<'abandoned' | 'converted' | 'all'>(
    'abandoned'
  )
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data: drafts = [], isLoading } = useQuery<CheckoutDraft[]>({
    queryKey: ['checkout-drafts', statusFilter],
    queryFn: async () => {
      const params =
        statusFilter === 'all' ? undefined : { status: statusFilter }
      const response = await apiClient.get('/checkout-drafts', { params })
      return Array.isArray(response.data) ? response.data : []
    },
  })

  const rows = useMemo(() => drafts, [drafts])

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Abandoned Checkouts
            </h1>
            <p className='text-muted-foreground'>
              Customers who filled checkout details but did not place an order.
            </p>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as 'abandoned' | 'converted' | 'all')
            }
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='abandoned'>Abandoned</SelectItem>
              <SelectItem value='converted'>Converted</SelectItem>
              <SelectItem value='all'>All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10' />
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Cart Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className='w-24' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className='py-10 text-center'>
                    Loading drafts...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='py-10 text-center'>
                    No checkout drafts found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((draft) => {
                  const open = expandedId === draft.id
                  return (
                    <Fragment key={draft.id}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() =>
                              setExpandedId(open ? null : draft.id)
                            }
                          >
                            {open ? (
                              <ChevronDown className='h-4 w-4' />
                            ) : (
                              <ChevronRight className='h-4 w-4' />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className='font-medium'>
                          {draft.full_name || '—'}
                        </TableCell>
                        <TableCell>{draft.phone || '—'}</TableCell>
                        <TableCell>{draft.city || '—'}</TableCell>
                        <TableCell>{money(draft.cart_total)}</TableCell>
                        <TableCell>
                          <span
                            className={
                              draft.status === 'abandoned'
                                ? 'text-amber-600'
                                : 'text-green-600'
                            }
                          >
                            {draft.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(draft.updated_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {draft.phone ? (
                            <a
                              href={`https://wa.me/${String(draft.phone).replace(/\D/g, '')}`}
                              target='_blank'
                              rel='noreferrer'
                              className='inline-flex items-center gap-1 text-xs text-primary hover:underline'
                            >
                              <Phone className='h-3.5 w-3.5' />
                              WhatsApp
                            </a>
                          ) : null}
                        </TableCell>
                      </TableRow>
                      {open ? (
                        <TableRow>
                          <TableCell colSpan={8} className='bg-muted/30'>
                            <div className='grid gap-4 p-2 md:grid-cols-2'>
                              <div className='space-y-1 text-sm'>
                                <p>
                                  <span className='text-muted-foreground'>
                                    Email:{' '}
                                  </span>
                                  {draft.email || '—'}
                                </p>
                                <p>
                                  <span className='text-muted-foreground'>
                                    Address:{' '}
                                  </span>
                                  {draft.address || '—'}
                                </p>
                                <p>
                                  <span className='text-muted-foreground'>
                                    Referral:{' '}
                                  </span>
                                  {draft.referral_code || '—'}
                                </p>
                                <p>
                                  <span className='text-muted-foreground'>
                                    Order ID:{' '}
                                  </span>
                                  {draft.converted_order_id ?? '—'}
                                </p>
                              </div>
                              <div>
                                <p className='mb-2 text-sm font-medium'>
                                  Cart items
                                </p>
                                {draft.cart_items?.length ? (
                                  <ul className='space-y-1 text-sm text-muted-foreground'>
                                    {draft.cart_items.map((item, index) => (
                                      <li key={`${draft.id}-item-${index}`}>
                                        {item.name || 'Item'} ×{' '}
                                        {item.quantity ?? 1}
                                        {item.color_name
                                          ? ` (${item.color_name})`
                                          : ''}{' '}
                                        — {money(item.price)}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className='text-sm text-muted-foreground'>
                                    No cart items saved.
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
