import {useMutation} from '@tanstack/react-query';
import {CreateCycleRequest} from "@/entities/production/growing-cycle/dto.ts";
import {cycleApi} from "@/features/production/growing_cycle/api/api.ts";

export const useCreateCycle = () => {
    return useMutation({
        mutationFn: (data: CreateCycleRequest) => cycleApi.createCycle(data)
    })
}
