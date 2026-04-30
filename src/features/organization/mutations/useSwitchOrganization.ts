import {useMutation} from '@tanstack/react-query';
import {organizationApi} from '@/features/organization/api';
import {useAuthStore} from '@/stores/authStore';
import {queryClient} from "@/shared/queryClient.ts";

export const useSwitchOrganization = () => {

    const setTokens = useAuthStore(s => s.setTokens);
    const setCurrentOrgId = useAuthStore(s => s.setCurrentOrganizationId);

    return useMutation({
        mutationFn: organizationApi.switchOrganization,

        onSuccess: async (data, orgId) => {
            // 🔑 1. обновляем токен
            setTokens(data!.tokenPair!.accessToken, useAuthStore.getState().refreshToken!);

            // 🔑 2. обновляем текущую организацию
            setCurrentOrgId(orgId);
            // 🔄 3. инвалидируем данные (права могли измениться)
            await queryClient.invalidateQueries({queryKey: ['me']});
            await queryClient.invalidateQueries({queryKey: ['organizations']});
            await queryClient.invalidateQueries({queryKey: ['farmObjects']});
            await queryClient.invalidateQueries({queryKey: ['seasons']});
        },
    });
};