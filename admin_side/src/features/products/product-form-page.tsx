import {
  useEffect,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import apiClient from '@/lib/api-client'
import { resolveImageUrl } from '@/lib/resolve-image-url'
import { productSchema, type Product } from './types'
import { CategoryMultiSelect } from './components/category-multi-select'

type Category = {
  id: number | string
  name: string
}

const emptyCategories: Category[] = []

type ProductFormPageProps = {
  productId?: string
}

type CropMode = 'main' | 'carousel'

type CropSession = {
  mode: CropMode
  currentFile: File
  imageUrl: string
  remainingFiles: File[]
  croppedFiles: File[]
}

function getProductCategoryIds(
  product: Product & { categories?: { id: number }[] },
  categories: Category[]
) {
  if (Array.isArray(product.category_ids) && product.category_ids.length) {
    return product.category_ids.map(Number).filter((id) => id > 0)
  }

  if (Array.isArray(product.categories) && product.categories.length) {
    return product.categories
      .map((category) => Number(category.id))
      .filter((id) => id > 0)
  }

  const categoryId = Number(product.category_id)
  if (categoryId > 0) {
    return [categoryId]
  }

  const categoryByName = categories.find(
    (category) => category.name === product.category_name
  )

  if (categoryByName) {
    return [Number(categoryByName.id)]
  }

  return []
}

function parseProductImages(images: unknown): string[] {
  if (Array.isArray(images)) {
    return images.filter((image): image is string => typeof image === 'string')
  }

  if (typeof images === 'string' && images.trim()) {
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed)
        ? parsed.filter((image): image is string => typeof image === 'string')
        : [images]
    } catch {
      return [images]
    }
  }

  return []
}

function normalizeProduct(product: Product, categories: Category[]): Product {
  const categoryIds = getProductCategoryIds(product, categories)

  return {
    ...product,
    category_ids: categoryIds.length
      ? categoryIds
      : categories[0]
        ? [Number(categories[0].id)]
        : [],
    category_id: categoryIds[0] ?? Number(categories[0]?.id ?? 0),
    original_price:
      product.original_price != null ? Number(product.original_price) : null,
    sale_price: Number(product.sale_price ?? product.price ?? 0),
    price: Number(product.sale_price ?? product.price ?? 0),
    stock: Number(product.stock),
    images: parseProductImages(product.images).map(resolveImageUrl),
    is_active: Number(product.is_active),
  }
}

export function ProductFormPage({ productId }: ProductFormPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  const [cropSession, setCropSession] = useState<CropSession | null>(null)
  const [cropZoom, setCropZoom] = useState(1)
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 })
  const [cropNaturalSize, setCropNaturalSize] = useState({
    width: 0,
    height: 0,
  })
  const [dragStart, setDragStart] = useState<{
    pointerX: number
    pointerY: number
    offsetX: number
    offsetY: number
  } | null>(null)
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
      category_ids: [],
      category_id: 0,
      original_price: null,
      sale_price: 0,
      price: 0,
      description: '',
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
      setValue('category_ids', normalizedProduct.category_ids, {
        shouldDirty: false,
        shouldValidate: true,
      })
      return
    }

    if (categories.length && !getValues('category_ids')?.length) {
      setValue('category_ids', [Number(categories[0].id)], {
        shouldDirty: false,
        shouldValidate: true,
      })
    }
  }, [categories, getValues, productToEdit, reset, setValue])

  const selectedCategoryIds = watch('category_ids') ?? []
  const productImages = watch('images') ?? []

  const uploadProductImages = async (files: File[]) => {
    if (!files.length) return []

    const formData = new FormData()
    files.forEach((file) => formData.append('images[]', file))

    const response = await apiClient.post('/uploads/products', formData)

    return Array.isArray(response.data.images)
      ? response.data.images.map((image: string) => resolveImageUrl(image))
      : []
  }

  const openCropper = (files: File[], mode: CropMode) => {
    if (!files.length) return

    setCropZoom(1)
    setCropOffset({ x: 0, y: 0 })
    setCropNaturalSize({ width: 0, height: 0 })
    setCropSession({
      mode,
      currentFile: files[0],
      imageUrl: URL.createObjectURL(files[0]),
      remainingFiles: files.slice(1),
      croppedFiles: [],
    })
  }

  const closeCropper = () => {
    if (cropSession?.imageUrl) {
      URL.revokeObjectURL(cropSession.imageUrl)
    }
    setCropSession(null)
    setDragStart(null)
    setCropZoom(1)
    setCropOffset({ x: 0, y: 0 })
    setCropNaturalSize({ width: 0, height: 0 })
  }

  const cropImageToSquare = async (session: CropSession) => {
    const maxExportSize = 1500
    const previewSize = 320
    const image = new Image()
    image.src = session.imageUrl

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = reject
    })

    const baseScale = Math.max(
      previewSize / image.naturalWidth,
      previewSize / image.naturalHeight
    )
    const totalScale = baseScale * cropZoom
    const displayedWidth = image.naturalWidth * totalScale
    const displayedHeight = image.naturalHeight * totalScale
    const sourceSize = previewSize / totalScale
    const maxSourceX = image.naturalWidth - sourceSize
    const maxSourceY = image.naturalHeight - sourceSize
    const sourceX = Math.min(
      Math.max(
        (displayedWidth / 2 - previewSize / 2 - cropOffset.x) / totalScale,
        0
      ),
      Math.max(maxSourceX, 0)
    )
    const sourceY = Math.min(
      Math.max(
        (displayedHeight / 2 - previewSize / 2 - cropOffset.y) / totalScale,
        0
      ),
      Math.max(maxSourceY, 0)
    )

    const exportSize = Math.min(
      maxExportSize,
      Math.max(Math.round(sourceSize), 1)
    )

    const canvas = document.createElement('canvas')
    canvas.width = exportSize
    canvas.height = exportSize
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas is not supported')
    }

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      exportSize,
      exportSize
    )

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result)
            return
          }
          reject(new Error('Unable to crop image'))
        },
        'image/jpeg',
        0.95
      )
    })

    return new File(
      [blob],
      session.currentFile.name.replace(/\.[^.]+$/, '') + '-square.jpg',
      { type: 'image/jpeg' }
    )
  }

  const finishCroppedUpload = async (mode: CropMode, files: File[]) => {
    setIsSaving(true)
    try {
      const uploadedImages = await uploadProductImages(files)

      if (mode === 'main') {
        const [mainImage] = uploadedImages
        if (!mainImage) return

        setValue('images', [mainImage, ...productImages.slice(1)], {
          shouldDirty: true,
          shouldValidate: true,
        })
        toast.success('Main image cropped and uploaded')
        return
      }

      const mainImage = productImages[0]
      const carouselImages = productImages.slice(1)
      setValue(
        'images',
        mainImage
          ? [mainImage, ...carouselImages, ...uploadedImages]
          : uploadedImages,
        { shouldDirty: true, shouldValidate: true }
      )
      toast.success('Carousel images cropped and uploaded')
    } catch {
      toast.error('Failed to upload cropped images')
    } finally {
      setIsSaving(false)
    }
  }

  const confirmCrop = async () => {
    if (!cropSession) return

    try {
      const croppedFile = await cropImageToSquare(cropSession)
      const croppedFiles = [...cropSession.croppedFiles, croppedFile]

      URL.revokeObjectURL(cropSession.imageUrl)

      if (cropSession.remainingFiles.length) {
        const [nextFile, ...remainingFiles] = cropSession.remainingFiles
        setCropZoom(1)
        setCropOffset({ x: 0, y: 0 })
        setCropNaturalSize({ width: 0, height: 0 })
        setDragStart(null)
        setCropSession({
          mode: cropSession.mode,
          currentFile: nextFile,
          imageUrl: URL.createObjectURL(nextFile),
          remainingFiles,
          croppedFiles,
        })
        return
      }

      const mode = cropSession.mode
      setCropSession(null)
      setDragStart(null)
      setCropZoom(1)
      setCropOffset({ x: 0, y: 0 })
      setCropNaturalSize({ width: 0, height: 0 })
      await finishCroppedUpload(mode, croppedFiles)
    } catch {
      toast.error('Failed to crop image')
    }
  }

  const onMainImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return

    openCropper([files[0]], 'main')
  }

  const onCarouselImagesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return

    openCropper(files, 'carousel')
  }

  const onCropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragStart({
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: cropOffset.x,
      offsetY: cropOffset.y,
    })
  }

  const onCropPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return

    setCropOffset({
      x: dragStart.offsetX + event.clientX - dragStart.pointerX,
      y: dragStart.offsetY + event.clientY - dragStart.pointerY,
    })
  }

  const onCropPointerUp = () => {
    setDragStart(null)
  }

  const cropPreviewSize = 320
  const cropDisplayScale =
    cropNaturalSize.width && cropNaturalSize.height
      ? Math.max(
          cropPreviewSize / cropNaturalSize.width,
          cropPreviewSize / cropNaturalSize.height
        )
      : 1
  const cropDisplayWidth = cropNaturalSize.width
    ? cropNaturalSize.width * cropDisplayScale
    : cropPreviewSize
  const cropDisplayHeight = cropNaturalSize.height
    ? cropNaturalSize.height * cropDisplayScale
    : cropPreviewSize

  const removeImage = (index: number) => {
    setValue(
      'images',
      productImages.filter((_, imageIndex) => imageIndex !== index),
      { shouldDirty: true, shouldValidate: true }
    )
  }

  const onSubmit = async (data: Product) => {
    setIsSaving(true)

    const payload = {
      ...data,
      category_ids: data.category_ids,
      category_id: data.category_ids[0],
      price: data.sale_price,
      original_price: data.original_price ?? null,
    }

    try {
      if (isEdit) {
        await apiClient.put('/products', { ...payload, id: Number(productId) })
      } else {
        await apiClient.post('/products', payload)
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
                          disabled={
                            isCategoriesLoading ||
                            isCategoriesError ||
                            categories.length === 0
                          }
                          onChange={(nextValue) => {
                            field.onChange(nextValue)
                            setValue('category_id', nextValue[0] ?? 0, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }}
                        />
                      </FormControl>
                      {selectedCategoryIds.length > 0 && (
                        <p className='text-xs text-muted-foreground'>
                          {selectedCategoryIds.length} categor
                          {selectedCategoryIds.length === 1 ? 'y' : 'ies'}{' '}
                          selected
                        </p>
                      )}
                      {!isCategoriesLoading &&
                        !isCategoriesError &&
                        categories.length === 0 && (
                          <p className='text-xs text-muted-foreground'>
                            No categories found in database
                          </p>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid gap-4 md:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='original_price'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price (PKR)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min='0'
                            placeholder='Before discount'
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(
                                value === '' ? null : Number(value)
                              )
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='sale_price'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price (PKR)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min='0'
                            placeholder='After discount'
                            {...field}
                            onChange={(e) => {
                              const value = Number(e.target.value)
                              field.onChange(value)
                              setValue('price', value, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }}
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
                              className='relative aspect-square overflow-hidden rounded-md border bg-muted'
                            >
                              <img
                                src={resolveImageUrl(image)}
                                alt={
                                  index === 0
                                    ? 'Main product'
                                    : `Carousel ${index}`
                                }
                                className='size-full object-cover'
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

      <Dialog open={!!cropSession} onOpenChange={(open) => !open && closeCropper()}>
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Crop Image Square</DialogTitle>
            <DialogDescription>
              Drag the image and adjust zoom. The cropped square image will be
              uploaded after confirmation.
            </DialogDescription>
          </DialogHeader>

          {cropSession && (
            <div className='space-y-4'>
              <div className='text-sm text-muted-foreground'>
                {cropSession.mode === 'main'
                  ? 'Front / main image'
                  : `Carousel image ${
                      cropSession.croppedFiles.length + 1
                    } of ${
                      cropSession.croppedFiles.length +
                      cropSession.remainingFiles.length +
                      1
                    }`}
              </div>

              <div className='flex justify-center'>
                <div
                  className='relative h-80 w-80 touch-none overflow-hidden rounded-md border bg-muted'
                  onPointerDown={onCropPointerDown}
                  onPointerMove={onCropPointerMove}
                  onPointerUp={onCropPointerUp}
                  onPointerCancel={onCropPointerUp}
                >
                  <img
                    src={cropSession.imageUrl}
                    alt='Crop preview'
                    className='absolute left-1/2 top-1/2 max-w-none select-none'
                    draggable={false}
                    onLoad={(event) =>
                      setCropNaturalSize({
                        width: event.currentTarget.naturalWidth,
                        height: event.currentTarget.naturalHeight,
                      })
                    }
                    style={{
                      width: cropDisplayWidth,
                      height: cropDisplayHeight,
                      transform: `translate(-50%, -50%) translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                    }}
                  />
                  <div className='pointer-events-none absolute inset-0 border-2 border-primary/80' />
                </div>
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium'>
                  Zoom
                </label>
                <Input
                  type='range'
                  min='1'
                  max='3'
                  step='0.05'
                  value={cropZoom}
                  onChange={(event) => setCropZoom(Number(event.target.value))}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type='button' variant='outline' onClick={closeCropper}>
              Cancel
            </Button>
            <Button type='button' onClick={confirmCrop} disabled={isSaving}>
              {isSaving && <Loader2 className='animate-spin' />}
              Crop & Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
