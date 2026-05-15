// src/features/crop-planning/hooks/useCultivationPlans.ts
import {useQuery} from '@tanstack/react-query';
import {cropPlanningApi} from '../api/cropPlanningApi';

export const useCultivationPlans = (cropKey?: string) => {
    return useQuery({
        queryKey: ['cultivation-plans', cropKey],
        queryFn: () => cropPlanningApi.getCultivationPlans(cropKey),
    });
};

export const useCultivationPlan = (id: string) => {
    return useQuery({
        queryKey: ['cultivation-plan', id],
        queryFn: () => cropPlanningApi.getCultivationPlan(id),
        enabled: !!id,
    });
};