export interface CreateProductionUnitRequest {
    farmId: string;
    parentId?: string;
    type: string;
    name: string;
    geometry?: {
        type: string;
        coordinates: unknown;
    };
    capacity?: number;
}

export interface UpdateProductionUnitRequest {
    id: string;
    parentId?: string;
    name?: string;
    geometry?: unknown;
    capacity?: number;
}