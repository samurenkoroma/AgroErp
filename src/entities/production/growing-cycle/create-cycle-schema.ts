import {z} from "zod";

export const createCycleSchema = z.object({
    // productionUnitID: z.string().min(1),
    // area: z.number().positive(),
    name: z.string().min(1, "Введите название"),
    cropID: z.string().min(1, "Выберите культуру"),
    code: z.string(),
    varietyID: z.string().optional(),
    method: z.string().min(1)
});



export type CreateCycleRequest = z.infer<typeof createCycleSchema>;