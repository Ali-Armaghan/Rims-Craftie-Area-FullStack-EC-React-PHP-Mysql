import { useEffect, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import apiClient from '@/lib/api-client'

type ReviewStatus = 'approved' | 'pending'

type Review = {
  id: number
  product_id: number
  product_name: string | null
  reviewer: string
  reviewer_email: string
  review: string
  rating: number
  status: ReviewStatus
  date_created: string
}

type ProductOption = {
  id: number
  name: string
}

type ReviewForm = {
  id?: number
  product_id: string
  reviewer: string
  reviewer_email: string
  review: string
  rating: string
  status: ReviewStatus
}

const defaultForm: ReviewForm = {
  product_id: '',
  reviewer: '',
  reviewer_email: '',
  review: '',
  rating: '5',
  status: 'approved',
}

function ReviewDialog({
  open,
  review,
  products,
  onOpenChange,
}: {
  open: boolean
  review: Review | null
  products: ProductOption[]
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ReviewForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(review)

  useEffect(() => {
    if (!open) return

    if (review) {
      setForm({
        id: review.id,
        product_id: String(review.product_id),
        reviewer: review.reviewer,
        reviewer_email: review.reviewer_email,
        review: review.review,
        rating: String(review.rating),
        status: review.status,
      })
    } else {
      setForm(defaultForm)
    }
  }, [open, review])

  const updateField = (field: keyof ReviewForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const saveReview = async () => {
    if (!form.product_id || !form.reviewer || !form.reviewer_email || !form.review) {
      toast.error('Please fill all required fields')
      return
    }

    setSaving(true)
    const payload = {
      id: form.id,
      product_id: Number(form.product_id),
      reviewer: form.reviewer,
      reviewer_email: form.reviewer_email,
      review: form.review,
      rating: Number(form.rating),
      status: form.status,
    }

    try {
      if (isEdit) {
        await apiClient.put('/reviews', payload)
        toast.success('Review updated')
      } else {
        await apiClient.post('/reviews', payload)
        toast.success('Review created')
      }
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      onOpenChange(false)
    } catch {
      toast.error('Failed to save review')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Review' : 'Add Review'}</DialogTitle>
          <DialogDescription>
            Manage product review content, rating, and approval status.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Product</label>
            <Select
              value={form.product_id}
              onValueChange={(value) => updateField('product_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select product' />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={String(product.id)}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='grid gap-2'>
              <label className='text-sm font-medium'>Reviewer</label>
              <Input
                value={form.reviewer}
                onChange={(event) => updateField('reviewer', event.target.value)}
                placeholder='Customer name'
              />
            </div>
            <div className='grid gap-2'>
              <label className='text-sm font-medium'>Email</label>
              <Input
                type='email'
                value={form.reviewer_email}
                onChange={(event) =>
                  updateField('reviewer_email', event.target.value)
                }
                placeholder='customer@example.com'
              />
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='grid gap-2'>
              <label className='text-sm font-medium'>Rating</label>
              <Select
                value={form.rating}
                onValueChange={(value) => updateField('rating', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={String(rating)}>
                      {rating} star{rating > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <label className='text-sm font-medium'>Status</label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  updateField('status', value as ReviewStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='approved'>Approved</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Review</label>
            <Textarea
              className='min-h-28'
              value={form.review}
              onChange={(event) => updateField('review', event.target.value)}
              placeholder='Review text'
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={saveReview} disabled={saving}>
            {saving ? 'Saving...' : 'Save Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReviewStatusSelect({ review }: { review: Review }) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const updateStatus = async (status: ReviewStatus) => {
    setLoading(true)
    try {
      await apiClient.put('/reviews', { id: review.id, status })
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Review status updated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select value={review.status} onValueChange={updateStatus} disabled={loading}>
      <SelectTrigger className='h-8 w-32'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='approved'>Approved</SelectItem>
        <SelectItem value='pending'>Pending</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function Reviews() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const response = await apiClient.get('/reviews')
      return response.data
    },
  })

  const { data: products = [] } = useQuery<ProductOption[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient.get('/products')
      return response.data
    },
  })

  const openAddDialog = () => {
    setSelectedReview(null)
    setDialogOpen(true)
  }

  const openEditDialog = (review: Review) => {
    setSelectedReview(review)
    setDialogOpen(true)
  }

  const deleteReview = async (review: Review) => {
    if (!window.confirm(`Delete review by ${review.reviewer}?`)) return

    try {
      await apiClient.delete('/reviews', { params: { id: review.id } })
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Review deleted')
    } catch {
      toast.error('Failed to delete review')
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
            <h2 className='text-2xl font-bold tracking-tight'>Reviews</h2>
            <p className='text-muted-foreground'>
              Manage customer reviews for store products.
            </p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className='mr-2 h-4 w-4' /> Add Review
          </Button>
        </div>

        <div className='rounded-md border'>
          {isLoading ? (
            <div className='p-8 text-center text-muted-foreground'>
              Loading reviews...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className='w-28 text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length ? (
                  reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className='font-medium'>
                        {review.product_name ?? `#${review.product_id}`}
                      </TableCell>
                      <TableCell>
                        <div className='font-medium'>{review.reviewer}</div>
                        <div className='text-xs text-muted-foreground'>
                          {review.reviewer_email}
                        </div>
                      </TableCell>
                      <TableCell>{'★'.repeat(Number(review.rating))}</TableCell>
                      <TableCell>
                        <ReviewStatusSelect review={review} />
                      </TableCell>
                      <TableCell className='max-w-sm truncate'>
                        {review.review}
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {new Date(review.date_created).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => openEditDialog(review)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='destructive'
                            size='icon'
                            onClick={() => deleteReview(review)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className='h-24 text-center'>
                      No reviews found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Main>

      <ReviewDialog
        open={dialogOpen}
        review={selectedReview}
        products={products}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
