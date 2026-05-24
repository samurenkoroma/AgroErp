import {Metadata} from '@/entities/shared/types';

export interface GrowingCycle {
    id: string;

    farmId: string;

    cropId: string;

    productionUnitId: string;

    method: string;

    status: string;

    metadata: Metadata;

    createdAt: string;
    updatedAt: string;
}