import {useQuery} from "@tanstack/react-query";
import {productionUnitApi} from "@/features/spatial/production-unit/api/api.ts";


export const useProductionUnit = (id: string) => useQuery({
    queryKey: ['productionUnit', id],
    enabled: !!id,
    queryFn: () => productionUnitApi.getProductionUnit(id)
})

export const useProductionUnits = (farmId: string) => useQuery({
    queryKey: ['productionUnits', farmId],
    enabled: !farmId,
    queryFn: () => productionUnitApi.listProductionUnits(farmId)
})

export const useProductionUnitTree = (farmId: string) => useQuery({
    queryKey: ['productionUnitTree', farmId],
    enabled: !farmId,
    queryFn: () => productionUnitApi.getProductionUnitTree(farmId)
})