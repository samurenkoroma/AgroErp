import {apiClient, ENDPOINTS} from '@/api';
import {Species, Variety} from "@/entities";

// Параметры запроса GetCropTypes

// Параметры запроса GetVarieties
export interface ListVarietiesQuery {
    speciesKey: string
}

export const cropApi = {

    async getListSpecies(): Promise<Species[]> {
        return await apiClient.post<Species[]>(ENDPOINTS.Queries, {
            query: 'ListSpecies',
            data: {},
        });
    },
    async getSpecies(key: string): Promise<Species> {
        return await apiClient.post<Species>(ENDPOINTS.Queries, {
            query: 'GetSpecies',
            data: {key},
        });
    },

    async listVarieties(params?: ListVarietiesQuery): Promise<Variety[]> {
        return await apiClient.post<Variety[]>(ENDPOINTS.Queries, {
            query: 'ListVarieties',
            data: params || {},
        });
    },

    async getVarietyById(key: string, id: string): Promise<Variety> {
        return await apiClient.post<Variety>(ENDPOINTS.Queries, {
            query: 'GetVariety',
            data: {key, id},
        });
    }
}


