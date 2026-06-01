export interface Season {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: 'planning' | 'current' | 'completed';
    statistics: Statistics,
    plantingArea: SeasonUnits[],
    weather: {
        avgTemp: number,
        totalPrecipitation: number,
        sunnyDays: number
    },
}


export interface StatItem {
    name: string,
    icon: string,
    area: number,
    yield: number,
    yieldPerHa: number
}

export interface Statistics {
    totalPlans: number,
    activePlans: number,
    totalArea: number,
    completedPlans: number,
    totalHarvest: number, // кг
    crops: StatItem[]
}

export interface SeasonUnits {
    id: string,
    name: string,
    type: string,
    cropName: string,
    varietyName: string,
    area: number,
    plantedDate: Date,
    harvestDate: Date | null,
    yieldEfficiency: number,
    resources: {
        waterUsed: number, // литры
        fertilizerUsed: { name: string, amount: number }[],
        fuelUsed: number,
        laborHours: number
    }
}