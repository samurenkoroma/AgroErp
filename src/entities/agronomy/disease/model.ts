import {Metadata} from '@/entities/shared/types';

export interface Host {
    cropId?: string;
    name: string;
}

export interface Symptom {
    name: string;
    description?: string;
}

export interface Disease {
    id: string;
    name: string;
    scientificName?: string;
    pathogenType: string;
    hosts: Host[];
    symptoms: Symptom[];
    description?: string;
    metadata: Metadata;
    createdAt: string;
    updatedAt: string;
    archivedAt?: string;
}