import {useQuery} from '@tanstack/react-query';
import {cropApi} from "./api"
import {CropFilters} from "@/entities/agronomy/crop/dto.ts";

export const useCrop = (id?: string) => useQuery({
    queryKey: ['crop', id],
    enabled: !!id,
    queryFn: () => cropApi.getCrop(id!)
})


export const useCrops = (filters: CropFilters) => useQuery({
    queryKey: ['crops', filters],
    queryFn: () => cropApi.listCrops(filters)
})
