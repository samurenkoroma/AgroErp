import {Element} from "@/entities/spatial";

export interface CreateProductionUnitRequest {
    name?: string;
    description?: string;
    type: string;
    status: string;
    parentId?: string;
    capabilities?: string[];
    dimensions?: Dimensions
    count?: number;
    createChild: boolean
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
    schema?: any[]
}

export interface ConfigureProductionUnitRequest {
    id: string;
    schema: {
        beds: Element[]
    }
}