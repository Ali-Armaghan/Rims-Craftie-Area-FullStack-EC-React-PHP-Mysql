import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedProducts } from '@/services/api';

export function useFeaturedProducts() {
    const { data: products = [], isLoading, error } = useQuery({
        queryKey: ['featured-products'],
        queryFn: fetchFeaturedProducts,
        staleTime: 1000 * 60 * 30, // Featured products change rarely, fresh for 30 min
    });

    return {
        products,
        isLoading,
        error: error instanceof Error ? error.message : error
    };
}
