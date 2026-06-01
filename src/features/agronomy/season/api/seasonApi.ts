import {apiClient} from "@/api";
import {CreateSeasonDTO, Season} from "@/entities/agronomy/season";
import {ResponseId} from "@/entities/shared/dto.ts";

export const seasonApi = {
    list: async () => await apiClient.query<Season[]>('agronomy.list_seasons', {}),
    create: async (payload: CreateSeasonDTO) => await apiClient.command<ResponseId>('agronomy.create_season', payload),
}