// src/features/crop-planning/hooks/usePhenology.ts
import {useQuery} from '@tanstack/react-query';
import {cropPlanningApi} from '../api/cropPlanningApi';

export const usePhenology = (planId: string) => {
    return useQuery({
        queryKey: ['phenology', planId],
        queryFn: () => cropPlanningApi.getPhenology(planId),
        enabled: !!planId,
        refetchInterval: 3600000, // Обновляем каждый час
    });
};