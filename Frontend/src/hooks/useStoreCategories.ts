import { useQuery } from '@tanstack/react-query';
import { fetchStoreCategories } from '@/services/api';

export function useStoreCategories(limit = 4) {
    const { data: categories = [], isLoading, error } = useQuery({
        queryKey: ['store-categories', limit],
        queryFn: () => fetchStoreCategories(limit),
        staleTime: 1000 * 60 * 10,
    });

    return {
        categories,
        isLoading,
        error: error instanceof Error ? error.message : error,
    };
}
