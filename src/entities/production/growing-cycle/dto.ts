export interface GrowingListItem {
    id: string;
    cropName: string;
    varietyName: string;

    allocatedArea: number;

    stage: string;
    status:string;

    progress: number;
    tasksCount?: number;

    startDate?: string;
    endDate?: string;
    allocations: Allocations[]
}

export interface Allocations {
    productionUnitId: string
    productionUnitName: string
    area: number
    progress: number
    startDate?: string
    endDate?: string
}
export interface OptionHelpersResponse {
    statuses: Record<string, string>;
    stages: Record<string, string>;
    methods: Record<string, string>;
}
