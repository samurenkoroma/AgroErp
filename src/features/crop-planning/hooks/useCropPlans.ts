// src/features/crop-planning/hooks/useCropPlans.ts
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {cropPlanningApi} from '../api/cropPlanningApi';
import {CreateCropPlanRequest} from "@/entities/planning";
import {toCropPlanCard} from "@/features/crop-planning/mapper/toCropPlanCard.ts";

export const useCropPlans = () => {
    return useQuery({
        queryKey: ['crop-plans'],
        queryFn: () => cropPlanningApi.getCropPlans(),
    });
};

export const useCropPlanCards = () => {
    return useQuery({
        queryKey: ['crop-plans'],
        queryFn: cropPlanningApi.getCropPlans,
        select: items => items.map(toCropPlanCard),
    });
};

export const useCropPlan = (id: string) =>
    useQuery({
        queryKey: ['crop-plan', id],
        queryFn: cropPlanningApi.getCropPlans,
        enabled: !!id,
        // staleTime: Infinity,
        select: (crops) => crops.find(c => c.id === id),
    });

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