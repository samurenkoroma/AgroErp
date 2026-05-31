export interface CreateProductionUnitRequest {
    code: string;
    name?: string;
    description?: string;
    type: string;
    status: string;
    parentId?: string;
    capabilities?: string[];
    dimensions?: Dimensions
}

// Интерфейс для размеров
export interface Dimensions {
    length?: number;
    width?: number;
    height?: number;
    diameter?: number;
    volume?: number;
    levels?: number;
    slots?: number;
    cellCount?: number;
    capacity?: number;
}


export interface UpdateProductionUnitRequest {
    id: string;
    parentId?: string;
    name?: string;
    geometry?: unknown;
    capacity?: number;
}