export interface CreateCropRequest {
    name: string;
    category: string;
    family: string;
    scientificName?: string;
    description?: string;
}

export interface UpdateCropRequest {
    id: string;
    name?: string;
    category?: string;
    scientificName?: string;
    description?: string;
}

export interface CropFilters {
    search?: string;
    categories?: string[];
    family?: string;
    archived?: boolean;
}