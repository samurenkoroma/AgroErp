import {useCropType} from "@/features/crops/queries/useCropType.ts";
import {useParams} from "react-router-dom";
import {useVarieties} from "@/features/crops/queries/useVarieties.ts";
import {useCropUIStore} from "@/features/crops/store/useCropUIStore.ts";
import {useEffect} from "react";

export const useCropTypePage = () => {
    const {id} = useParams<{ id: string }>();
    const {selectedCropTypeId, setSelectedCropTypeId} = useCropUIStore()

    const cropQuery = useCropType(id || selectedCropTypeId || undefined)
    const varietiesQuery = useVarieties(id!)

    useEffect(() => {
        if (id && id !== selectedCropTypeId) {
            setSelectedCropTypeId(id)
        }
    }, [id, selectedCropTypeId, setSelectedCropTypeId])

    return {
        crop: cropQuery.data,
        varieties: varietiesQuery.data,
        isLoading: cropQuery.isLoading && varietiesQuery.isLoading,
        error: cropQuery.error && varietiesQuery.error,
        refetch: () => {
            cropQuery.refetch()
            varietiesQuery.refetch()
        },
        setSelectedCropTypeId,
        selectedCropTypeId
    }
};

