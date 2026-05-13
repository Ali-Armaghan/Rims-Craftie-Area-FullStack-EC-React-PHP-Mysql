import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductReviews, submitProductReview } from '@/services/api';
import { toast } from 'sonner';

export function useProductReviews(productId: string | undefined) {
    return useQuery({
        queryKey: ['product-reviews', productId],
        queryFn: () => fetchProductReviews(productId!),
        enabled: !!productId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useSubmitReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: submitProductReview,
        onSuccess: (_, variables) => {
            // Invalidate the reviews for this specific product
            queryClient.invalidateQueries({ queryKey: ['product-reviews', variables.product_id.toString()] });
            toast.success('Review submitted successfully!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to submit review');
        },
    });
}
