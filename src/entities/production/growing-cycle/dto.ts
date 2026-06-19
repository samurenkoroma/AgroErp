export interface GrowingListItem {
    cropName: string;
    allocatedArea: number;
    tasksCount?: number;
    progress: number;
    count: number;
    allocations: Allocations[]
}

export interface Allocations {
    cycleName: string;
    cycleId: string;
    varietyName?: string;
    status:string;
    stage: string;
    productionUnitId?: string
    productionUnitName?: string
    area?: number
    progress: number
    startDate?: string
    endDate?: string
}
export interface OptionHelpersResponse {
    statuses: Record<string, string>;
    stages: Record<string, string>;
    methods: Record<string, string>;
}
