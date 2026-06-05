import {apiClient} from '@/api/client';
import {CreateCycleRequest, CycleItemResponse} from "@/entities/production/growing-cycle/dto.ts";
import {ResponseId} from "@/entities/shared/dto.ts";


export const cycleApi = {
    createCycle: (data: CreateCycleRequest) => apiClient.command<ResponseId>('production.create_cycle', data),
    list: () => apiClient.query<CycleItemResponse[]>('production.list_growing_cycles', {}),
}

