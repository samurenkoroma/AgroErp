import {useMutation} from '@tanstack/react-query';
import {organizationApi} from '@/features/organization/api';
import {queryClient} from "@/shared/queryClient.ts";
import {useAuthStore} from "@/stores/authStore.ts";

export const useCreateOrganization = () => {
    const setCurrentOrg = useAuthStore(s => s.setCurrentOrganizationId);

    return useMutation({
        mutationFn: organizationApi.createOrganization,

        // 🔥 оптимистическое обновление (опционально)
        onMutate: async (newOrg) => {
            await queryClient.cancelQueries({ queryKey: ['organizations'] });

            const prev = queryClient.getQueryData<any[]>(['organizations']);

            const optimisticOrg = {
                id: 'temp-id',
                name: newOrg.name,
            };

            queryClient.setQueryData(['organizations'], (old: any[] = []) => [
                ...old,
                optimisticOrg,
            ]);

            return { prev };
        },

        // ❌ откат если ошибка
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) {
                queryClient.setQueryData(['organizations'], ctx.prev);
            }
        },

        // ✅ успех
        onSuccess: (createdOrg) => {
            // 1. обновляем кеш (заменяем temp)
            queryClient.setQueryData(['organizations'], (old: any[] = []) =>
                old.map(o => (o.id === 'temp-id' ? createdOrg : o))
            );

            // 2. делаем её текущей (если хочешь)
            setCurrentOrg(createdOrg.id);
        },

        // 🔄 гарантированная синхронизация с сервером
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
    });
};