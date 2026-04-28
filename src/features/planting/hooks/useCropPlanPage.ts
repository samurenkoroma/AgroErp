import {useCropPlan, usePlanStatistics} from '../queries/useCropPlans.ts';
import {useParams} from "react-router-dom";

export const useCropPlanPage = () => {
    const {planId} = useParams<{ planId: string }>()
    ;
    const cropPlanQuery = useCropPlan(planId!);
    const planStatsQuery = usePlanStatistics(planId!);

    return {
        plan: cropPlanQuery.data,
        stats: planStatsQuery.data,
        // assignments: assignmentsQuery.data || [],
        isLoading: cropPlanQuery.isLoading || planStatsQuery.isLoading,
        error: cropPlanQuery.error || planStatsQuery.error,
        // createAssignment: createMutation.mutate,
        // isCreating: createMutation.isPending,
    };
};