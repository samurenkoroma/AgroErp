import {apiClient} from '@/api';
import {Specie, Variety} from "@/entities";

export const cropApi = {

    getListSpecies: async () => await apiClient.query<Specie[]>('ListSpecies', {}),
    getSpecie: async (key: string) => await apiClient.query<Specie>('GetSpecie', {key}),
    listVarieties: async (params?: {
        speciesKey: string
    }) => await apiClient.query<Variety[]>('ListVarieties', params || {}),
    getVarietyById: async (key: string, id: string) => await apiClient.query<Variety>('GetVariety', {key, id}),

}


