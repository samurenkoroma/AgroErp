import {useAuthStore} from '@/stores/authStore.ts';

import {queryClient} from '@/shared/queryClient';
import {authApi} from "@/features/auth/api";

export const loginFlow = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });

    const auth = useAuthStore.getState();

    auth.setTokens(
        res.tokenPair.accessToken,
        res.tokenPair.refreshToken
    );

    auth.setCurrentOrganizationId(res.currentOrgId);

    // 👇 прогреваем кеш
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    await queryClient.invalidateQueries({ queryKey: ['organizations'] });
};