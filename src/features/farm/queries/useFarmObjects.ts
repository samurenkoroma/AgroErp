import {useQuery} from '@tanstack/react-query';
import {objectApi} from '../api';

export const useFarmObjects = (farmId?: string) => {
    return useQuery({
        queryKey: ['farmObjects'],
        queryFn: () => objectApi.getAll(farmId),
    });
};