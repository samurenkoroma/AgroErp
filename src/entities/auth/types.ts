import {Organization} from "@/entities/organization";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    phone?: string;
    company?: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface AuthResponse {
    tokenPair: TokenPair;
    user: User;
    currentOrgId: string
}

export interface MeInfo {
    user: User;
    organizations: Organization[]
    currentOrgId: string
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}