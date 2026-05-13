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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { productSchema, type Product } from '../types'
import { useProducts } from '../context/products-context'
import apiClient from '@/lib/api-client'
import { useQuery, useQueryClient } from '@tanstack/react-query'

type Category = {
  id: number
  name: string
}

const emptyCategories: Category[] = []

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
      category_id: 0,
      description: '',
      price: 0,
      stock: 0,
      images: [],
      is_active: 1,
    },
  })
  const { reset } = form

  useEffect(() => {
    if (!open) return

    if (isEdit && currentRow) {
      reset({
        ...currentRow,
        price: Number(currentRow.price),
        stock: Number(currentRow.stock),
      })
      return
    }

    if (!isEdit) {
      reset({
        name: '',
        slug: '',
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
    try {
      if (isEdit) {
        await apiClient.put('/products', { ...data, id: currentRow?.id })
        toast.success('Product updated successfully')
      } else {
        await apiClient.post('/products', data)
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
      <DialogContent className='sm:max-w-[425px]'>
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
              name='category_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a category' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
