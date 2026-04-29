import {useMutation, useQueryClient} from '@tanstack/react-query';
import {objectApi} from '@/features/farm/api';
import {useUIStore} from "@/stores/uiStore.ts";

export const useCreateObject = () => {
    const queryClient = useQueryClient();
    const {addNotification} = useUIStore();

    return useMutation({
        mutationFn: objectApi.createField,

        onSuccess: () => {
            // Инвалидация связанных запросов
            queryClient.invalidateQueries({queryKey: ['farmObjects']});

            addNotification({
                type: "success",
                message: "Объект успешно создан",
            })
        },

        onError: (err) => {
            addNotification({
                type: "success",
                message: `Ошибка создания объекта: ${err.message}`,
            })
        },
    });
};