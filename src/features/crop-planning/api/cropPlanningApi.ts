// src/features/crop-planning/api/cropPlanningApi.ts
import {apiClient} from '@/api/client';
import {mockCropPlanningApi} from '../../../data/mock-data.ts';
import {CreateCropPlanRequest, CropPlan, CultivationPlan, CurrentPhenology} from '../../../entities/planning/types.ts';
import {CultivationArea} from "@/entities/planning/types.ts";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_CROP_PLANNING === 'true' || true;

export const cropPlanningApi = {

    // ============ CULTIVATION PLANS ============
    getCultivationPlans: (cropId?: string): Promise<CultivationPlan[]> => {
        if (USE_MOCK) return mockCropPlanningApi.getCultivationPlans(cropId);
        const params = cropId ? `?cropId=${cropId}` : '';
        return apiClient.get(`/cultivation-plans${params}`);
    },

    getCultivationAreas: (params?: { objectId: string }) => {
        return apiClient.query<CultivationArea[]>('getCultivationAreas', params || {});
    },

    getCultivationPlan: (id: string): Promise<CultivationPlan> => {
        if (USE_MOCK) return mockCropPlanningApi.getCultivationPlan(id);
        return apiClient.get(`/cultivation-plans/${id}`);
    },

    // ============ CROP PLANS ============
    createCropPlan: (data: CreateCropPlanRequest): Promise<CropPlan> => {
        if (USE_MOCK) return mockCropPlanningApi.createCropPlan(data);
        return apiClient.post('/crop-plans', data);
    },

    getCropPlans: (): Promise<CropPlan[]> => {
        return apiClient.query<CropPlan[]>("getCropPlans", {});
    },

    getCropPlan: (id: string): Promise<CropPlan> => {
        if (USE_MOCK) return mockCropPlanningApi.getCropPlan(id);
        return apiClient.get(`/crop-plans/${id}`);
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
