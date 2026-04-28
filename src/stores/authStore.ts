import {create} from 'zustand';
import {persist} from 'zustand/middleware';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;

    setTokens: (access: string, refresh: string) => void;
    clearAuth: () => void;

    currentOrganizationId: string | undefined;
    setCurrentOrganizationId: (id: string | undefined) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            currentOrganizationId: undefined,

            setTokens: (access, refresh) =>
                set({
                    accessToken: access,
                    refreshToken: refresh,
                    isAuthenticated: true,
                }),

            clearAuth: () =>
                set({
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                }),
            setCurrentOrganizationId: (id: string | undefined) => {
                set({currentOrganizationId: id});
            },
        }),
        {name: 'auth-storage'}
    )
);

export const getAccessToken = () => useAuthStore.getState().accessToken
export const currentOrgId = () => useAuthStore.getState().currentOrganizationId