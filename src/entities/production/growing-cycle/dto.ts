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
