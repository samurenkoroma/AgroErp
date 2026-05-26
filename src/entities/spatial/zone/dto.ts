export interface CreateZoneRequest {
    productionUnitId: string;
    name: string;
    geometry?: {
        type: string;
        coordinates: unknown;
    };
}

export interface UpdateZoneRequest {
    id: string;
    name?: string;
    geometry?: unknown;
}