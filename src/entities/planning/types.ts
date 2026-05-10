
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
    cropId: string;
    description?: string;
    steps: CultivationStep[];
}

export interface CropPlan {
    id: string;
    cropId: string;
    varietyId: string;
    cultivationPlanId: string;
    startDate: string;
    locationId?: string;
    status: "draft" | "active" | "completed";
    createdAt: string;
    updatedAt: string;
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
    cropId: string;
    varietyId: string;
    cultivationPlanId: string;
    startDate: string;
    locationId: string; // теперь обязательное поле
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