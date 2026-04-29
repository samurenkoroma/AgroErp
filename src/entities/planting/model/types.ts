import {StageDTO} from "@/api";

interface GrowingTask {
    id: string;
    name: string;
    phase: 'preparation' | 'sowing' | 'growing' | 'harvest';
    daysAfterSowing: number;
    durationDays: number;
    description: string;
    isRequired: boolean;
}
// ==================== TYPES ====================

interface Bed {
    id: string;
    number: number;
    area: number;
    name?: string;
    lastCropId?: string;
    lastCropYear?: number;
    status?: 'empty' | 'sown' | 'growing' | 'harvested';
}

interface GrowingObject {
    id: string;
    name: string;
    type: 'field' | 'plot' | 'greenhouse';
    area: number;
    geometry?: any;
    beds?: Bed[];
    lastCrops?: { cropId: string; year: number; yield?: number }[];
    status?: string;
}

interface PlantingPlan {
    id: string;
    objectId: string;
    objectName: string;
    objectType: string;
    bedId?: string;
    bedName?: string;
    cropId: string;
    cropName: string;
    cropCategory: string;
    season: number; // Год сезона (следующий сезон)
    status: 'planned' | 'approved' | 'inProgress' | 'completed';
    seedsAmount: number;
    seedsUnit: string;
    area: number;
    notes?: string;
    createdAt: string;
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


// entities/planting/types.ts - расширенные типы

export interface SeedlingInfo {
    isSeedling: boolean;                    //是否是 рассадный метод
    sowingDate?: string;                    // дата посева семян на рассаду
    expectedPlantingDate?: string;          // ожидаемая дата высадки в грунт
    actualPlantingDate?: string;            // фактическая дата высадки
    seedlingAgeDays?: number;               // возраст рассады при высадке (дней)
    optimalAgeMin?: number;                 // минимальный оптимальный возраст (дней)
    optimalAgeMax?: number;                 // максимальный оптимальный возраст (дней)
    seedlingHeight?: number;                // оптимальная высота рассады (см)
    leafCount?: number;                     // оптимальное количество листьев
    hardeningDays?: number;                 // количество дней закалки
    hardeningStartDate?: string;            // дата начала закалки
    hardeningEndDate?: string;              // дата окончания закалки
    containerType?: string;                 // тип контейнера (кассета, стаканчик, торфотаблетка)
    containerSize?: string;                 // размер контейнера (мл/см)
    notes?: string;                         // заметки по рассаде
    recommendedStages?: {                   // рекомендуемые стадии для высадки
        bbchCode: string;
        name: string;
        description: string;
    }[];
}

export interface CropPlan {
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
    planting_date: string;                  // для прямого посева - дата посева, для рассады - дата высадки
    sowing_date?: string;                   // дата посева семян (только для рассады)
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
    seedlingInfo?: SeedlingInfo;            // новая секция для рассады
}

export interface CropPlanListItem {
    id: string;
    name: string;
}