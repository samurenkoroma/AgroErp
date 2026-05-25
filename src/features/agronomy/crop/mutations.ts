import {useMutation} from '@tanstack/react-query';
import {cropApi} from "@/features/agronomy/crop/api";
import {CreateCropRequest} from "@/entities/agronomy/crop/dto.ts";

export const useCreateCrop = (data: CreateCropRequest) => useMutation({
    mutationFn: () => cropApi.createCrop(data)
})
