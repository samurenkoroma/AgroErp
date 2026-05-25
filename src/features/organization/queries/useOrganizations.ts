import {useQuery} from '@tanstack/react-query';
import {getAccessToken} from '@/stores/authStore.ts';
import {authApi} from "@/features/auth/api";

export const useOrganizations = () => {
    const token = getAccessToken()

    return useQuery({
        queryKey: ['organizations'],
        queryFn: authApi.getMe,
        enabled: !!token, // 🔑 важно
        select: data => data.organizations
    });
};