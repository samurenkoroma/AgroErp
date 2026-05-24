import {Metadata} from '@/entities/shared/types';

export interface Crop {
    id: string;

    name: string;

    category: string;

    scientificName?: string;

    description?: string;

    metadata: Metadata;

    createdAt: string;
    updatedAt: string;

    archivedAt?: string;
}