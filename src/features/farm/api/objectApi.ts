import {apiClient} from '@/api/client';
import {ENDPOINTS} from '@/api/endpoints';
import {CreateFieldCommand, FarmObject, UpdateObjectCommand} from "@/entities";

export const objectApi = {
    async getObjectById(id: string): Promise<FarmObject> {
        return await apiClient.post<FarmObject>(ENDPOINTS.Queries, {
            query: 'GetObjects',
            data: {id},
        });
    },

    async getAll(): Promise<FarmObject[]> {
        return await apiClient.post<FarmObject[]>(ENDPOINTS.Queries, {
            query: 'GetObjects',
            data: {},
        });
    },

    async createField(payload: CreateFieldCommand): Promise<void> {
        return await apiClient.post(ENDPOINTS.Commands, {
            command: 'CreateObject',
            data: payload,
        });
    },

    async updateObject(id: string, payload: UpdateObjectCommand): Promise<void> {
        return await apiClient.post(ENDPOINTS.Commands, {
            command: 'UpdateObject',
            data: {id, ...payload},
        });
    },

    async deleteObject(id: string): Promise<void> {
        return await apiClient.post(ENDPOINTS.Commands, {
            command: 'DeleteObject',
            data: {id},
        });
    },
}