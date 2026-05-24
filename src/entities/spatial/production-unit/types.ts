import {Geometry, Metadata} from '@/entities/shared/types';

export interface ProductionUnit {
    id: string;
    farmId: string;
    parentId?: string;
    type: string;
    name: string;
    geometry?: Geometry;
    capacity?: number;
    metadata: Metadata;
    createdAt: string;
    updatedAt: string;
}