export interface Metadata {
    tags?: string[];
    notes?: string;
    extra?: Record<string, unknown>;
}

export interface Quantity {
    value: number;
    unit: string;
}

export interface Area {
    value: number;
    unit: string;
}

export interface Ratio {
    value: number;
}

export interface Coordinates {
    lat: number;
    lon: number;
}

export interface Geometry {
    type: string;
    coordinates: unknown;
}

export interface Location {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: Coordinates;
}