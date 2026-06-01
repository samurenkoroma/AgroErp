import {useQuery} from "@tanstack/react-query";
import {seasonApi} from "@/features/agronomy/season/api/seasonApi.ts";
import {getAccessToken} from "@/stores/authStore.ts";
import {Season} from "@/entities/agronomy/season";

export const useSeasons = () => {
    const token = getAccessToken()

    return useQuery({
        queryKey: ["seasons"],
        queryFn: seasonApi.list,
        enabled: !!token, // 🔑 важно
        staleTime: Infinity,
    })
}

export const useGroupedSeason = () =>
    useQuery({
        queryKey: ["seasons"],
        queryFn: seasonApi.list,
        staleTime: Infinity,
        select: (seasons) => {

            const result = {
                all: seasons == undefined ? [] : seasons,
                current: seasons.find(s => s.status === 'current') ?? null,
                planning: [] as Season[],
                completed: [] as Season[]
            }
            for (const item of seasons) {
                console.log("seasons", result)
                switch (item.status) {
                    case "completed":
                        result.completed.push(item)
                        break
                    case "planning":
                        result.planning.push(item)
                        break
                }
            }

            return result
        }
    })