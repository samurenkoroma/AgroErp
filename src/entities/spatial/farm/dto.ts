export interface CreateFarmRequest {
    organizationId: string;
    name: string;
    location?: {
        country?: string;
        region?: string;
        city?: string;
        coordinates?: {
            lat: number;
            lon: number;
        };
    };
}

export interface UpdateFarmRequest {
    id: string;
    name?: string;
    location?: {
        country?: string;
        region?: string;
        city?: string;
    };
}