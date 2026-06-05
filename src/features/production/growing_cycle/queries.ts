import {useQuery} from '@tanstack/react-query';
import {getAccessToken} from "@/stores/authStore.ts";
import {cycleApi} from "@/features/production/growing_cycle/api/api.ts";


export const useCycles = () => {
    const token = getAccessToken()

    return useQuery({
        queryKey: ['growing-cycles'],
        enabled: !!token, // 🔑 важно
        queryFn: cycleApi.list,
        staleTime: 1000 * 60 * 5, // 5 минут кеш
    })
}