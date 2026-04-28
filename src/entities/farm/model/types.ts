import {FarmObjectTypes, Field, Greenhouse, Plot} from '@/entities';
import {MultiPolygon, Point, Polygon} from "geojson";

// Геометрия для поля (полигон)
export interface PolygonGeometry {
    type: 'Polygon';
    coordinates: number[][][];
}

export interface Farm {
    id: string;
    name: string;
    totalArea: number;
    location: { lat: number; lng: number };
    fields: Field[];
    plots: Plot[];
    greenhouses: Greenhouse[];
    createdAt?: string;
    updatedAt?: string;
}

// Команда обновления объекта
export interface UpdateObjectCommand {
    name?: string;
    description?: string;
    status?: 'free' | 'sown' | 'growing' | 'harvested' | 'fallow';
    geometry?: Polygon | MultiPolygon | Point;
    attributes?: Record<string, any>;
    schema?: any[];
}

export interface CreateFieldCommand {
    name: string;
    geometry: PolygonGeometry;
    type: FarmObjectTypes;
    attributes: {
        width: number,
        length: number,
    }
}