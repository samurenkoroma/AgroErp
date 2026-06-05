export interface CreateCycleRequest {
    productionUnitID: string
    area: number
    cropID: string
    name: string
    code: string
    method: string
    varietyID?: string
    protocolID?: string
    expectedHarvestAt?: Date
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

