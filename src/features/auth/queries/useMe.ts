import {useQuery} from "@tanstack/react-query";
import {authApi} from "@/features/auth/api";
import {useAuthStore} from "@/stores/authStore.ts";

export const useMe = () => {
    const token = useAuthStore(s => s.accessToken);

    return useQuery({
        queryKey: ['me'],
        queryFn: authApi.getMe,
        enabled: !!token, // 👈 важно
    });
};