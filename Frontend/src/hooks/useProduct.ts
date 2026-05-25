import { useQuery } from '@tanstack/react-query';
import { fetchProduct } from '@/services/api';

export function useProduct(slug: string | undefined) {
    const { data: product = null, isLoading, error } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => fetchProduct(slug!),
        enabled: !!slug,
        staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    });

    return {
        product,
        isLoading,
        error: error instanceof Error ? error.message : error
    };
}
