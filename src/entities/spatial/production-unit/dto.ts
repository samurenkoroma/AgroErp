export interface CreateProductionUnitRequest {
    code: string;
    name?: string;
    description?: string;
    type: string;
    status: string;
    parentId?: string;
    capabilities?: string[];
    dimensions?: Dimensions
    count?: number;
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
    cellVolume?: number;
    capacity?: number;
}


export interface UpdateProductionUnitRequest {
    id: string;
    parentId?: string;
    name?: string;
    geometry?: unknown;
    capacity?: number;
}