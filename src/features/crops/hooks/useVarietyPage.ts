import {useParams} from "react-router-dom";
import {useVariety} from "@/features/crops/queries/useVariety.ts";

export const useVarietyPage = () => {
    const {id, varId} = useParams<{ id: string; varId: string }>();
    const varietyQuery = useVariety(id!, varId!)

    return {
        cropId: id,
        variety: varietyQuery.data,
        isLoading: varietyQuery.isLoading,
        error: varietyQuery.error,
        refetch: varietyQuery.refetch,
    }
};


