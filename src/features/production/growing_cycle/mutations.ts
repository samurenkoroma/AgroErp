import {useMutation} from '@tanstack/react-query';
import {cycleApi} from "@/features/production/growing_cycle/api/api.ts";
import {CreateCycleRequest, StartCycleRequest} from "@/entities/production/growing-cycle";
import {queryClient} from "@/shared/queryClient.ts";

export const useCreateCycle = () => {
    return useMutation({
        mutationFn: (data: CreateCycleRequest) => cycleApi.createCycle(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['growing-cycles']
            });
        }
    })
}

export const useStartCycle = () => {
    return useMutation({
        mutationFn: (data: StartCycleRequest) => cycleApi.startCycle(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['growing-cycles']});
        }
    })
}
