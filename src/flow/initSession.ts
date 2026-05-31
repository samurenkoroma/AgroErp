import {queryClient} from '@/shared/queryClient';
import {useAuthStore} from "@/stores/authStore.ts";
import {authApi} from "@/features/auth/api";

export const initSession = async () => {
    const auth = useAuthStore.getState();

    if (!auth.accessToken) return;

    const me = await queryClient.ensureQueryData({
        queryKey: ['me'],
        queryFn: authApi.getMe,
        staleTime: 1000 * 60 * 5, // 5 минут кеш
    });


    if(me?.currentOrgId){
        auth.setCurrentOrganizationId(me.currentOrgId);
    }
};