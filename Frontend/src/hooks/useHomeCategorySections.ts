import { useQuery } from '@tanstack/react-query';
import { fetchHomeCategorySections } from '@/services/api';

export function useHomeCategorySections() {
    const { data: sections = [], isLoading, error } = useQuery({
        queryKey: ['home-category-sections'],
        queryFn: () => fetchHomeCategorySections(8),
        staleTime: 1000 * 60 * 5,
    });

    return {
        sections,
        isLoading,
        error: error instanceof Error ? error.message : error,
    };
}
