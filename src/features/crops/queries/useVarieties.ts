import {useQuery} from "@tanstack/react-query";
import {cropApi} from "@/features/crops/api";
import {Variety} from "@/entities";

export const useVarieties = (key: string) => {
    return useQuery({
        queryKey: ["varieties", key],
        queryFn: (): Promise<Variety[]> => cropApi.listVarieties({speciesKey: key}),
        staleTime: 10 * 60 * 1000,   // 10 минут
    })
}