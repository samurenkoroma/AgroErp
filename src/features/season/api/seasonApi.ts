import {apiClient} from "@/api";
import {CreateSeasonDTO, Season} from "@/entities/season";

export const seasonApi = {
    list: async () => await apiClient.query<Season[]>('getSeasons', {}),
    create: async (payload: CreateSeasonDTO) => await apiClient.command('createSeason', payload),
}