import {Greenhouse} from "@/entities/greenhouse";
import {Plot} from "@/entities/plot";
import {Field} from "@/entities/field";

export * from './crop';
export * from './field';
export * from './plot';
export * from './greenhouse';
export * from './farm';
export type FarmObject = Greenhouse | Plot | Field;
export type FarmObjectTypes = 'greenhouse' | 'plot' | 'field';
export type PlantingAreaTypes = FarmObjectTypes | 'bed';


export interface FarmObjectListItem {
    id: string;
    name: string;
    status: string;
    area: number;
}