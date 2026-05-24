import {Metadata, Quantity} from '@/entities/shared/types';

export interface Substrate {
    id: string;
    name: string;
    type: string;
    volume?: Quantity;
    metadata: Metadata;
}