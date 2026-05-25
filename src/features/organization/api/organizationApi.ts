// src/entities/organization/organizationApi.ts
import {apiClient} from '@/api/client.ts';
import {Organization} from '@/entities/organization';
import {AuthResponse} from "@/entities/auth";


export const organizationApi = {
    // Сменить организацию
    switchOrganization: (id: string) => apiClient.command<Partial<AuthResponse>>('account.switch_organization', {organization_id: id}),

    // Создать организацию
    createOrganization: (payload: { name: string }) => apiClient.command<Organization>('account.create_organization', payload),

}
