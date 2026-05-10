import {useQuery} from "@tanstack/react-query";
import {cropApi} from "@/features/catalog/api";
import {Crop} from "@/entities";

const CropQueryKey = ['catalog', 'crop']

export const useCrops = () =>
    useQuery({
        queryKey: CropQueryKey,
        queryFn: cropApi.getCrops,
        staleTime: Infinity,

    });

export const useGreenhouseCrops = () => {
    const types = ['Овощные', 'Зеленные']

    return useQuery({
        queryKey: CropQueryKey,
        queryFn: cropApi.getCrops,
        staleTime: Infinity,
        select: (crops) => {
            return crops.filter((crop: Crop) => types.includes(crop.category))
        },
    });
}


export const useCrop = (key: string) =>
    useQuery({
        queryKey: CropQueryKey,
        queryFn: cropApi.getCrops,
        staleTime: Infinity,
        select: (crops) => crops.find(c => c.key === key),
    });
