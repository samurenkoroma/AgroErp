import {apiClient, ENDPOINTS} from "@/api";
import {CreateSeasonDTO, Season} from "@/entities/season";

export const seasonApi = {
    async create(payload: CreateSeasonDTO): Promise<void> {
        const {data} = await apiClient.post(ENDPOINTS.Commands, {
            command: 'CreateSeason',
            data: payload,
        });
        return data;
    },

    async list(): Promise<Season[]> {
        const {data} = await apiClient.post(ENDPOINTS.Queries, {
            query: 'ListSeasons',
            data: {},
        });
        return data;
    },

}