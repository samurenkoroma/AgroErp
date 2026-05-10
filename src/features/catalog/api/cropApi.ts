import {apiClient} from '@/api';
import {Crop, Variety} from "@/entities";

export const cropApi = {
    getCrops: async () => await apiClient.query<Crop[]>('getCrops', {}),
    getVarieties: async (params: { cropKey: string }) => await apiClient.query<Variety[]>('getVarieties', params),
    getVarietyById: async (id: string) => await apiClient.query<Variety>('getVarieties', {id}),

}


