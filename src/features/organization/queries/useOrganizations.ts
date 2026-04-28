import {useQuery} from '@tanstack/react-query';
import {organizationApi} from '@/features/organization/api';
import {getAccessToken} from '@/stores/authStore';

export const useOrganizations = () => {
    const token = getAccessToken()

    return useQuery({
        queryKey: ['organizations'],
        queryFn: organizationApi.getUserOrganizations,
        enabled: !!token, // 🔑 важно
        staleTime: 1000 * 60 * 5, // 5 минут кеш
    });
};