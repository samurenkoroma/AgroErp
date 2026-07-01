export interface Metadata {
    tags?: string[];
    notes?: string;
    name?: string;
    color?: string;
    icon?: string;
    soilType?: string;
    temperatureControlled?: boolean;
    levels?: number;
    level?: number;
    description?: string;
    extra?: Record<string, unknown>;
}

export interface Position {
    x: number;
    y: number;
    z?: number;
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
    type: 'Point' | 'Polygon' | 'MultiPolygon';
    coordinates: number[] | number[][][];
    area?: number;
    areaUnit?: 'ha' | 'm2';
}

export interface Location {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: Coordinates;
}