export interface CreateVarietyRequest {
    cropId: string;
    name: string;
    description?: string;
    daysToMaturity: number;
}

export interface UpdateVarietyRequest {
    id: string;

    name?: string;

    description?: string;

    tolerance?: Record<string, unknown>;
}