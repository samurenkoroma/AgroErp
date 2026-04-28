import {apiClient} from '@/api/client';
import {
    AuthResponse,
    LoginRequest,
    MeInfo,
    RefreshTokenRequest,
    RefreshTokenResponse,
    RegisterRequest
} from "@/entities/auth";


export const authApi = {
    login: (data: LoginRequest) => apiClient.post<AuthResponse>(`auth/login`, data),
    register: (data: RegisterRequest) => apiClient.post<AuthResponse>(`auth/register`, data),
    refreshToken: (data: RefreshTokenRequest) => apiClient.post<RefreshTokenResponse>(`auth/refresh`, data),
    getMe: () => apiClient.query<MeInfo>('Me', {}),
    logout: () => apiClient.post(`auth/logout`)


}