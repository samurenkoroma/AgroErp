import {useQuery} from "@tanstack/react-query";
import {plantingApi} from "@/features/planting/api";
import {CropPlan, CropPlanListItem, PlanStatistics} from "@/features/planting";

export const useCropPlans = () => {
    return useQuery({
        queryKey: ["cropPlans"],
        queryFn: (): Promise<CropPlanListItem[]> => plantingApi.listCropPlans(),
        staleTime: 5 * 60 * 1000,        // 5 минут
        gcTime: 10 * 60 * 1000,          // 10 минут
    })
}

export const useCropPlan = (planId: string) => {
    return useQuery({
        queryKey: ["cropPlan", planId],
        queryFn: (): Promise<CropPlan> => plantingApi.getCropPlan(planId),
        enabled: !!planId,
        staleTime: 5 * 60 * 1000,        // 5 минут
        gcTime: 10 * 60 * 1000,          // 10 минут
    })
}

export const usePlanStatistics = (planId: string) => {
    return useQuery({
        queryKey: ["planStatistics", planId],
        queryFn: (): Promise<PlanStatistics> => plantingApi.getPlanStatistics(planId),
        enabled: !!planId,
        staleTime: 5 * 60 * 1000,        // 5 минут
        gcTime: 10 * 60 * 1000,          // 10 минут
    })
}