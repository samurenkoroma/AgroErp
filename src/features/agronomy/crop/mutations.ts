import {useMutation} from '@tanstack/react-query';
import {cropApi} from "@/features/agronomy/crop/api";
import {CreateCropRequest} from "@/entities/agronomy/crop/dto.ts";
import {queryClient} from "@/shared/queryClient.ts";

export const useCreateCrop = () => {
    return useMutation({
        mutationFn: (data: CreateCropRequest) => cropApi.createCrop(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['crops', {}]});

        },
        onError: (error) => {
            console.error('Failed to create crop:', error);
        },
    })
}
