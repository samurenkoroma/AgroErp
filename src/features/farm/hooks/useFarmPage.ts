import {useFarmUIStore} from '../store/useFarmUIStore';


import {useFarm} from '../queries/useFarm';
import {useFarmObjects} from '../queries/useFarmObjects';
import {useCropPlans} from "@/features/planting/queries/useCropPlans.ts";

export const useFarmPage = () => {
    const {setSelectedObjectId} = useFarmUIStore();

    const farmQuery = useFarm();
    const objectsQuery = useFarmObjects();
    const cropPlansQuery = useCropPlans();
    return {
        farm: farmQuery.data,
        objects: objectsQuery.data,
        cropPlans: cropPlansQuery.data,
        isLoading: farmQuery.isLoading || objectsQuery.isLoading || cropPlansQuery.isLoading,
        error: farmQuery.error || objectsQuery.error,
        refetch: () => {
            farmQuery.refetch();
            objectsQuery.refetch();
            cropPlansQuery.refetch();
        },
        setSelectedObjectId
    };
};
