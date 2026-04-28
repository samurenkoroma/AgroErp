// src/entities/organization/organizationApi.ts
import {apiClient} from '@/api/client';
import {Organization, OrganizationInvite} from '@/entities/organization';
import {ENDPOINTS} from "@/api";
import {AuthResponse, MeInfo} from "@/entities/auth";


export const organizationApi = {

    // Сменить организацию
    switchOrganization: (id: string) => apiClient.command<Partial<AuthResponse>>('SwitchOrganization', {organization_id: id}),

    // Создать организацию
    createOrganization: (payload: { name: string }) => apiClient.command<Organization>('CreateOrganization', payload),

    getUserOrganizations: async () => {
        const res = await apiClient.query<MeInfo>('Me', {});
        return res.organizations;
    },
    // Обновить организацию
    async updateOrganization(id: string, payload: { name: string }): Promise<Organization> {
        return await apiClient.post(ENDPOINTS.Commands, {
            command: 'UpdateOrganization',
            data: {id, ...payload},
        });
    },

    // Получить приглашения
    async getInvites(): Promise<OrganizationInvite[]> {
        return apiClient.post(ENDPOINTS.Queries, {
            query: "GetInvites",
            data: {}
        });
    },

    // Принять приглашение
    async acceptInvite(inviteId: string): Promise<void> {
        return await apiClient.post(ENDPOINTS.Commands, {
            command: 'AcceptInvite',
            data: {inviteId},
        });
    },

    // Отклонить приглашение
    async declineInvite(inviteId: string): Promise<void> {
        return await apiClient.post(ENDPOINTS.Commands, {
            command: 'DeclineInvite',
            data: {inviteId},
        });
    },

    // Пригласить пользователя
    async inviteUser(organizationId: string, email: string, role: string): Promise<OrganizationInvite> {
        return await apiClient.post(ENDPOINTS.Commands, {
            command: 'InviteUser',
            data: {organization_id: organizationId, email, role},
        });
    }
}
