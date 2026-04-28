import {useAuthStore} from "@/stores/authStore.ts";
import {authApi} from "@/features/auth/api/authApi.ts";

let refreshPromise: Promise<string | null> | null = null;

const refreshTokenRequest = async (): Promise<string | null> => {
    const {refreshToken, setTokens, clearAuth} = useAuthStore.getState();

    if (!refreshToken) {
        clearAuth();
        return null;
    }

    try {
        const res = await authApi.refreshToken({refreshToken: refreshToken});

        setTokens(res.accessToken, res.refreshToken);

        return res.accessToken;
    } catch (e) {
        clearAuth();
        return null;
    }
};


export const getFreshToken = async () => {
    if (!refreshPromise) {
        refreshPromise = refreshTokenRequest().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};