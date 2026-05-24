import {apiClient} from '@/api';
import {Crop, Variety} from "@/entities/crop";

export const cropApi = {
    getCrops: async () => await apiClient.query<Crop[]>('agronomy.get_crops', {}),
    getVarieties: async (params: { cropKey: string }) => await apiClient.query<Variety[]>('getVarieties', params),
    getVarietyById: async (id: string) => await apiClient.query<Variety>('getVarieties', {id}),

}


