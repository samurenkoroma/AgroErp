import {useSeasons} from "@/features/season/queries/useSeasons.ts";
import {useCreateSeason} from "@/features/season/mutations/useCreateSeason.ts";
import {useSeasonUIStore} from "@/features/season/store/useSeasonUIStore.ts";


export const useSeasonsPage = () => {
    const { selectedSeasonId, setSelectedSeasonId} = useSeasonUIStore();
    const seasonQuery = useSeasons()
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