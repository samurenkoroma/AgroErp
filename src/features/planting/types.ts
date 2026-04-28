export interface CropPlanListItem {
    id: string,
    bedId: string,
    name: string,
    varietyName: string,
    cropName: string,
    status: string,
    statusText: string,
    progress: number,
}

export interface CropPlanStage {
    startDate: Date;
    endDate: Date;
    id: string,
    name: string,
    type: string,
    description: string,
    status: string,
    statusText: string,
    order: number,
    bbchStart: number,
    bbchEnd: number,
    isApplicable: boolean
}

export interface CropPlan {
    id: string,
    bedId: string,
    name: string,
    varietyId: string,
    varietyName: string,
    cropName: string,
    status: string,
    statusText: string,
    seasonStart: Date,
    seasonEnd: Date,
    plantingDate: Date,
    seedsPlanted: number,
    expectedYield: number,
    harvestKg: number,
    stages: CropPlanStage[]
    currentStage: CropPlanStage,
    progress: number,
    assignedTo: string,
    assignedName: string,
    createdAt: string
}

export interface PlanStatistics {
    plan_id: string;
    plan_name: string;
    variety_name: string;
    status: string;
    progress: number;
    completed_stages: number;
    total_stages: number;
    pending_stages: number;
    in_progress_stages: number;
    skipped_stages: number;
    days_since_planting: number;
    days_remaining: number;
    days_to_harvest: number;
    expected_yield: number;
    actual_yield: number;
    yield_efficiency: number;
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    overdue_tasks: number;
    avg_task_completion_days: number;
    deviation_days: number;
    recommendations: string[];
}