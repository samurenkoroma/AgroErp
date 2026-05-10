// src/features/crop-planning/hooks/useCropPlans.ts
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {cropPlanningApi} from '../api/cropPlanningApi';
import {CreateCropPlanRequest} from '../../../entities/planning/types.ts';

export const useCropPlans = (status?: string) => {
    return useQuery({
        queryKey: ['crop-plans', status],
        queryFn: () => cropPlanningApi.getCropPlans(),
    });
};

export const useCropPlan = (id: string) => {
    return useQuery({
        queryKey: ['crop-plan', id],
        queryFn: () => cropPlanningApi.getCropPlan(id),
        enabled: !!id,
    });
};

export const useCreateCropPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCropPlanRequest) => cropPlanningApi.createCropPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['crop-plans']});
        },
    });
};

export const useUpdateCropPlanStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, status}: { id: string; status: any }) =>
            cropPlanningApi.updateCropPlanStatus(id, status),
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ['crop-plans']});
            queryClient.invalidateQueries({queryKey: ['crop-plan', data.id]});
        },
    });
};