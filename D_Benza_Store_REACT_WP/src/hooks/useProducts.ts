import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/services/api';

export function useProducts() {
    const { data: products = [], isLoading, error } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
        staleTime: 1000 * 60 * 10, // Data is fresh for 10 minutes
    });

    const categories = ["All", ...new Set(products.map(p => p.category))];

    return {
        products,
        categories,
        isLoading,
        error: error instanceof Error ? error.message : error
    };
}
