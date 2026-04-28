import {useFarmObject} from '../queries/useFarmObject';
import {useFarmUIStore} from '../store/useFarmUIStore';
import {useParams} from 'react-router-dom';
import {useEffect} from 'react';
import {FarmObject} from "@/entities";


export const useObjectPage = <T extends FarmObject>() => {
    const {id} = useParams<{ id: string }>();
    const {selectedObjectId, setSelectedObjectId} = useFarmUIStore();

    const query = useFarmObject(id || selectedObjectId || undefined);
    // Синхронизация URL и store
    useEffect(() => {
        if (id && id !== selectedObjectId) {
            setSelectedObjectId(id);
        }
    }, [id, selectedObjectId, setSelectedObjectId]);

    return {
        object: query.data as T,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        selectedObjectId,
        setSelectedObjectId,
    };
};