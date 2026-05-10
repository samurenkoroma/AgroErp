import {MultiPolygon, Point, Polygon} from "geojson";
import {Crop} from "@/entities/crop";

export type FarmObject = Greenhouse | Plot | Field;
export type FarmObjectTypes = 'greenhouse' | 'plot' | 'field';

export interface Bed {
    id: string;
    number: number;
    crop?: Crop | null;
    status: 'empty' | 'sown' | 'growing' | 'harvested';
}

export interface Greenhouse {
    id: string;
    name: string;
    area: number;
    beds: Bed[];
    geometry: Point;   // для Mapbox Source
    svgScheme?: string;
    temperatureControlled: boolean;
    currentTemperature?: number;
    attributes: Record<string, any>;
    status: 'active' | 'inactive';
    type: 'greenhouse';
}

export interface Field {
    id: string;
    name: string;
    area: number;
    geometry: Polygon | MultiPolygon;   // для Mapbox Source
    center?: [number, number];                          // lng, lat
    bounds?: [[number, number], [number, number]];      // для fitBounds
    soilType?: 'chernozem' | 'loam' | 'sand' | 'clay' | 'other';
    currentCrop?: Crop | null;
    plannedCrop?: Crop | null;
    sowingDate?: string;        // ISO date
    expectedHarvestDate?: string;
    lastSownYear?: number;
    status: 'free' | 'sown' | 'growing' | 'harvested' | 'fallow';
    notes?: string;
    type: 'field';
    attributes: Record<string, any>;
}

export interface Plot {
    id: string;
    name: string;
    area: number;
    geometry: Polygon | MultiPolygon;   // для Mapbox Source
    type: 'plot';
    beds: Bed[];
    svgScheme?: string;           // путь к SVG или base64
    center?: [number, number];
    status: 'active' | 'maintenance';
    attributes: Record<string, any>;
}