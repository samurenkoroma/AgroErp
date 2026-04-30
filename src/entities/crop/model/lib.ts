import {Crop, Specie} from './types';

export const calculateHarvestDate = (sowingDate: Date, crop: Crop): Date => {
    const harvestDate = new Date(sowingDate);
    harvestDate.setDate(harvestDate.getDate() + crop.growingDays);
    return harvestDate;
};

export const isTemperatureSuitable = (crop: Crop, currentTempC: number): boolean => {
    return currentTempC >= crop.temperature.min && currentTempC <= crop.temperature.max;
};

export const getCropColor = (crop: Crop | null | undefined): string => {
    return crop?.color || '#9CA3AF'; // gray-400 по умолчанию
};

// Добавь эти функции
export const isCropSuitableAfterPrevious = (newCropId: string, previousCropId: string): {
    isGood: boolean;
    message: string
} => {
    // Простая логика севооборота (можно расширять)
    const badPairs: Record<string, string[]> = {
        'crop-wheat': ['crop-wheat', 'crop-barley'], // зерновые после зерновых плохо
        'crop-sunflower': ['crop-sunflower'],
    };

    const isBad = badPairs[previousCropId]?.includes(newCropId);

    return {
        isGood: !isBad,
        message: isBad
            ? 'Эта культура уже выращивалась недавно. Рекомендуется чередовать.'
            : 'Хороший выбор для севооборота.'
    };
};

export const getGardenCrops = (crops: Specie[]) => {
    return crops.filter(c =>
        c.category === 'Овощные' ||
        c.category === 'Зеленные' ||
        c.category === 'Пряные'
    );
};

// Для полей (зерновые, технические, бобовые)
export const getFieldCrops = (crops: Crop[]) => {
    return crops.filter(c =>
        c.category === 'Зерновые' ||
        c.category === 'Технические' ||
        c.category === 'Бобовые'
    );
};
// Получение культур, подходящих для теплиц (все овощные, зеленные и пряные)
export const getGreenhouseCrops = (crops: Crop[]) => {
    return crops.filter(c =>
        c.category === 'Овощные' ||
        c.category === 'Зеленные' ||
        c.category === 'Пряные'
    );
}
