import {useMutation, useQueryClient} from '@tanstack/react-query';
import {objectApi} from '@/features/farm/api';
import {UpdateObjectCommand} from '@/entities';
import {useUIStore} from "@/stores/uiStore.ts";

export const useUpdateObject = () => {
    const queryClient = useQueryClient();
    const {addNotification} = useUIStore();

    return useMutation({
        mutationFn: ({id, data}: { id: string; data: UpdateObjectCommand }) => {
            data.schema = data.schema?.map((e) => {
                return {
                    ...e,
                    width: Number(e.width.toFixed(1)),
                    height: Number(e.height.toFixed(1))
                }
            });
            return objectApi.updateObject(id, data)
        },

        onSuccess: (_, variables) => {
            // Инвалидация связанных запросов
            queryClient.invalidateQueries({queryKey: ['farmObjects']});
            queryClient.invalidateQueries({queryKey: ['farmObject', variables.id]});
            queryClient.invalidateQueries({queryKey: ['farmStatistics']});

            addNotification({
                type: "success",
                message: "Объект успешно обновлён",
            })
        },

        onError: (err) => {
            addNotification({
                type: "success",
                message: `Ошибка обновления объекта: ${err.message}`,
            })
        },
    });
};