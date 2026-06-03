export interface Variety {
    id: string;
    name: string;
    cropId: string;
    cropName: string;
    baseTemperature: number;
    maxTemperature: number;
    daysToMaturity: number;
    phenophaseGDD: Phenophase[];
    waterRequirement: WaterRequirement;
    lightRequirement: LightRequirement;
    seedingRates: Record<string, SeedingRate>;
    yieldPotential: number;
    plantHeight: number;
    recommendedSeasons: string[];
    growingTypes: string[];
    description: string;
    image?: string;
}

export interface Phenophase {
    code: string;
    name: string;
    gddRequired: number;
    description?: string;
    isCritical: boolean;
}

export interface WaterRequirement {
    dailyNeedMin: number;
    dailyNeedOpt: number;
    criticalPhases: string[];
}

export interface LightRequirement {
    ppfdMin: number;
    ppfdOpt: number;
    dayLengthMin: number;
    dayLengthOpt: number;
    photoperiodType: "short_day" | "long_day" | "day_neutral";
    criticalPhases: string[];
}

export interface SeedingRate {
    growingType: string;
    rowSpacing: number;
    plantSpacing: number;
    sowingDepth: number;
    germinationRate: number;
    safetyFactor: number;
}