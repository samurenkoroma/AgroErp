import {apiClient} from '@/api/client';
import {CreateCropRequest, CropFilters, UpdateCropRequest} from "@/entities/agronomy/crop/dto.ts";
import {Crop} from "@/entities/agronomy/crop/model.ts";
import {ResponseId} from "@/entities/shared/dto.ts";


export const cropApi = {
    createCrop: (data: CreateCropRequest) => apiClient.command<ResponseId>('agronomy.create_crop', data),
    updateCrop: (data: UpdateCropRequest) => apiClient.command<ResponseId>('agronomy.update_crop', data),
    archiveCrop: (id: string) => apiClient.command<ResponseId>('agronomy.archive_crop', {id}),
    getCrop: (id: string) => apiClient.query<Crop>('agronomy.get_crop', {id}),
    listCrops: (filters: CropFilters) => apiClient.query<Crop[]>('agronomy.list_crops', filters)
}

