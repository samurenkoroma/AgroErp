// types/api.ts - обновленные типы

// ============ Базовые типы ============
export interface CommandRequest<T = any> {
    command: CommandType;
    data: T;
}

export interface QueryRequest<T = any> {
    query: QueryType;
    data: T;
}

export interface CommandResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ErrorInfo;
}

export interface ErrorInfo {
    code: string;
    message: string;
    details: string;
}

export interface ErrorResponse {
    error: string;
    code: number;
}

// ============ Типы команд ============
export type CommandType =
    | 'CreateCropPlan'
    | 'ActivateCropPlan'
    | 'CompleteCropPlan'
    | 'CancelCropPlan'
    | 'AddStage'
    | 'StartStage'
    | 'CompleteStage'
    | 'SkipStage';

// ============ Типы запросов ============
export type QueryType =
    | 'GetCropPlan'
    | 'ListCropPlans'
    | 'GetCurrentPhenology'
    | 'GetDailyTasks'
    | 'GetPlanStatistics'
    | 'SearchVarieties'
    | 'GetRotationRecommendations';

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

// ============ Команды ============
export interface CreateCropPlanCommand {
    bed_id: string;
    name: string;
    variety_id: string;
    season_start: string;
    season_end: string;
    planting_date: string;
    latitude: number;
    longitude: number;
    assigned_to: string;
    assigned_name: string;
}

export interface AddStageCommand {
    plan_id: string;
    name: string;
    type: string;
    description: string;
    bbch_start: number;
    bbch_end: number;
    order: number;
}

// ============ Запросы ============
export interface GetCropPlanQuery {
    plan_id: string;
}

export interface ListCropPlansQuery {
    bed_id?: string;
    status?: string;
    assigned_to?: string;
    limit?: number;
    offset?: number;
}

export interface SearchVarietiesQuery {
    q: string;
    species_key?: string;
    limit?: number;
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
    summary: TaskSummary;
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