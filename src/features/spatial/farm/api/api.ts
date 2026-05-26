import {apiClient} from '@/api/client';

import {Farm} from '@/entities/spatial/farm/types';
import {CreateFarmRequest} from "@/entities/spatial/farm/dto.ts";

export const farmApi = {
    getFarm: async (id: string) => apiClient.query<Farm>('spatial.get_farm', {id}),
    listFarms: async () => apiClient.query<Farm[]>('spatial.list_farms', {}),
    createFarm: async (data: CreateFarmRequest) => apiClient.command('spatial.create_farm', data)

}