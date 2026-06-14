import {apiClient} from '@/api/client';
import {ResponseId} from "@/entities/shared/dto.ts";
import {
    CreateCycleRequest,
    GrowingListItem,
    OptionHelpersResponse,
    StartCycleRequest
} from "@/entities/production/growing-cycle";


export const cycleApi = {
    createCycle: (data: CreateCycleRequest) => apiClient.command<ResponseId>('production.create_cycle', data),
    startCycle: (data: StartCycleRequest) => apiClient.command<ResponseId>('production.start_cycle', data),
    list: () => apiClient.query<GrowingListItem[]>('production.list_growing_cycles', {}),
    helpers: ()=> apiClient.query<OptionHelpersResponse>('production.helpers', {}),
}
