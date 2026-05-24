
export interface CultivationStep {
    id: string;
    type: "watering" | "fertilizing" | "spraying" | "harvesting";
    trigger: {
        type: "day_offset" | "date" | "bbch";
        dayOffset?: number;
        date?: string;
        stage?: string;
    };
    params?: Record<string, any>;
}

export interface CultivationPlan {
    id: string;
    name: string;
    cropKey: string;
    version: number;
    description?: string;
    steps: CultivationStep[];
}

interface CropPlanFormData {
    name: string;
    crop_name: string;
    variety_name: string;
    bed_id: string;
    bed_name: string;
    planting_date: string;
    expected_harvest_date: string;
    expected_yield: number;
    area: number;
    is_seedling: boolean;
    assigned_to: string;
    assigned_name: string;
    notes?: string;
}
//
// interface CropPlan {
//     status: 'draft' | 'active' | 'completed' | 'cancelled';
//     status_text: string;
//     planting_date: string;
//     expected_harvest_date: string;
//     actual_harvest_date?: string;
//     expected_yield: number;
//     actual_yield: number;
//     progress: number;
//     area: number;
//     area_unit: 'ha' | 'm2';
//     is_seedling: boolean;
//     seedling_status?: 'sowing' | 'growing' | 'ready' | 'planted' | 'overdue';
//     created_at: string;
//     updated_at: string;
//     assigned_to: string;
//     assigned_name: string;
//     notes?: string;
//     tasks_completed: number;
//     tasks_total: number;
// }

export interface CropPlan {
    id: string;
    crop: {
        key: string;
        name: string;
    };
    variety: {
        name: string;
        id: string;
        daysToMaturity: number;
    };
    productionUnit: {
        id: string
        area: number;
        name: string;
    };
    cultivationPlan: {
        id: string
        name: string
    };
    status: 'active' | 'completed' | 'planned' | 'draft';
    plantingDate: string;
    expectedHarvestDate: string;
}

export interface CurrentPhenology {
    planId: string;
    varietyId: string;
    varietyName: string;
    accumulatedGDD: number;
    requiredGDDForNext: number;
    currentPhaseCode: string;
    currentPhaseName: string;
    progressPercent: number;
    estimatedDaysToNextPhase: number;
    estimatedHarvestDate?: string;
    deviationDays: number;
    deviationReason?: string;
    isCritical: boolean;
    recommendedActions: RecommendedAction[];
}

export interface RecommendedAction {
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
    dueDays: number;
}

export interface CreateCropPlanRequest {
    varietyId?: string;
    cultivationPlanId: string;
    seasonId: string;
    areaId: string;
}

export interface PlantingRecord {
    id?: string;
    objectId: string;
    objectName: string;
    objectType: 'field' | 'bed';
    season: number;
    cropId: string;
    cropName: string;
    varietyId?: string;
    varietyName?: string;
    plantingDate: string;
    harvestDate?: string;
    status: 'planned' | 'sown' | 'growing' | 'harvested' | 'failed';
    area: number;
    seedsAmount: number;
    seedsUnit: string;
    actualYield?: number;
    yieldUnit?: string;
    notes?: string;
    weather?: {
        tempMin: number;
        tempMax: number;
        precipitation: number;
    };
}


export interface CultivationArea {
    id: string;
    objectId: string;
    type: string,
    name: string,
    area: number
}


export interface CropPlanListItem {
    id: string;
    name: string;
}




// ==================== TYPES ====================

export interface StageDTO {
    id: string;
    name: string;
    type: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    status_text: string;
    order: number;
    bbch_start: number;
    bbch_end: number;
    is_applicable: boolean;
    start_date: string | null;
    end_date: string | null;
}

export interface TaskDTO {
    id: string;
    plan_id: string;
    bed_id: string;
    type: string;
    type_text: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    status_text: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    priority_text: string;
    priority_color: string;
    title: string;
    description: string;
    instructions: string;
    scheduled_date: string;
    due_date: string;
    is_overdue: boolean;
    estimated_duration: number;
    actual_duration: number;
    latitude: number;
    longitude: number;
    photos: PhotoDTO[];
    comments: CommentDTO[];
    completed_at: string | null;
    completed_by: string | null;
}

export interface PhotoDTO {
    id: string;
    url: string;
    thumbnail: string;
    taken_at: string;
    notes: string;
}

export interface CommentDTO {
    id: string;
    user_id: string;
    user_name: string;
    text: string;
    created_at: string;
}

export interface CurrentPhenologyResponse {
    plan_id: string;
    plan_name: string;
    variety_id: string;
    variety_name: string;
    accumulated_gdd: number;
    required_gdd_for_next: number;
    current_phase_code: string;
    current_phase_name: string;
    progress_percent: number;
    estimated_days_to_next_phase: number;
    estimated_harvest_date: string;
    deviation_days: number;
    deviation_reason: string;
    is_critical: boolean;
    recommended_actions: RecommendedAction[];
    available_stages: StageDTO[];
}

export interface PlanStatisticsResponse {
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

export interface SeedlingInfo {
    isSeedling: boolean;
    sowingDate?: string;
    expectedPlantingDate?: string;
    actualPlantingDate?: string;
    seedlingAgeDays?: number;
    optimalAgeMin?: number;
    optimalAgeMax?: number;
    seedlingHeight?: number;
    leafCount?: number;
    hardeningDays?: number;
    hardeningStartDate?: string;
    hardeningEndDate?: string;
    containerType?: string;
    containerSize?: string;
    notes?: string;
    recommendedStages?: {
        bbchCode: string;
        name: string;
        description: string;
    }[];
}

export interface CropPlanDTO {
    id: string;
    bed_id: string;
    name: string;
    variety_id: string;
    variety_name: string;
    crop_name: string;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    status_text: string;
    season_start: string;
    season_end: string;
    planting_date: string;
    sowing_date?: string;
    seeds_planted: number;
    expected_yield: number;
    harvest_kg: number;
    progress: number;
    stages: StageDTO[];
    current_stage: StageDTO | null;
    assigned_to: string;
    assigned_name: string;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
    seedlingInfo?: SeedlingInfo;
}




// ============ DTO ============
export interface CropPlanDTO {
    id: string;
    bed_id: string;
    name: string;
    variety_id: string;
    variety_name: string;
    crop_name: string;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    status_text: string;
    season_start: string;
    season_end: string;
    planting_date: string;
    seeds_planted: number;
    expected_yield: number;
    harvest_kg: number;
    progress: number;
    stages: StageDTO[];
    current_stage: StageDTO | null;
    assigned_to: string;
    assigned_name: string;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
}

export interface StageDTO {
    id: string;
    name: string;
    type: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    status_text: string;
    order: number;
    bbch_start: number;
    bbch_end: number;
    is_applicable: boolean;
    start_date: string | null;
    end_date: string | null;
}

export interface TaskDTO {
    id: string;
    plan_id: string;
    bed_id: string;
    type: string;
    type_text: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    status_text: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    priority_text: string;
    priority_color: string;
    title: string;
    description: string;
    instructions: string;
    scheduled_date: string;
    due_date: string;
    is_overdue: boolean;
    estimated_duration: number;
    actual_duration: number;
    latitude: number;
    longitude: number;
    photos: PhotoDTO[];
    comments: CommentDTO[];
    completed_at: string | null;
    completed_by: string | null;
}

export interface VarietyDTO {
    id: string;
    name: string;
    species_key: string;
    species_name: string;
    days_to_maturity: number;
    yield_potential: number;
    plant_height: number;
    recommended_seasons: string[];
    growing_types: string[];
    characteristics: Record<string, string>;
    description: string;
}



// ============ Ответы ============
export interface CurrentPhenologyResponse {
    plan_id: string;
    plan_name: string;
    variety_id: string;
    variety_name: string;
    accumulated_gdd: number;
    required_gdd_for_next: number;
    current_phase_code: string;
    current_phase_name: string;
    progress_percent: number;
    estimated_days_to_next_phase: number;
    estimated_harvest_date: string;
    deviation_days: number;
    deviation_reason: string;
    is_critical: boolean;
    recommended_actions: RecommendedAction[];
    available_stages: StageDTO[];
}

export interface DailyTasksResponse {
    date: string;
    tasks: TaskDTO[];
}

export interface PlanStatisticsResponse {
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

// export interface RotationRecommendationsResponse {
//     bed_id: string;
//     last_crop: CropHistoryDTO | null;
//     recommended_crops: CropFamilyDTO[];
//     not_recommended_crops: CropFamilyDTO[];
//     recent_history: CropHistoryDTO[];
//     advice: string;
// }