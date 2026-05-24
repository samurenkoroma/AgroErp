import {Metadata} from '@/entities/shared/types';

export interface VarietyTolerance {
    temperatureMin?: number;
    temperatureMax?: number;

    humidityMin?: number;
    humidityMax?: number;

    phMin?: number;
    phMax?: number;

    ecMin?: number;
    ecMax?: number;
}

export interface Variety {
    id: string;

    cropId: string;

    name: string;

    description?: string;

    tolerance: VarietyTolerance;

    metadata: Metadata;

    createdAt: string;
    updatedAt: string;

    archivedAt?: string;
}