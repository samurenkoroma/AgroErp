import {apiClient} from '@/api/client';
import {ResponseId} from "@/entities/shared/dto.ts";
import {ProductionUnit} from "@/entities/spatial";
import {CreateProductionUnitRequest} from "@/entities/spatial/production-unit/dto.ts";

export const productionUnitApi = {

    createProductionUnit: async (data: CreateProductionUnitRequest) => apiClient.command<ResponseId>('spatial.create_production_unit', data),
    updateProductionUnit: async (data: {}) => apiClient.command('spatial.update_production_unit', data),
    configureProductionUnit: async (data: {}) => apiClient.command('spatial.configure_production_unit', data),
    archiveProductionUnit: async (data: {}) => apiClient.command('spatial.archive_production_unit', data),

    getProductionUnit: async (id: string) => apiClient.query<ProductionUnit>('spatial.get_production_unit', {id}),
    listProductionUnits: async () => apiClient.query<ProductionUnit[]>('spatial.list_production_units', {}),
    getProductionUnitTree: async (data: {}) => apiClient.query('spatial.get_production_unit_tree', data),

}

