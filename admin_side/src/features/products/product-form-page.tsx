import { useEffect, useState, type ChangeEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ImagePlus, Loader2, X } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import apiClient from '@/lib/api-client'
import { productSchema, type Product } from './types'

type Category = {
  id: number | string
  name: string
}

const emptyCategories: Category[] = []

type ProductFormPageProps = {
  productId?: string
}

function getProductCategoryId(product: Product, categories: Category[]) {
  const categoryId = Number(product.category_id)

  if (categoryId > 0) {
    return categoryId
  }

  const categoryByName = categories.find(
    (category) => category.name === product.category_name
  )

  if (categoryByName) {
    return Number(categoryByName.id)
  }

  return Number(categories[0]?.id ?? 0)
}

function normalizeProduct(product: Product, categories: Category[]): Product {
  return {
    ...product,
    category_id: getProductCategoryId(product, categories),
    price: Number(product.price),
    stock: Number(product.stock),
    images: Array.isArray(product.images) ? product.images : [],
    is_active: Number(product.is_active),
  }
}

export function ProductFormPage({ productId }: ProductFormPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  const isEdit = Boolean(productId)

  const {
    data: categories = emptyCategories,
    isError: isCategoriesError,
    isLoading: isCategoriesLoading,
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories')
      return response.data
    },
  })

  const {
    data: productToEdit,
    isError: isProductError,
    isLoading: isProductLoading,
  } = useQuery<Product>({
    queryKey: ['product', productId],
    enabled: isEdit,
    queryFn: async () => {
      const response = await apiClient.get('/products', {
        params: { id: productId },
      })
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
  const { getValues, reset, setValue, watch } = form

  useEffect(() => {
    if (productToEdit) {
      const normalizedProduct = normalizeProduct(productToEdit, categories)
      reset(normalizedProduct)
      setValue('category_id', normalizedProduct.category_id, {
        shouldDirty: false,
        shouldValidate: true,
      })
      return
    }

    if (categories.length && !getValues('category_id')) {
      setValue('category_id', Number(categories[0].id), {
        shouldDirty: false,
        shouldValidate: true,
      })
    }
  }, [categories, getValues, productToEdit, reset, setValue])

  const selectedCategoryId = watch('category_id')
  const productImages = watch('images') ?? []
  const categorySelectValue =
    selectedCategoryId && Number(selectedCategoryId) > 0
      ? String(selectedCategoryId)
      : ''

  const uploadProductImages = async (files: File[]) => {
    if (!files.length) return []

    const formData = new FormData()
    files.forEach((file) => formData.append('images[]', file))

    const response = await apiClient.post('/uploads/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return Array.isArray(response.data.images) ? response.data.images : []
  }

  const onMainImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return

    setIsSaving(true)
    try {
      const [mainImage] = await uploadProductImages([files[0]])
      if (!mainImage) return

      setValue('images', [mainImage, ...productImages.slice(1)], {
        shouldDirty: true,
        shouldValidate: true,
      })
      toast.success('Main image uploaded')
    } catch {
      toast.error('Failed to upload main image')
    } finally {
      setIsSaving(false)
    }
  }

  const onCarouselImagesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return

    setIsSaving(true)
    try {
      const uploadedImages = await uploadProductImages(files)
      const mainImage = productImages[0]
      const carouselImages = productImages.slice(1)

      setValue(
        'images',
        mainImage
          ? [mainImage, ...carouselImages, ...uploadedImages]
          : uploadedImages,
        { shouldDirty: true, shouldValidate: true }
      )
      toast.success('Carousel images uploaded')
    } catch {
      toast.error('Failed to upload carousel images')
    } finally {
      setIsSaving(false)
    }
  }

  const removeImage = (index: number) => {
    setValue(
      'images',
      productImages.filter((_, imageIndex) => imageIndex !== index),
      { shouldDirty: true, shouldValidate: true }
    )
  }

  const onSubmit = async (data: Product) => {
    setIsSaving(true)

    try {
      if (isEdit) {
        await apiClient.put('/products', { ...data, id: Number(productId) })
      } else {
        await apiClient.post('/products', data)
      }
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(
        isEdit ? 'Product updated successfully' : 'Product created successfully'
      )
      navigate({ to: '/products' })
    } catch {
      toast.error(isEdit ? 'Failed to update product' : 'Failed to create product')
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
        <div className='w-full'>
          <div className='mb-4 flex items-center gap-3'>
            <Button asChild variant='outline' size='sm'>
              <Link to='/products'>
                <ArrowLeft className='h-4 w-4' />
                Back
              </Link>
            </Button>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                {isEdit ? 'Edit Product' : 'Add Product'}
              </h2>
              <p className='text-muted-foreground'>
                {isEdit
                  ? 'Update product information.'
                  : 'Create a new store product.'}
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
              {isProductLoading ? (
                <div className='py-8 text-center text-muted-foreground'>
                  Loading product...
                </div>
              ) : isEdit && (isProductError || !productToEdit) ? (
                <div className='py-8 text-center text-muted-foreground'>
                  Product not found.
                </div>
              ) : (
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
                        <FormControl>
                          <select
                            className='border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                            disabled={
                              isCategoriesLoading ||
                              isCategoriesError ||
                              categories.length === 0
                            }
                            value={categorySelectValue}
                            onChange={(event) => {
                              const categoryId = Number(event.target.value)
                              field.onChange(categoryId)
                              setValue('category_id', categoryId, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }}
                          >
                            <option value='' disabled>
                              {isCategoriesLoading
                                ? 'Loading categories...'
                                : isCategoriesError
                                  ? 'Failed to load categories'
                                  : 'Select category'}
                            </option>
                            {categories.map((category) => (
                              <option
                                key={category.id}
                                value={String(category.id)}
                              >
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        {!isCategoriesLoading &&
                          !isCategoriesError &&
                          categories.length === 0 && (
                            <p className='text-xs text-muted-foreground'>
                              No categories found in database
                            </p>
                          )}
                        {/* {selectedCategory && (
                          <p className='text-xs text-muted-foreground'>
                            Selected: {selectedCategory.name}
                          </p>
                        )} */}
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

                <FormField
                  control={form.control}
                  name='images'
                  render={() => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <div className='rounded-md border p-4'>
                          <div className='mb-2 flex items-center gap-2 font-medium'>
                            <ImagePlus className='h-4 w-4' />
                            Front / Main Image
                          </div>
                          <p className='mb-3 text-xs text-muted-foreground'>
                            This first image is used on product cards and as the
                            first detail image.
                          </p>
                          <Input
                            type='file'
                            accept='image/*'
                            disabled={isSaving}
                            onChange={onMainImageChange}
                          />
                        </div>

                        <div className='rounded-md border p-4'>
                          <div className='mb-2 flex items-center gap-2 font-medium'>
                            <ImagePlus className='h-4 w-4' />
                            Carousel Images
                          </div>
                          <p className='mb-3 text-xs text-muted-foreground'>
                            These images appear after the main image in product
                            detail carousel.
                          </p>
                          <Input
                            type='file'
                            accept='image/*'
                            multiple
                            disabled={isSaving}
                            onChange={onCarouselImagesChange}
                          />
                        </div>
                      </div>

                      {productImages.length > 0 && (
                        <div className='mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4'>
                          {productImages.map((image, index) => (
                            <div
                              key={`${image}-${index}`}
                              className='relative overflow-hidden rounded-md border bg-muted'
                            >
                              <img
                                src={image}
                                alt={
                                  index === 0
                                    ? 'Main product'
                                    : `Carousel ${index}`
                                }
                                className='h-32 w-full object-cover'
                              />
                              <div className='absolute left-2 top-2 rounded bg-background/90 px-2 py-1 text-xs font-medium'>
                                {index === 0 ? 'Front' : `Carousel ${index}`}
                              </div>
                              <Button
                                type='button'
                                variant='destructive'
                                size='icon'
                                className='absolute right-2 top-2 h-7 w-7'
                                onClick={() => removeImage(index)}
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
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
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
