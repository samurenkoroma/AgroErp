// src/features/crop-planning/api/cropPlanningApi.ts
import {apiClient} from '@/api/client';
import {mockCropPlanningApi} from '../../../data/mock-data.ts';
import {CreateCropPlanRequest, CropPlan, CultivationPlan, CurrentPhenology} from '../../../entities/planning/types.ts';
import {CultivationArea} from "@/entities/planning/types.ts";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_CROP_PLANNING === 'true' || true;

export const cropPlanningApi = {

    getCultivationAreas: (params?: { objectId: string }) => {
        return apiClient.query<CultivationArea[]>('getCultivationAreas', params || {});
    },

    // ============ CULTIVATION PLANS ============
    getCultivationPlans: (cropKey?: string): Promise<CultivationPlan[]> => {
        return apiClient.query("getCultivationPlans", {cropKey});
    },


    getCultivationPlan: (id: string) => {
        return apiClient.query<CultivationPlan>("getCultivationPlans", {id});
    },

    // ============ CROP PLANS ============
    createCropPlan: (data: CreateCropPlanRequest): Promise<CropPlan> => {
        return apiClient.command('createCropPlan', data);
    },

    getCropPlans: (): Promise<CropPlan[]> => {
        return apiClient.query<CropPlan[]>("getCropPlans", {});
    },

    updateCropPlanStatus: (id: string, status: CropPlan['status']): Promise<CropPlan> => {
        if (USE_MOCK) return mockCropPlanningApi.updateCropPlanStatus(id, status);
        return apiClient.patch(`/crop-plans/${id}/status`, {status});
    },

    // ============ PHENOLOGY ============
    getPhenology: (planId: string): Promise<CurrentPhenology> => {
        if (USE_MOCK) return mockCropPlanningApi.getPhenology(planId);
        return apiClient.get(`/crop-plans/${planId}/phenology`);
    },
}
