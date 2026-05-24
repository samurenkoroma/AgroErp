import { Metadata } from '@/entities/shared/types';

export interface PlantHealth {
    score: number;

    status: string;

    notes?: string;
}

export interface Plant {
    id: string;

    growingCycleId: string;

    cropId: string;

    varietyId?: string;

    productionUnitId: string;

    slotId?: string;

    substrateId?: string;

    status: string;

    health: PlantHealth;

    currentStageId?: string;

    plantedAt: string;

    transplantedAt?: string;

    harvestedAt?: string;

    discardedAt?: string;

    metadata: Metadata;

    createdAt: string;
    updatedAt: string;
}