import {useQuery} from "@tanstack/react-query";
import {cropApi} from "@/features/crops/api";
import {Specie} from "@/entities";

export const useCropType = (key?: string) => {
    return useQuery({
        queryKey: ["species", key],
        queryFn: (): Promise<Specie> => cropApi.getSpecie(key!),
        enabled: !!key,
        staleTime: 5 * 60 * 1000,        // 5 минут
        gcTime: 10 * 60 * 1000,          // 10 минут
    })
}