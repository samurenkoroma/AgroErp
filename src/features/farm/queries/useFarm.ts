import {useQuery} from '@tanstack/react-query';
import {farmApi} from '../api/farmApi';
import {getAccessToken} from "@/stores/authStore.ts";

export const useFarm = () => {
    const token = getAccessToken()

    return useQuery({
        queryKey: ['currentOrg'],
        queryFn: farmApi.getCurrentFarm,
        enabled: !!token, // 🔑 важно
        staleTime: 10 * 60 * 1000,   // 10 минут
    });
}
