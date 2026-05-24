import {Location, Metadata} from '@/entities/shared/types';

export interface Farm {
    id: string;
    organizationId: string;
    name: string;
    location?: Location;
    metadata: Metadata;
    createdAt: string;
    updatedAt: string;
}