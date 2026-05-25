import {Metadata} from '@/entities/shared/types';

export interface StageProfile {
    stageId: string;
    duration?: number;
    targetPh?: number;
    targetEc?: number;
    targetTemperature?: number;
    targetHumidity?: number;
}

export interface CropProtocol {
    id: string;
    cropId: string;
    name: string;
    growingMethod: string;
    description?: string;
    stageProfiles: StageProfile[];
    metadata: Metadata;
    createdAt: string;
    updatedAt: string;
}