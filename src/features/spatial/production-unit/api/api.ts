import {apiClient} from '@/api/client';

export const productionUnitApi = {

    createProductionUnit: async (data: {}) => apiClient.command('spatial.create_production_unit', data),
    updateProductionUnit: async (data: {}) => apiClient.command('spatial.update_production_unit', data),
    archiveProductionUnit: async (data: {}) => apiClient.command('spatial.archive_production_unit', data),

    getProductionUnit: async (id: string) => apiClient.query('spatial.get_production_unit', {id}),
    listProductionUnits: async (farmId: string) => apiClient.query('spatial.list_production_units', {farmId}),
    getProductionUnitTree: async (data: {}) => apiClient.query('spatial.get_production_unit_tree', data),

}

