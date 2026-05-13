import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useProducts } from '../context/products-context'
import apiClient from '@/lib/api-client'
import { useQueryClient } from '@tanstack/react-query'

export function ProductDeleteDialog() {
  const { open, setOpen, currentRow } = useProducts()
  const queryClient = useQueryClient()

  const onDelete = async () => {
    try {
      await apiClient.delete('/products', {
        params: { id: currentRow?.id },
      })
      toast.success('Product deleted successfully')
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      setOpen(null)
    } catch {
      toast.error('Failed to delete product')
    }
  }

  return (
    <AlertDialog open={open === 'delete'} onOpenChange={() => setOpen(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the product
            <strong> {currentRow?.name}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className='bg-red-600 hover:bg-red-700'>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
