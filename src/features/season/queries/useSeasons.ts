import {useQuery} from "@tanstack/react-query";
import {seasonApi} from "@/features/season/api/seasonApi.ts";
import {getAccessToken} from "@/stores/authStore.ts";

export const useSeasons = () => {
    const token = getAccessToken()

    return useQuery({
        queryKey: ["seasons"],
        queryFn: seasonApi.list,
        enabled: !!token, // 🔑 важно
    })
}