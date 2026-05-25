import {Metadata} from '@/entities/shared/types';

export interface StressIndicator {
    name: string;
    value?: number;
}

export interface Stress {
    id: string;
    name: string;
    category: string;
    indicators: StressIndicator[];
    symptoms: string[];
    description?: string;
    metadata: Metadata;
    createdAt: string;
    updatedAt: string;
    archivedAt?: string;
}