import {useMutation} from "@tanstack/react-query";
import {farmApi} from "@/features/spatial/farm/api/api.ts";
import {CreateFarmRequest} from "@/entities/spatial/farm/dto.ts";

export const useCreateFarm = (data: CreateFarmRequest) => useMutation({
    mutationFn: () => farmApi.createFarm(data)
})

