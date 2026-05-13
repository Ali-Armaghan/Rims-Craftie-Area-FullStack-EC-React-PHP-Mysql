import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import apiClient from '@/lib/api-client'
import { productSchema, type Product } from './types'

type Category = {
  id: number | string
  name: string
}

export function ProductFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  const {
    data: categories = [],
    isError: isCategoriesError,
    isLoading: isCategoriesLoading,
  } = useQuery<Category[]>({
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

  useEffect(() => {
    if (categories.length && !form.getValues('category_id')) {
      form.setValue('category_id', Number(categories[0].id))
    }
  }, [categories, form])

  const onSubmit = async (data: Product) => {
    setIsSaving(true)

    try {
      await apiClient.post('/products', data)
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully')
      navigate({ to: '/products' })
    } catch {
      toast.error('Failed to create product')
    } finally {
      setIsSaving(false)
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
        <div className='mx-auto w-full max-w-5xl'>
        <div className='mb-4 flex items-center gap-3'>
          <Button asChild variant='outline' size='sm'>
            <Link to='/products'>
              <ArrowLeft className='h-4 w-4' />
              Back
            </Link>
          </Button>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Add Product
            </h2>
            <p className='text-muted-foreground'>
              Create a new store product.
            </p>
          </div>
        </div>

        <Card className='w-full'>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Fill product information and save it to the backend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='grid gap-4'
              >
                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Product name' {...field} />
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
                          <Input placeholder='product-slug' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid gap-4 md:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='category_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          value={field.value ? String(field.value) : ''}
                          onValueChange={(val) => field.onChange(Number(val))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isCategoriesLoading
                                    ? 'Loading categories...'
                                    : 'Select category'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isCategoriesError && (
                              <SelectItem value='__error' disabled>
                                Failed to load categories
                              </SelectItem>
                            )}
                            {!isCategoriesLoading &&
                              !isCategoriesError &&
                              categories.length === 0 && (
                                <SelectItem value='__empty' disabled>
                                  No categories found
                                </SelectItem>
                              )}
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={String(category.id)}
                              >
                                {category.name}
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
                          <Input
                            type='number'
                            min='0'
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
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
                          <Input
                            type='number'
                            min='0'
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Product description'
                          className='min-h-32'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex justify-end gap-2'>
                  <Button asChild variant='outline'>
                    <Link to='/products'>Cancel</Link>
                  </Button>
                  <Button type='submit' disabled={isSaving}>
                    {isSaving && <Loader2 className='animate-spin' />}
                    Save Product
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        </div>
      </Main>
    </>
  )
}
