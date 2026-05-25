import {apiClient} from '@/api/client';
import {GrowingCycle} from "@/entities/production";


export const getGrowingCycle = async (id: string) => await apiClient.query<GrowingCycle>('production.get_growing_cycle', {id});
export const listGrowingCycles = async (productionUnitId: string) => apiClient.query<GrowingCycle[]>('production.list_growing_cycles', {productionUnitId});
