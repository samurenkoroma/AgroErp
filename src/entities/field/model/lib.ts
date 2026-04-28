import {Field} from './types';
import {calculateHarvestDate, Crop} from '@/entities';

export const updateFieldWithCrop = (field: Field, crop: Crop | null, sowingDate?: Date): Field => {
    if (!crop) {
        return {...field, plannedCrop: null, sowingDate: undefined, expectedHarvestDate: undefined};
    }

    const sowing = sowingDate || new Date();
    const harvestDate = calculateHarvestDate(sowing, crop);

    return {
        ...field,
        plannedCrop: crop,
        sowingDate: sowing.toISOString(),
        expectedHarvestDate: harvestDate.toISOString(),
        status: 'sown' as const,
    };
};