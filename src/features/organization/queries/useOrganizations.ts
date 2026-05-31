import {useQuery} from '@tanstack/react-query';
import {getAccessToken} from '@/stores/authStore.ts';
import {authApi} from "@/features/auth/api";

export const useOrganizations = () => {
    const token = getAccessToken()

    return useQuery({
        queryKey: ['me'],
        queryFn: authApi.getMe,
        staleTime: 1000 * 60 * 5, // 5 минут кеш
        enabled: !!token, // 🔑 важно
        select: data => data.organizations
    });
};