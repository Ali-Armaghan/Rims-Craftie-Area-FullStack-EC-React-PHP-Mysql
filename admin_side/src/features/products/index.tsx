import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ProductsProvider } from './context/products-context'
import { productsColumns } from './components/products-columns'
import { ProductDialog } from './components/product-dialog'
import { ProductDeleteDialog } from './components/product-delete-dialog'
import apiClient from '@/lib/api-client'
import type { Product } from './types'

function ProductsContent() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient.get('/products')
      return response.data
    },
  })

  const table = useReactTable({
    data: products,
    columns: productsColumns,
    getCoreRowModel: getCoreRowModel(),
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
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Products</h2>
            <p className='text-muted-foreground'>
              Manage your store products here.
            </p>
          </div>
          <Button asChild>
            <Link to='/products/new'>
              <Plus className='mr-2 h-4 w-4' /> Add Product
            </Link>
          </Button>
        </div>
        
        <div className='flex-1 overflow-auto border rounded-md'>
          {isLoading ? (
            <div className='p-4 text-center'>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={productsColumns.length}
                      className='h-24 text-center'
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Main>

      <ProductDialog />
      <ProductDeleteDialog />
    </>
  )
}

export function Products() {
  return (
    <ProductsProvider>
      <ProductsContent />
    </ProductsProvider>
  )
}
