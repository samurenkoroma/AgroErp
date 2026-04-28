import {Crop} from '@/entities';
import {MultiPolygon, Polygon} from "geojson";

export interface Bed {
    id: string;
    number: number;
    crop?: Crop | null;
    status: 'empty' | 'sown' | 'growing' | 'harvested';
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