import {useQuery} from '@tanstack/react-query';
import {farmApi} from "@/features/spatial/farm/api/api.ts";


export const useFarm = (id?: string) => useQuery({
    queryKey: ['farm', id],
    enabled: !!id,
    queryFn: () => farmApi.getFarm(id!)
})

export const useFarms = () => useQuery({
    queryKey: ['farm'],
    queryFn: () => farmApi.listFarms()
})
