


// export interface StartCycleRequest {
//     name: string
//     code: string
//     cropID: string
//
//     varietyID?: string
//     protocolID?: string
//     status: string
//     stage: string
//     method: string
//     expectedHarvestAt?: Date
//
//     allocations: AllocationDTO[]
//     plantings: PlantingDTO[]
// }

export interface AllocationDTO {
    productionUnitID: string
    area: number
    startedAt: Date
}

export interface PlantingDTO {
    plantedAt: Date
    quantity: number
}



export interface CycleItemResponse {
    id: string,
    farmId: string,
    cropId: string,
    varietyId?: string,
    name: string,
    code: string,
    method: string,
    status: string,
    stage: string,
    startedAt: Date,
    expectedHarvestAt: Date,
    createdAt: Date,
    updatedAt: Date,
    cropName: string,
    varietyName: string,
    area: number,
    areaUnit: string,
    progress: number
}


export interface ProductionHelpers {
    statuses: Record<string, string>;
    stages: Record<string, string>;
    methods: Record<string, string>;
}