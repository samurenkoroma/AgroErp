import {useQuery} from "@tanstack/react-query";
import {cropApi} from "@/features/crops/api";
import {Variety} from "@/entities";

export const useVariety = (key: string, id:string) => {
    return useQuery({
        queryKey: ["variety", id],
        queryFn: (): Promise<Variety> => cropApi.getVarietyById(key!, id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,        // 5 минут
        gcTime: 10 * 60 * 1000,          // 10 минут
    })
}