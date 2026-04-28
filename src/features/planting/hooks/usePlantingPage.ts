import {useCropPlans} from '../queries/useCropPlans.ts';

export const usePlantingPage = () => {
    const planQuery = useCropPlans();

    return {
        plan: planQuery.data,
        // assignments: assignmentsQuery.data || [],
        isLoading: planQuery.isLoading ,
        // createAssignment: createMutation.mutate,
        // isCreating: createMutation.isPending,
    };
};