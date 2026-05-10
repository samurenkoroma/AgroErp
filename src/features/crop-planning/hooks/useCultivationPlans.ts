// src/features/crop-planning/hooks/useCultivationPlans.ts
import {useQuery} from '@tanstack/react-query';
import {cropPlanningApi} from '../api/cropPlanningApi';

export const useCultivationPlans = (cropId?: string) => {
    return useQuery({
        queryKey: ['cultivation-plans', cropId],
        queryFn: () => cropPlanningApi.getCultivationPlans(cropId),
    });
};

export const useCultivationPlan = (id: string) => {
    return useQuery({
        queryKey: ['cultivation-plan', id],
        queryFn: () => cropPlanningApi.getCultivationPlan(id),
        enabled: !!id,
    });
};