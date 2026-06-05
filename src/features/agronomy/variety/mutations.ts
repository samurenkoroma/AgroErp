import {CreateVarietyRequest} from "@/entities/agronomy/variety/dto.ts";
import {useMutation} from "@tanstack/react-query";
import {varietyApi} from "@/features/agronomy/variety/api";
import {queryClient} from "@/shared/queryClient.ts";

export const useCreateVariety = () => {

    return useMutation({
        mutationFn: (data: CreateVarietyRequest) => varietyApi.createVariety(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({queryKey: ['varieties', variables.cropId]});

        },
        onError: (error) => {
            console.error('Failed to create variety:', error);
        },

    })
}
