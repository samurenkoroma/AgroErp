import {apiClient} from '@/api/client';
import {CreateCycleRequest} from "@/entities/production/growing-cycle/dto.ts";


export const cycleApi = {
    createCycle: (data: CreateCycleRequest) => apiClient.command('production.create_cycle', data),
}

