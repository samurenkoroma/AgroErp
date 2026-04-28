import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useUIStore} from "@/stores/uiStore.ts";
import {seasonApi} from "@/features/season/api/seasonApi.ts";
import {CreateSeasonDTO} from "@/entities/season";

export const useCreateSeason = () => {
    const queryClient = useQueryClient();
    const {addNotification} = useUIStore();

    return useMutation({
        mutationFn: (data: CreateSeasonDTO) => seasonApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['seasons']});

            addNotification({
                type: "success",
                message: `Season created successfully.`,
            })
        },
        onError: (error) => {
            addNotification({
                type: "error",
                message: error.message,
            })
        }
    })
}