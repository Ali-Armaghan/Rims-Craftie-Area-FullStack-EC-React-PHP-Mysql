import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { MoreHorizontal, Edit, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
            <div className='text-xs text-muted-foreground line-through'>
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
