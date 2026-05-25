import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { productSchema, type Product } from '../types'
import { useProducts } from '../context/products-context'
import apiClient from '@/lib/api-client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CategoryMultiSelect } from './category-multi-select'

type Category = {
  id: number
  name: string
}

const emptyCategories: Category[] = []

function getCategoryIds(product: Product) {
  if (Array.isArray(product.category_ids) && product.category_ids.length) {
    return product.category_ids.map(Number).filter((id) => id > 0)
  }

  const single = Number(product.category_id)
  return single > 0 ? [single] : []
}

export function ProductDialog() {
  const { open, setOpen, currentRow } = useProducts()
  const queryClient = useQueryClient()
  const isEdit = open === 'edit'

  const { data: categories = emptyCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories')
      return response.data
    },
  })

  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      category_ids: [],
      category_id: 0,
      description: '',
      price: 0,
      stock: 0,
      images: [],
      is_active: 1,
    },
  })
  const { reset, setValue } = form

  useEffect(() => {
    if (!open) return

    if (isEdit && currentRow) {
      const categoryIds = getCategoryIds(currentRow)
      reset({
        ...currentRow,
        category_ids: categoryIds,
        category_id: categoryIds[0] ?? 0,
        price: Number(currentRow.price),
        stock: Number(currentRow.stock),
      })
      return
    }

    if (!isEdit) {
      reset({
        name: '',
        slug: '',
        category_ids: categories[0] ? [categories[0].id] : [],
        category_id: categories[0]?.id ?? 0,
        description: '',
        price: 0,
        stock: 0,
        images: [],
        is_active: 1,
      })
    }
  }, [open, currentRow, isEdit, categories, reset])

  const onSubmit = async (data: Product) => {
    const payload = {
      ...data,
      category_ids: data.category_ids,
      category_id: data.category_ids[0],
    }

    try {
      if (isEdit) {
        await apiClient.put('/products', { ...payload, id: currentRow?.id })
        toast.success('Product updated successfully')
      } else {
        await apiClient.post('/products', payload)
        toast.success('Product created successfully')
      }
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setOpen(null)
    } catch {
      toast.error('Failed to save product')
    }
  }

  return (
    <Dialog open={open === 'add' || open === 'edit'} onOpenChange={() => setOpen(null)}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update product details.' : 'Enter details for the new product.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='category_ids'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    <CategoryMultiSelect
                      categories={categories}
                      value={field.value ?? []}
                      onChange={(nextValue) => {
                        field.onChange(nextValue)
                        setValue('category_id', nextValue[0] ?? 0)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (PKR)</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='stock'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='submit'>Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
