import { useQuery } from '@tanstack/react-query';
import { fetchStoreCategories } from '@/services/api';

export function useMegaMenuCategories() {
    const { data: categories = [], isLoading, error } = useQuery({
        queryKey: ['store-categories', 'all'],
        queryFn: () => fetchStoreCategories(),
        staleTime: 1000 * 60 * 10,
    });

    return {
        categories,
        isLoading,
        error: error instanceof Error ? error.message : error,
    };
}
