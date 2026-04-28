import {useQuery} from "@tanstack/react-query";
import {Season} from "@/entities/season";
import {seasonApi} from "@/features/season/api/seasonApi.ts";

export const useListSeasons = () => {
    return useQuery({
        queryKey: ["seasons"],
        queryFn: (): Promise<Season[]> => seasonApi.list(),
        staleTime: 10 * 60 * 1000,   // 10 минут
    })
}