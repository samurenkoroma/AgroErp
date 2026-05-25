import {CreateVarietyRequest} from "@/entities/agronomy/variety/dto.ts";
import {useMutation} from "@tanstack/react-query";
import {varietyApi} from "@/features/agronomy/variety/api";

export const useCreateVariety = (data: CreateVarietyRequest) => useMutation({
        mutationFn: () => varietyApi.createVariety(data),
    }
)