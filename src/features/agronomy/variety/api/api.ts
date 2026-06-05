import {apiClient} from "@/api";
import {CreateVarietyRequest} from "@/entities/agronomy/variety/dto.ts";
import {ResponseId} from "@/entities/shared/dto.ts";
import {Variety} from "@/entities/agronomy/variety/model.ts";


export const varietyApi = {
    createVariety: (data: CreateVarietyRequest) => apiClient.command<ResponseId>('agronomy.create_variety', data),
    getVariety: (id: string) => apiClient.query<Variety>('agronomy.get_variety', {id}),
    listVarieties: (cropId: string) => apiClient.query<Variety[]>('agronomy.list_varieties', {cropId})
}