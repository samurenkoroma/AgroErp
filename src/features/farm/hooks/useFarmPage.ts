import {useFarmUIStore} from '../store/useFarmUIStore';
import {FarmObject} from "@/entities";


import {useFarm} from '../queries/useFarm';
import {useFarmObjects} from '../queries/useFarmObjects';
import {useCropPlans} from "@/features/planting/queries/useCropPlans.ts";

export const useFarmPage = () => {
    const {setSelectedObjectId} = useFarmUIStore();

    const farmQuery = useFarm();
    const objectsQuery = useFarmObjects(farmQuery.data?.id);
    const cropPlansQuery = useCropPlans();
    return {
        farm: farmQuery.data,
        objects: objectsQuery.data as FarmObject[],
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
