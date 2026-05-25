import {apiClient} from '@/api/client';
import {CreateCropRequest, CropFilters, UpdateCropRequest} from "@/entities/agronomy/crop/dto.ts";
import {Crop} from "@/entities/agronomy/crop/model.ts";


export const cropApi = {
    createCrop: (data: CreateCropRequest) => apiClient.command('agronomy.create_crop', data),
    updateCrop: (data: UpdateCropRequest) => apiClient.command('agronomy.update_crop', data),
    archiveCrop: (id: string) => apiClient.command('agronomy.archive_crop', {id}),
    getCrop: (key: string) => apiClient.query<Crop>('agronomy.get_crop', {key}),
    listCrops: (filters: CropFilters) => apiClient.query<Crop[]>('agronomy.list_crops', filters)
}

