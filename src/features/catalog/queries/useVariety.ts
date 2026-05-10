import {useQuery} from "@tanstack/react-query";
import {cropApi} from "@/features/catalog/api";
import {Variety} from "@/entities";


export const useVariety = (id: string) => {
    return useQuery({
        queryKey: ['catalog', 'variety', id],
        queryFn: (): Promise<Variety> => cropApi.getVarietyById(id!),
        enabled: !!id,
        staleTime: Infinity,
    })
}

export const useVarieties = (key: string) => {
    return useQuery({
        queryKey: ['catalog', 'varieties', key],
        queryFn: async () => {
            const items = await cropApi.getVarieties({
                cropKey: key,
            });

            // // прогреваем individual cache
            // items.forEach(item => {
            //     queryClient.setQueryData(['catalog', 'variety', item.id], item);
            // });

            return items;
        },
        enabled: !!key,
        staleTime: Infinity,
    })
}
