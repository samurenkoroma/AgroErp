import {useMutation} from "@tanstack/react-query";
import {productionUnitApi} from "@/features/spatial/production-unit/api/api.ts";


export const useCreateProductionUnit = (data: {}) => useMutation({
    mutationFn: () => productionUnitApi.createProductionUnit(data)
})
export const useUpdateProductionUnit = (data: {}) => useMutation({
    mutationFn: () => productionUnitApi.updateProductionUnit(data)
})
export const useArchiveProductionUnit = (data: {}) => useMutation({
    mutationFn: () => productionUnitApi.archiveProductionUnit(data)
})

