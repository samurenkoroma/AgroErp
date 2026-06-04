import {useQuery} from "@tanstack/react-query";
import {productionUnitApi} from "@/features/spatial/production-unit/api/api.ts";
import {getAccessToken} from "@/stores/authStore.ts";
import {ProductionUnit} from "@/entities/spatial";


export const useProductionUnit = (id: string) => useQuery({
    queryKey: ['productionUnit', id],
    enabled: !!id,
    queryFn: () => productionUnitApi.getProductionUnit(id)
})

export const useProductionUnits = () => {
    const token = getAccessToken()

    return useQuery({
        queryKey: ['production-units'],
        enabled: !!token, // 🔑 важно
        queryFn: productionUnitApi.listProductionUnits,
        staleTime: 1000 * 60 * 5, // 5 минут кеш
        select: (productionUnits) => {
            const result = {
                all: productionUnits,
                fields : [] as ProductionUnit[],
                greenhouses: [] as ProductionUnit[],
                plots: [] as ProductionUnit[],
                containers: [] as ProductionUnit[],
                hydroponic: [] as ProductionUnit[],
                storages: [] as ProductionUnit[],
            }

            for (const unit of productionUnits) {
                switch (unit.type) {
                    case 'FIELD':
                        result.fields.push(unit)
                        break

                    case 'GREENHOUSE':
                        result.greenhouses.push(unit)
                        break

                    case 'PLOT':
                        result.plots.push(unit)
                        break

                    case 'CONTAINER':
                    case 'RACK':
                    case 'POT':
                    case 'TRAY':
                    case 'RESERVOIR':
                    case 'DWC_TANK':
                        result.containers.push(unit)
                        break
                    case 'STORAGE':
                        result.storages.push(unit)
                        break
                }

                if (
                    unit.properties.capabilities?.includes('HYDROPONIC') ||
                    unit.properties.capabilities?.includes('AEROPONIC')
                ) {
                    result.hydroponic.push(unit)
                }
            }

            return result
        }

    })
}
