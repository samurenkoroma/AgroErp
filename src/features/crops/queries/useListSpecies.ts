import {useQuery} from "@tanstack/react-query";
import {cropApi} from "@/features/crops/api";

export const useListSpecies = () => {
    return useQuery({
        queryKey: ["listSpecies"],
        queryFn: cropApi.getListSpecies,
        staleTime: 10 * 60 * 1000,   // 10 минут
    })
}