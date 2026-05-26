import {useMutation} from "@tanstack/react-query";
import {zoneApi} from "@/features/spatial/zone/api/api.ts";


export const useCreateZone = (data: {}) => useMutation({
    mutationFn: () => zoneApi.createZone(data)
})
export const useUpdateZone = (data: {}) => useMutation({
    mutationFn: () => zoneApi.updateZone(data)
})
export const useArchiveZone = (data: {}) => useMutation({
    mutationFn: () => zoneApi.archiveZone(data)
})