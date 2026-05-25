export interface CreateVarietyRequest {
    cropId: string;

    name: string;

    description?: string;

    tolerance: {
        temperatureMin?: number;
        temperatureMax?: number;

        humidityMin?: number;
        humidityMax?: number;

        phMin?: number;
        phMax?: number;

        ecMin?: number;
        ecMax?: number;
    };
}

export interface UpdateVarietyRequest {
    id: string;

    name?: string;

    description?: string;

    tolerance?: Record<string, unknown>;
}