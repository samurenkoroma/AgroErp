import {useQuery} from '@tanstack/react-query';
import {objectApi} from '@/features/farm/api';
import {FarmObject} from '@/entities';

export const useFarmObject = (id?: string) => {
    return useQuery({
        queryKey: ['farmObject', id],
        queryFn: (): Promise<FarmObject> => objectApi.getObjectById(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,        // 5 минут
        gcTime: 10 * 60 * 1000,          // 10 минут
    });
};