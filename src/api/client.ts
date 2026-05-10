import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {CommandResponse} from "@/api/types.ts";
import {getAccessToken, currentOrgId} from "@/stores/authStore.ts";
import {getFreshToken} from "@/flow/refreshTokenRequest.ts";
import {ENDPOINTS} from "@/api/endpoints.ts";

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Интерсептор для добавления токена
        this.client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = getAccessToken()
                const organizationId = currentOrgId()
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                if (organizationId) {
                    config.headers['X-Organization-ID'] = organizationId;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Интерсептор для обработки ошибок и обновления токена
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status !== 401 || originalRequest._retry) {
                    return Promise.reject(error);
                }

                originalRequest._retry = true;

                const newToken = await getFreshToken();

                if (!newToken) {
                    return Promise.reject(error);
                }

                originalRequest.headers.Authorization = `Bearer ${newToken}`;


                return this.client(originalRequest);
            }
        );
    }


    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.get(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<CommandResponse<T>> = await this.client.post(url, data, config);
        return response.data.data!
    }

    async command<T>(cmd: string, data: any): Promise<T> {
        const response: AxiosResponse<CommandResponse<T>> = await this.client.post(ENDPOINTS.Commands, {
            command: cmd,
            data: data
        });
        return response.data.data!
    }
    async query<T>(cmd: string, query: any): Promise<T> {
        const response: AxiosResponse<CommandResponse<T>> = await this.client.post(ENDPOINTS.Queries, {
            query: cmd,
            data: query
        });
        return response.data.data!
    }

    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.patch(url, data, config);
        return response.data;
    }

}

export const apiClient = new ApiClient();