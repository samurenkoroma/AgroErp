
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
