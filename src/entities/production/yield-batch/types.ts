import {Metadata, Quantity} from '@/entities/shared/types';

export interface YieldBatch {
    id: string;
    growingCycleId: string;
    plantId: string;
    quantity: Quantity;
    fruitCount?: number;
    grade: string;
    marketable: boolean;
    notes?: string;
    harvestedAt: string;
    metadata: Metadata;
    createdAt: string;
}