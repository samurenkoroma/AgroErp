import {CropPlan, CropPlanListItem, PlanStatistics} from '../types';
import {apiClient, ENDPOINTS} from "@/api";

export const plantingApi = {
    async listCropPlans(): Promise<CropPlanListItem[]> {
        return await apiClient.post<CropPlanListItem[]>(ENDPOINTS.Queries, {
            query: 'ListCropPlan',
            data: {status: "draft"}
        });
    },
    async getCropPlan(planId: string): Promise<CropPlan> {
        return await apiClient.post<CropPlan>(ENDPOINTS.Queries, {
            query: 'GetCropPlan',
            data: {planId}
        });
    },
    async getPlanStatistics(planId: string): Promise<PlanStatistics> {
        return await apiClient.post<PlanStatistics>(ENDPOINTS.Queries, {
            query: 'GetPlanStatistics',
            data: {planId}
        });
    }
};