import {useQuery} from '@tanstack/react-query';
import {getAccessToken} from "@/stores/authStore.ts";
import {cycleApi} from "@/features/production/growing_cycle/api/api.ts";


export const useCycles = () => {
    const token = getAccessToken()

    return useQuery({
        queryKey: ['growing-cycles'],
        enabled: !!token, // 🔑 важно
        queryFn: cycleApi.list,
        staleTime: 1000 * 60 * 5, // 5 минут кеш
    })
}

export const useOptionHelpers = () => {
    const token = getAccessToken()

    return useQuery({
        queryKey: ['production.helpers'],
        enabled: !!token, // 🔑 важно
        queryFn: cycleApi.helpers,
        staleTime: 1000 * 60 * 5, // 5 минут кеш
        select: (values) => {
            return {
                statuses: values.statuses,
                stages:values.stages,
                methods: values.methods,
                statusesOpt: Object.entries(values.statuses).map(([value, label]) => ({
                    value,
                    label
                })),
                stagesOpt: Object.entries(values.stages).map(([value, label]) => ({
                    value,
                    label
                })),
                methodsOpt: Object.entries(values.methods).map(([value, label]) => ({
                    value,
                    label
                })),
            }
        }

    })
}