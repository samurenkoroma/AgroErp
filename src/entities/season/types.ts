import {PlantingAreaTypes} from "@/entities";

export interface Season {
    id: string;
    name: string;
    year: number;
    startDate: Date;
    endDate: Date;
    status: 'planning' | 'active' | 'completed' | 'archived';
    statistics: {
        totalPlans: number;
        completedPlans: number;
        activePlans: number;
        totalArea: number;
        totalHarvest: number;
        avgYield: number;
        crops: { name: string; area: number; yield: number, icon: string, yieldPerHa: number }[];
    };
    weather?: {
        avgTemp: number;
        totalPrecipitation: number;
        sunnyDays: number;
    };
    notes?: string;
    financial: {
        revenue: number,
        costs: number,
        profit: number,
        profitMargin: number
    },
    plantingArea: PlantingArea[]
}


export interface PlantingArea {

    id: string,
    name: string,
    type: PlantingAreaTypes,
    area: number,
    varietyId: string,
    varietyName: string,
    cropName: string,
    plantedDate: string,
    harvestDate: string,
    actualYield: number,
    expectedYield: number,
    yieldEfficiency: number,
    resources: {
        waterUsed: number,
        fertilizerUsed: { name: string, amount: number, unit: 'кг' }[],
        fuelUsed: number,
        laborHours: number,
        seedsUsed: number
    },
    deviations: { type: string, description: string, impact: string }[]
}