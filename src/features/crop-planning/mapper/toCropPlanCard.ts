import {CropPlan} from "@/entities/planning";
import {cropPlanLib} from "@/utils/cropPlanLib.ts";

export type CropPlanCardVM = {
    id: string
    status: string
    progress: number
    crop: {
        name: string
    }
    variety: {
        name: string
    }
    productionUnit: {
        id: string
        area: number
        name: string
    }
    plantingDate: Date
}

export function toCropPlanCard(plan: CropPlan): CropPlanCardVM {
    return {
        id: plan.id,
        status: plan.status,
        progress: cropPlanLib.calculateProgress({
            start: new Date(plan.plantingDate),
            total: plan.variety.daysToMaturity
        }),
        crop: {
            name: plan.crop.name
        },
        variety: {
            name: plan.variety.name
        },
        productionUnit: {
            id: plan.productionUnit.id,
            area: plan.productionUnit.area,
            name: plan.productionUnit.name,
        },
        plantingDate: new Date(plan.plantingDate)
    }
}