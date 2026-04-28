export interface Crop {
    id: string;
    name: string;
    category: string;
    family: string;
    growingDays: number;
    seedingRate: {
        type: 'seeds' | 'seedlings';
        value: number;
        unit: string;
        note?: string; // Примечание о расчете
    };
    cropRotation: {
        goodPredecessors: string[];
        badPredecessors: string[];
        minBreakYears: number;
    };
    temperature: {
        min: number;
        max: number;
        optimal: number;
    };
    tasks: GrowingTask[];
    icon?: string;
    color?: string;

    imageUrl?: string;
    isPerennial: boolean;
    description: string;

}

export interface WaterRequirement {
    daily_need_min  : number;
    daily_need_opt  : number;
    critical_phases : string[];
}

// LightRequirement потребность в освещении
export interface LightRequirement {
    ppfd_min: number
    ppfd_opt: number
    day_length_min: number
    day_length_opt: number
    photoperiod_type: string
    critical_phases: string[]
}


export interface Variety {
    id: string,
    name: string,
    speciesKey: string,
    speciesName: string,
    daysToMaturity: 120,
    yieldPotential: 6,
    plantHeight: 0.6,
    recommendedSeasons: string[],
    growingTypes: string[],
    characteristics: {
        fruitColor: string,
        fruitWeight: string
    },
    water_requirement: WaterRequirement;
    // Световые требования
    light_requirement: LightRequirement;
    image: string,
    description: string
}

export interface Species {
    key: string;
    name: string;
    family: string;
    description: string;
    category: string;
    imageUrl: string;

}

export interface CropVariety {
    id: string;
    name: string;
    cropId: string;
    cropName: string;
    seedingRate?: {
        type: 'seeds' | 'seedlings';
        value: number;
        unit: string;
        note?: string;
    };
    growingDays?: number;
    yieldPotential?: { min: number; max: number; unit: string };
    characteristics?: string[];
}