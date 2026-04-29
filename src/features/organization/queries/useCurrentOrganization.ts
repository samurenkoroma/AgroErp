import {useOrganizations} from "@/features/organization/queries/useOrganizations.ts";
import {useAuthStore} from "@/stores/authStore.ts";

export const useCurrentOrganization = () => {
    const {data: orgs, isLoading} = useOrganizations();
    const currentId = useAuthStore(s => s.currentOrganizationId);

    return {
        organization: orgs?.find(o => o.id === currentId) || null,
        isLoading: isLoading
    }
};