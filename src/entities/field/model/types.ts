import {Crop} from '@/entities';
import {Polygon, MultiPolygon} from "geojson";

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

export type FieldStatus = Field['status'];