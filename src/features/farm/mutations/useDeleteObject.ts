import {useMutation, useQueryClient} from '@tanstack/react-query';
import {objectApi} from '@/features/farm/api';
import {useUIStore} from "@/stores/uiStore.ts";

export const useDeleteObject = () => {
    const queryClient = useQueryClient();
    const {addNotification} = useUIStore();

    return useMutation({
        mutationFn: ({id}: { id: string }) =>
            objectApi.deleteObject(id),

        onSuccess: (_, variables) => {
            // Инвалидация связанных запросов
            queryClient.invalidateQueries({queryKey: ['farmObjects']});
            queryClient.invalidateQueries({queryKey: ['farmObject', variables.id]});
            queryClient.invalidateQueries({queryKey: ['farmStatistics']});

            addNotification({
                type: "success",
                message: "Объект успешно удалён",
            })
        },

        onError: (err) => {
            addNotification({
                type: "success",
                message: `Ошибка удаления объекта: ${err.message}`,
            })
        },
    });
};