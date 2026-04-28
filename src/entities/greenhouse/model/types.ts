import {Bed} from '@/entities';
import {Point} from "geojson";

export interface GreenhouseBed extends Bed {
} // можно расширить позже

export interface Greenhouse {
    id: string;
    name: string;
    area: number;
    beds: GreenhouseBed[];
    geometry: Point;   // для Mapbox Source
    svgScheme?: string;
    temperatureControlled: boolean;
    currentTemperature?: number;
    attributes: Record<string, any>;
    status: 'active' | 'inactive';
    type: 'greenhouse';
}