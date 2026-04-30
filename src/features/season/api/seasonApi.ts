import {apiClient} from "@/api";
import {CreateSeasonDTO, Season} from "@/entities/season";


export const seasonApi = {
    list: async () => await apiClient.query<Season[]>('ListSeasons', {}),
    create: async (payload: CreateSeasonDTO) => await apiClient.command('CreateSeason', payload),
}