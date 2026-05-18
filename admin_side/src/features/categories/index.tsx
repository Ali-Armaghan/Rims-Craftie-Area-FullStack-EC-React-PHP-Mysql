import { useEffect, useState, type ChangeEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import apiClient from '@/lib/api-client'

type Category = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  parent_name: string | null
  product_count: number
  show_on_home: number | boolean
  home_sort_order: number
  image?: string | null
}

type CategoryForm = {
  id?: number
  name: string
  slug: string
  parent_id: string
  show_on_home: boolean
  home_sort_order: string
  image: string | null
}

const defaultForm: CategoryForm = {
  name: '',
  slug: '',
  parent_id: 'none',
  show_on_home: false,
  home_sort_order: '0',
  image: null,
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function CategoryDialog({
  open,
  category,
  categories,
  onOpenChange,
}: {
  open: boolean
  category: Category | null
  categories: Category[]
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CategoryForm>(defaultForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(category)

  useEffect(() => {
    if (!open) return

    if (category) {
      setForm({
        id: category.id,
        name: category.name,
        slug: category.slug,
        parent_id: category.parent_id ? String(category.parent_id) : 'none',
        show_on_home: Boolean(Number(category.show_on_home)),
        home_sort_order: String(category.home_sort_order ?? 0),
        image: category.image ?? null,
      })
      setImageFile(null)
      setImagePreview(category.image ?? null)
      setSlugTouched(true)
    } else {
      setForm(defaultForm)
      setImageFile(null)
      setImagePreview(null)
      setSlugTouched(false)
    }
  }, [open, category])

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
    setForm((current) => ({ ...current, image: null }))
  }

  const uploadCategoryImage = async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await apiClient.post('/uploads/categories', formData)
    return typeof response.data?.image === 'string' ? response.data.image : null
  }

  const updateField = (field: keyof CategoryForm, value: string | boolean) => {
    setForm((current) => {
      const next = { ...current, [field]: value }

      if (field === 'name' && typeof value === 'string' && !slugTouched) {
        next.slug = slugify(value)
      }

      return next
    })
  }

  const parentOptions = categories.filter(
    (item) => !category || item.id !== category.id
  )

  const saveCategory = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setSaving(true)

    try {
      let imageUrl = form.image
      if (imageFile) {
        imageUrl = await uploadCategoryImage(imageFile)
        if (!imageUrl) {
          toast.error('Failed to upload category image')
          return
        }
      }

      const payload = {
        id: form.id,
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        parent_id: form.parent_id === 'none' ? null : Number(form.parent_id),
        show_on_home: form.show_on_home,
        home_sort_order: Number(form.home_sort_order) || 0,
        image: imageUrl,
      }

      if (isEdit) {
        await apiClient.put('/categories', payload)
        toast.success('Category updated')
      } else {
        await apiClient.post('/categories', payload)
        toast.success('Category created')
      }
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      await queryClient.invalidateQueries({ queryKey: ['store-categories'] })
      onOpenChange(false)
    } catch {
      toast.error('Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogDescription>
            Manage category name, URL slug, and optional parent category.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Name</label>
            <Input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder='e.g. Handbags'
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Slug</label>
            <Input
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true)
                updateField('slug', event.target.value)
              }}
              placeholder='e.g. handbags'
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Menu image</label>
            <p className='text-xs text-muted-foreground'>
              Shown in the Collections dropdown on the storefront header.
            </p>
            {imagePreview ? (
              <div className='relative w-full max-w-[140px]'>
                <img
                  src={imagePreview}
                  alt='Category preview'
                  className='aspect-square w-full border object-cover'
                />
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  className='mt-2 w-full'
                  onClick={clearImage}
                >
                  Remove image
                </Button>
              </div>
            ) : null}
            <Input type='file' accept='image/*' onChange={handleImageChange} />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Parent Category</label>
            <Select
              value={form.parent_id}
              onValueChange={(value) => updateField('parent_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='None (top level)' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>None (top level)</SelectItem>
                {parentOptions.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-start gap-3 rounded-md border p-4'>
            <Checkbox
              id='show_on_home'
              checked={form.show_on_home}
              onCheckedChange={(checked) =>
                updateField('show_on_home', checked === true)
              }
            />
            <div className='grid gap-1 leading-none'>
              <label htmlFor='show_on_home' className='text-sm font-medium'>
                Show on home page
              </label>
              <p className='text-xs text-muted-foreground'>
                Displays category name with up to 8 products on the storefront home page.
              </p>
            </div>
          </div>

          {form.show_on_home && (
            <div className='grid gap-2'>
              <label className='text-sm font-medium'>Home page order</label>
              <Input
                type='number'
                min={0}
                value={form.home_sort_order}
                onChange={(event) => updateField('home_sort_order', event.target.value)}
                placeholder='1 = first, 2 = second…'
              />
              <p className='text-xs text-muted-foreground'>
                Lower number appears first. Example: Handbags = 1, Crossbody = 2.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={saveCategory} disabled={saving}>
            {saving ? 'Saving...' : 'Save Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function Categories() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories')
      return response.data
    },
  })

  const openAddDialog = () => {
    setSelectedCategory(null)
    setDialogOpen(true)
  }

  const openEditDialog = (item: Category) => {
    setSelectedCategory(item)
    setDialogOpen(true)
  }

  const deleteCategory = async (item: Category) => {
    if (!window.confirm(`Delete category "${item.name}"?`)) return

    try {
      const response = await apiClient.delete('/categories', {
        params: { id: item.id },
      })

      if (response.data?.success === false) {
        toast.error(response.data?.message ?? 'Failed to delete category')
        return
      }

      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted')
    } catch {
      toast.error('Failed to delete category')
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
        <div className='mb-4 flex items-center justify-between gap-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Categories</h2>
            <p className='text-muted-foreground'>
              Manage categories. Use home order (1, 2, 3…) to control sequence on the storefront home page.
            </p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className='mr-2 h-4 w-4' /> Add Category
          </Button>
        </div>

        <div className='rounded-md border'>
          {isLoading ? (
            <div className='p-8 text-center text-muted-foreground'>
              Loading categories...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-16'>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Home page</TableHead>
                  <TableHead>Home order</TableHead>
                  <TableHead className='w-28 text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length ? (
                  categories.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=''
                            className='h-10 w-10 object-cover border'
                          />
                        ) : (
                          <span className='text-xs text-muted-foreground'>—</span>
                        )}
                      </TableCell>
                      <TableCell className='font-medium'>{item.name}</TableCell>
                      <TableCell>
                        <Badge variant='outline' className='font-mono text-xs'>
                          {item.slug}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {item.parent_name ?? '—'}
                      </TableCell>
                      <TableCell>{Number(item.product_count ?? 0)}</TableCell>
                      <TableCell>
                        <Badge variant={Number(item.show_on_home) ? 'default' : 'secondary'}>
                          {Number(item.show_on_home) ? 'Visible' : 'Hidden'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {Number(item.show_on_home) ? Number(item.home_sort_order ?? 0) : '—'}
                      </TableCell>
                      <TableCell>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='destructive'
                            size='icon'
                            onClick={() => deleteCategory(item)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className='h-24 text-center'>
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Main>

      <CategoryDialog
        open={dialogOpen}
        category={selectedCategory}
        categories={categories}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
