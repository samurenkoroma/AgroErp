import {useQuery} from '@tanstack/react-query';
import {farmApi} from '../api/farmApi';

export const useFarm = () => useQuery({
    queryKey: ['farm', 'current'],
    queryFn: farmApi.getCurrentFarm,
    staleTime: 10 * 60 * 1000,   // 10 минут
});
