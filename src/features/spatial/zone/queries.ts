import {useQuery} from "@tanstack/react-query";
import {zoneApi} from "@/features/spatial/zone/api/api.ts";

export const useZone = (id: string) => useQuery({
    queryKey: ['zone', id],
    enabled: !!id,
    queryFn: () => zoneApi.getZone(id)
})

export const useProductionUnits = () => useQuery({
    queryKey: ['zones'],
    queryFn: () => zoneApi.listZones()
})

