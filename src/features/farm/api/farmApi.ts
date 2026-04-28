import {apiClient} from '@/api/client';
import {ENDPOINTS} from '@/api/endpoints';
import {Farm} from "@/entities";

export const farmApi = {
    async getCurrentFarm(): Promise<Farm> {
        return await apiClient.post<Farm>(ENDPOINTS.Queries, {
            query: 'GetCurrentFarm',
            data: {},
        });
    },
}