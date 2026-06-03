import {useQuery} from "@tanstack/react-query";
import {varietyApi} from "@/features/agronomy/variety/api";

export const useVariety = (id: string) => useQuery({
    queryKey: ["variety", id],
    enabled: !!id,
    queryFn: () => varietyApi.getVariety(id),
})

export const useVarieties = (cropKey?: string) => useQuery({
    queryKey: ["varieties", cropKey],
    queryFn: () => varietyApi.listVarieties(cropKey!)
})