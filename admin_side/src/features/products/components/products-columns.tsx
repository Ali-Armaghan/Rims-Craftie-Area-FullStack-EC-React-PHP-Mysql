import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Edit, Trash } from 'lucide-react'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProducts } from '../context/products-context'
import type { Product } from '../types'

function ProductRowActions({ product }: { product: Product }) {
  const { setOpen, setCurrentRow } = useProducts()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link
            to='/products/$productId/edit'
            params={{ productId: String(product.id) }}
          >
            <Edit className='mr-2 h-4 w-4' /> Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-red-600'
          onClick={() => {
            setCurrentRow(product)
            setOpen('delete')
          }}
        >
          <Trash className='mr-2 h-4 w-4' /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SoldOutToggle({ product }: { product: Product }) {
  const queryClient = useQueryClient()
  const isSoldOut = Number(product.is_sold_out ?? 0) === 1

  const mutation = useMutation({
    mutationFn: async (nextValue: number) => {
      await apiClient.put('/products', {
        ...product,
        id: product.id,
        category_ids:
          product.category_ids?.length
            ? product.category_ids
            : product.category_id
              ? [Number(product.category_id)]
              : [],
        sale_price: Number(product.sale_price ?? product.price ?? 0),
        price: Number(product.sale_price ?? product.price ?? 0),
        stock: Number(product.stock ?? 0),
        images: product.images ?? [],
        colors: product.colors ?? [],
        is_active: Number(product.is_active ?? 1),
        is_sold_out: nextValue,
      })
    },
    onSuccess: (_data, nextValue) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(
        nextValue === 1
          ? 'Product marked as Sold Out'
          : 'Sold Out removed — product available again'
      )
    },
    onError: () => {
      toast.error('Failed to update sold out status')
    },
  })

  return (
    <div className='flex items-center gap-2'>
      <Switch
        checked={isSoldOut}
        disabled={mutation.isPending}
        onCheckedChange={(checked) => mutation.mutate(checked ? 1 : 0)}
        aria-label={`Mark ${product.name} as sold out`}
      />
      <span
        className={
          isSoldOut
            ? 'text-xs font-medium text-destructive'
            : 'text-xs text-muted-foreground'
        }
      >
        {isSoldOut ? 'Sold Out' : 'Available'}
      </span>
    </div>
  )
}

export const productsColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'category_names',
    header: 'Categories',
    cell: ({ row }) => {
      const product = row.original
      const labels =
        product.category_names ||
        product.category_name ||
        (Array.isArray(product.categories)
          ? product.categories.map((category) => category.name).join(', ')
          : '')

      return <div className='max-w-[220px] text-sm'>{labels || '—'}</div>
    },
  },
  {
    accessorKey: 'sale_price',
    header: 'Sale Price',
    cell: ({ row }) => {
      const product = row.original
      const salePrice = Number(product.sale_price ?? product.price ?? 0)
      const originalPrice =
        product.original_price != null ? Number(product.original_price) : null
      const formatted = new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
      }).format(salePrice)

      return (
        <div className='space-y-1'>
          <div className='font-medium'>{formatted}</div>
          {originalPrice != null && originalPrice > salePrice && (
            <div className='text-xs text-destructive line-through decoration-destructive/70'>
              {new Intl.NumberFormat('en-PK', {
                style: 'currency',
                currency: 'PKR',
              }).format(originalPrice)}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
  },
  {
    accessorKey: 'is_sold_out',
    header: 'Sold Out',
    cell: ({ row }) => <SoldOutToggle product={row.original} />,
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active')
      return (
        <div className={isActive ? 'text-green-600' : 'text-red-600'}>
          {isActive ? 'Active' : 'Inactive'}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ProductRowActions product={row.original} />,
  },
]
