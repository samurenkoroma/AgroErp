import {useListSpecies} from "@/features/crops/queries/useListSpecies";

export const useCropTypesPage = () => {

    const speciesQuery = useListSpecies()
    return {
        crops: speciesQuery.data,
        isLoading: speciesQuery.isLoading,
        error: speciesQuery.error,
        refetch: () => {
            speciesQuery.refetch()
        },
    }
};
