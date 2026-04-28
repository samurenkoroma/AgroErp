import {queryClient} from '@/shared/queryClient';
import {useAuthStore} from "@/stores/authStore.ts";
import {authApi} from "@/features/auth/api";

export const initSession = async () => {
    const auth = useAuthStore.getState();

    if (!auth.accessToken) return;

    const me = await queryClient.ensureQueryData({
        queryKey: ['me'],
        queryFn: authApi.getMe,
    });


    if(me?.organizations){
        auth.setCurrentOrganizationId(me.currentOrg.id);
    }

    // await queryClient.ensureQueryData({
    //     queryKey: ['organizations'],
    //     queryFn: organizationApi.getUserOrganizations,
    // });
};