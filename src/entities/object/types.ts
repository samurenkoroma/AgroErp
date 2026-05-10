import {MultiPolygon, Point, Polygon} from "geojson";
import {CropPlanListItem} from "@/entities/planning/types.ts";
import {FarmObjectTypes} from "@/entities/object/model.ts";

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
    objects: FarmObjectListItem[];
    cropPlans: CropPlanListItem[]
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

export interface FarmObjectListItem {
    id: string;
    name: string;
    status: string;
    area: number;
}