import {useMutation} from "@tanstack/react-query";
import {seasonApi} from "@/features/season/api/seasonApi.ts";
import {queryClient} from "@/shared/queryClient.ts";
import {CreateSeasonDTO, Season} from "@/entities/season";

export const useCreateSeason = () => {

    return useMutation({
        mutationFn: seasonApi.create,

        onMutate: async (payload: CreateSeasonDTO) => {
            await queryClient.cancelQueries({queryKey: ['seasons']});

            const prev = queryClient.getQueryData<Season[]>(['seasons'])
            const season: Season = {
                id: "temp-id",
                name: payload.name,
                startDate: payload.startDate,
                endDate: payload.endDate,
                status: 'planning',

            }
            queryClient.setQueryData(["seasons"], (old: Season[] = []) => [
                ...old,
                season
            ])
            return {prev};
        },

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['seasons']});
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) {
                queryClient.setQueryData(['seasons'], ctx.prev);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({queryKey: ['seasons']});
        },
    })
}