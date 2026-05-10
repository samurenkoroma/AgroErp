import {useQuery} from '@tanstack/react-query';
import {cropPlanningApi} from '../api/cropPlanningApi';

export const useCultivationAreas = () => {
    return useQuery({
        queryKey: ['cultivation-areas'],
        queryFn: () => cropPlanningApi.getCultivationAreas(),
    });
};

export const useCultivationAreasByObject = (params: { objectId: string }) => {
    return useQuery({
        queryKey: ['cultivation-areas', params.objectId],
        queryFn: () => cropPlanningApi.getCultivationAreas(params),
    });
};

// export const useLocation = (id: string) => {
//     return useQuery({
//         queryKey: ['location' , id],
//         queryFn: () => cropPlanningApi.getLocation(id),
//     });
// };