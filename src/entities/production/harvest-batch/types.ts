import {Area, Metadata, Quantity} from '@/entities/shared/types';

export interface HarvestBatch {
    id: string;

    growingCycleId: string;

    productionUnitId: string;

    quantity: Quantity;

    harvestedArea?: Area;

    grade: string;

    marketable: boolean;

    notes?: string;

    harvestedAt: string;

    metadata: Metadata;

    createdAt: string;
}