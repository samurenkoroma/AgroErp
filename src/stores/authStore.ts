import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {jwtDecode} from "jwt-decode";

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    role: string | undefined;
    setTokens: (access: string, refresh: string) => void;
    clearAuth: () => void;

    currentOrganizationId: string | undefined;
    setCurrentOrganizationId: (id: string | undefined) => void;
}

interface JWTPayload {
    role: string;
}
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            currentOrganizationId: undefined,
            role: undefined,

            setTokens: (access, refresh) => {
                const {role} = jwtDecode<JWTPayload>(access);
                set({
                    role: role,
                    accessToken: access,
                    refreshToken: refresh,
                    isAuthenticated: true,
                })
            },

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
