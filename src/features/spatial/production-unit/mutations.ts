import {useMutation} from "@tanstack/react-query";
import {productionUnitApi} from "@/features/spatial/production-unit/api/api.ts";
import {queryClient} from "@/shared/queryClient.ts";
import {ResponseId} from "@/entities/shared/dto.ts";
import {CreateProductionUnitRequest} from "@/entities/spatial/production-unit/dto.ts";


export const useCreateProductionUnit = () => {

    return useMutation({
        mutationFn: (data: CreateProductionUnitRequest): Promise<ResponseId> => productionUnitApi.createProductionUnit(data),

        onSuccess: (_, variables) => {
            // Инвалидируем все связанные запросы
            queryClient.invalidateQueries({queryKey: ['production-units']});

            // Если есть родитель, инвалидируем его данные
            if (variables.parentId) {
                queryClient.invalidateQueries({queryKey: ['production-unit', variables.parentId]});
                // queryClient.invalidateQueries({queryKey: ['production-unit-children', variables.parentId]});
            }
        },

        onError: (error) => {
            console.error('Failed to create production unit:', error);
        }
    });
};
export const useUpdateProductionUnit = (data: {}) => useMutation({
    mutationFn: () => productionUnitApi.updateProductionUnit(data)
})
export const useArchiveProductionUnit = (data: {}) => useMutation({
    mutationFn: () => productionUnitApi.archiveProductionUnit(data)
})

