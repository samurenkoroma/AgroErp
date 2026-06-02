// src/features/growing-cycle/types.ts
export type CycleStatus = 'planned' | 'active' | 'paused' | 'harvesting' | 'completed' | 'failed' | 'archived';
export type CycleMethod = 'seedling' | 'direct' | 'hydroponic';

export interface GrowingCycle {
    id: string;
    name: string;
    code: string;
    cropId: string;
    cropName: string;
    varietyId?: string;
    varietyName?: string;
    protocolId?: string;
    protocolName?: string;
    method: CycleMethod;
    status: CycleStatus;
    expectedHarvestAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Allocation {
    id: string;
    cycleId: string;
    productionUnitId: string;
    productionUnitName: string;
    productionUnitType: string;
    area: number;
    startedAt: string;
    endedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Planting {
    id: string;
    cycleId: string;
    plantedAt: string;
    quantity: number;
    createdAt: string;
    updatedAt: string;
}

export interface HarvestBatch {
    id: string;
    cycleId: string;
    harvestedAt: string;
    quantity: number;
    createdAt: string;
    updatedAt: string;
}
