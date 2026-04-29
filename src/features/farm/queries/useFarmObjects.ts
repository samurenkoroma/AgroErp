import {useQuery} from '@tanstack/react-query';
import {objectApi} from '../api';
import {getAccessToken} from "@/stores/authStore.ts";

export const useFarmObjects = () => {
    const token = getAccessToken()

    return useQuery({
        queryKey: ['farmObjects'],
        queryFn: objectApi.getAll,
        enabled: !!token, // 🔑 важно
        staleTime: 1000 * 60 * 5, // 5 минут кеш
    });
};