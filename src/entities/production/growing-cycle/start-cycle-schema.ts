import {z} from "zod";

export const allocationSchema = z.object({
    productionUnitID: z.string().min(1, "Production unit is required"),
    area: z.number().nonnegative("Должно быть не отрицательным"),
    startedAt: z.date()
})

export const plantingSchema = z.object({
    plantedAt: z.date(),
    quantity: z.number().positive("Quantity must be greater than zero")
})

export const startCycleSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),

    cropID: z.string().min(1, "Crop is required"),

    varietyID: z.string().optional(),
    protocolID: z.string().optional(),

    status: z.string(),
    stage: z.string(),
    method: z.string(),

    expectedHarvestAt: z.date().optional(),

    allocations: z.array(allocationSchema),
    plantings: z.array(plantingSchema)
})

export type StartCycleRequest = z.infer<typeof startCycleSchema>