import {Metadata} from '@/entities/shared/types';

export interface StageIndicator {
    name: string;
    value?: number;
    unit?: string;
}

export interface CropStage {
    id: string;

    cropId: string;

    name: string;

    order: number;

    duration?: number;

    indicators: StageIndicator[];

    metadata: Metadata;

    createdAt: string;
    updatedAt: string;
}