import {useListSeasons} from "@/features/season/queries/useListSeasons.ts";
import {useCreateSeason} from "@/features/season/mutations/useCreateSeason.ts";
import {useSeasonUIStore} from "@/features/season/store/useSeasonUIStore.ts";


export const useSeasonsPage = () => {
    const { selectedSeasonId, setSelectedSeasonId} = useSeasonUIStore();
    const seasonQuery = useListSeasons()
    const seasonCreate = useCreateSeason()

    return {
        createSeason: seasonCreate.mutate,
        seasons: seasonQuery.data,
        refetch: () => seasonQuery.refetch(),
        error: seasonQuery.error,
        isLoading: seasonQuery.isLoading,
        setSelectedSeasonId: setSelectedSeasonId,
        selectedSeasonId
    }
}