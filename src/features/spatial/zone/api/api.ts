import {apiClient} from '@/api/client';

export const zoneApi = {
    createZone: async (data: {}) => apiClient.command('spatial.create_zone', data),
    updateZone: async (data: {}) => apiClient.command('spatial.update_zone', data),
    archiveZone: async (data: {}) => apiClient.command('spatial.archive_zone', data),

    getZone: async (id: string) => apiClient.query('spatial.get_zone', {id}),
    listZones: async () => apiClient.query('spatial.list_zones', {}),

}