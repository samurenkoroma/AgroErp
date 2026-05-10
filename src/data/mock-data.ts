import {CropPlan, CultivationPlan, CurrentPhenology, Location} from '../entities/planning/types.ts';

// ============================================
// 1. КУЛЬТУРЫ (Crops)
// ============================================
// Добавляем мок-данные для мест посадки
export const mockLocations: Location[] = [
    {
        id: "field-north",
        name: "Поле Северное",
        type: "field",
        area: 50,
        areaUnit: "ha",
        isAvailable: true,
        description: "Основное поле для зерновых культур"
    },
    {
        id: "field-east",
        name: "Поле Восточное",
        type: "field",
        area: 75,
        areaUnit: "ha",
        isAvailable: true,
        description: "Поле с черноземом"
    },
    {
        id: "greenhouse-main",
        name: "Теплица Основная",
        type: "greenhouse",
        area: 500,
        areaUnit: "m2",
        isAvailable: true,
        description: "Отапливаемая теплица"
    },
    {
        id: "greenhouse-small",
        name: "Теплица Малая",
        type: "greenhouse",
        area: 200,
        areaUnit: "m2",
        isAvailable: false,
        description: "В ремонте"
    },
    {
        id: "plot-garden",
        name: "Участок Приусадебный",
        type: "plot",
        area: 12,
        areaUnit: "ha",
        isAvailable: true,
        description: "Для овощных культур"
    },
    {
        id: "bed-greenhouse-1",
        name: "Теплица №1 / Грядка 1",
        type: "bed",
        area: 0.025,
        areaUnit: "ha",
        isAvailable: true,
        description: "Левая грядка"
    },
    {
        id: "bed-greenhouse-2",
        name: "Теплица №1 / Грядка 2",
        type: "bed",
        area: 0.025,
        areaUnit: "ha",
        isAvailable: true,
        description: "Правая грядка"
    }
];


// ============================================
// 3. ШАБЛОНЫ ВЫРАЩИВАНИЯ (Cultivation Plans)
// ============================================

export const mockCultivationPlans: CultivationPlan[] = [
    {
        id: "basic-tomato",
        name: "Базовый план томата",
        cropId: "tomato",
        description: "Стандартная схема выращивания томата в открытом грунте",
        steps: [
            {
                id: "step-1",
                type: "watering",
                trigger: {type: "day_offset", dayOffset: 0},
                params: {amount: "5 л/м²"}
            },
            {
                id: "step-2",
                type: "fertilizing",
                trigger: {type: "day_offset", dayOffset: 14},
                params: {fertilizer: "Азотные удобрения", amount: "20 г/м²"}
            },
            {
                id: "step-3",
                type: "spraying",
                trigger: {type: "bbch", stage: "BBCH-51"},
                params: {pesticide: "От фитофторы", concentration: "0.2%"}
            },
            {
                id: "step-4",
                type: "fertilizing",
                trigger: {type: "bbch", stage: "BBCH-61"},
                params: {fertilizer: "Калийные удобрения", amount: "15 г/м²"}
            },
            {
                id: "step-5",
                type: "harvesting",
                trigger: {type: "bbch", stage: "BBCH-89"},
                params: {method: "ручной сбор"}
            }
        ]
    },
    {
        id: "intensive-tomato",
        name: "Интенсивный план томата (теплица)",
        cropId: "tomato",
        description: "Интенсивная схема для тепличного выращивания с капельным поливом",
        steps: [
            {
                id: "step-1",
                type: "watering",
                trigger: {type: "day_offset", dayOffset: 0},
                params: {amount: "3 л/м²", method: "капельный"}
            },
            {
                id: "step-2",
                type: "fertilizing",
                trigger: {type: "day_offset", dayOffset: 7},
                params: {fertilizer: "Комплексное", amount: "25 г/м²"}
            },
            {
                id: "step-3",
                type: "spraying",
                trigger: {type: "bbch", stage: "BBCH-19"},
                params: {pesticide: "Биопрепараты", concentration: "0.1%"}
            },
            {
                id: "step-4",
                type: "watering",
                trigger: {type: "day_offset", dayOffset: 21},
                params: {amount: "4 л/м²", method: "капельный"}
            },
            {
                id: "step-5",
                type: "fertilizing",
                trigger: {type: "bbch", stage: "BBCH-61"},
                params: {fertilizer: "Фосфорно-калийные", amount: "30 г/м²"}
            },
            {
                id: "step-6",
                type: "harvesting",
                trigger: {type: "bbch", stage: "BBCH-89"},
                params: {method: "сбор 2 раза в неделю"}
            }
        ]
    },
    {
        id: "basic-cucumber",
        name: "Базовый план огурца",
        cropId: "cucumber",
        description: "Стандартная схема выращивания огурца в теплице",
        steps: [
            {
                id: "step-1",
                type: "watering",
                trigger: {type: "day_offset", dayOffset: 0},
                params: {amount: "5 л/м²"}
            },
            {
                id: "step-2",
                type: "fertilizing",
                trigger: {type: "day_offset", dayOffset: 10},
                params: {fertilizer: "Азотные", amount: "15 г/м²"}
            },
            {
                id: "step-3",
                type: "spraying",
                trigger: {type: "bbch", stage: "BBCH-51"},
                params: {pesticide: "От мучнистой росы", concentration: "0.15%"}
            },
            {
                id: "step-4",
                type: "fertilizing",
                trigger: {type: "bbch", stage: "BBCH-71"},
                params: {fertilizer: "Калийные", amount: "20 г/м²"}
            },
            {
                id: "step-5",
                type: "harvesting",
                trigger: {type: "day_offset", dayOffset: 45},
                params: {method: "ежедневный сбор"}
            }
        ]
    }
];

// ============================================
// 4. ПЛАНЫ ВЫРАЩИВАНИЯ (Crop Plans)
// ============================================

export const mockCropPlans: CropPlan[] = [
    {
        id: "plan-1",
        cropId: "tomato",
        varietyId: "tomato-bull-heart",
        cultivationPlanId: "basic-tomato",
        startDate: "2025-04-15T00:00:00Z",
        locationId: "field-north",
        status: "active",
        createdAt: "2025-03-01T10:00:00Z",
        updatedAt: "2025-04-15T08:00:00Z"
    },
    {
        id: "plan-2",
        cropId: "tomato",
        varietyId: "tomato-cherry",
        cultivationPlanId: "intensive-tomato",
        startDate: "2025-05-01T00:00:00Z",
        locationId: "bed-greenhouse-1",
        status: "active",
        createdAt: "2025-04-10T10:00:00Z",
        updatedAt: "2025-05-01T08:00:00Z"
    },
    {
        id: "plan-3",
        cropId: "cucumber",
        varietyId: "cucumber-german",
        cultivationPlanId: "basic-cucumber",
        startDate: "2025-03-20T00:00:00Z",
        locationId: "bed-greenhouse-1",
        status: "completed",
        createdAt: "2025-02-15T10:00:00Z",
        updatedAt: "2025-06-10T16:00:00Z"
    },
    {
        id: "plan-4",
        cropId: "potato",
        varietyId: "potato-nevsky",
        cultivationPlanId: "basic-tomato",
        startDate: "2025-05-10T00:00:00Z",
        locationId: "bed-greenhouse-1",
        status: "draft",
        createdAt: "2025-04-20T10:00:00Z",
        updatedAt: "2025-04-20T10:00:00Z"
    }
];

// ============================================
// 5. ТЕКУЩАЯ ФЕНОЛОГИЯ (Current Phenology)
// ============================================

export const mockPhenology: CurrentPhenology = {
    planId: "plan-1",
    varietyId: "tomato-bull-heart",
    varietyName: "Бычье сердце",
    accumulatedGDD: 680,
    requiredGDDForNext: 780,
    currentPhaseCode: "BBCH-71",
    currentPhaseName: "Завязывание плодов",
    progressPercent: 87.2,
    estimatedDaysToNextPhase: 5,
    estimatedHarvestDate: "2025-07-10T00:00:00Z",
    deviationDays: 2,
    deviationReason: "heat_wave",
    isCritical: true,
    recommendedActions: [
        {
            title: "Увеличить полив",
            description: "В период завязывания плодов требуется больше воды",
            priority: "high",
            dueDays: 0
        },
        {
            title: "Внести калийные удобрения",
            description: "Для улучшения качества плодов",
            priority: "medium",
            dueDays: 2
        },
        {
            title: "Пасынкование",
            description: "Удалить боковые побеги",
            priority: "medium",
            dueDays: 3
        }
    ]
};

// ============================================
// 6. API МОК-ФУНКЦИИ
// ============================================

export const mockApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockCropPlanningApi = {
    async getCultivationPlans(cropId?: string): Promise<CultivationPlan[]> {
        await mockApiDelay();
        let plans = [...mockCultivationPlans];
        if (cropId) {
            plans = plans.filter(p => p.cropId === cropId);
        }
        return plans;
    },

    async getCultivationPlan(id: string): Promise<CultivationPlan> {
        await mockApiDelay();
        const plan = mockCultivationPlans.find(p => p.id === id);
        if (!plan) throw new Error('Cultivation plan not found');
        return {...plan};
    },

    async createCropPlan(data: any): Promise<CropPlan> {
        await mockApiDelay(1000);
        const newPlan: CropPlan = {
            id: `plan-${Date.now()}`,
            ...data,
            status: "draft",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        return newPlan;
    },

    async getCropPlans(status?: string): Promise<CropPlan[]> {
        await mockApiDelay();
        let plans = [...mockCropPlans];
        if (status) {
            plans = plans.filter(p => p.status === status);
        }
        return plans;
    },

    async getCropPlan(id: string): Promise<CropPlan> {
        await mockApiDelay();
        const plan = mockCropPlans.find(p => p.id === id);
        if (!plan) throw new Error('Crop plan not found');
        return {...plan};
    },

    async updateCropPlanStatus(id: string, status: CropPlan['status']): Promise<CropPlan> {
        await mockApiDelay();
        const plan = mockCropPlans.find(p => p.id === id);
        if (!plan) throw new Error('Crop plan not found');
        const updatedPlan = {...plan, status, updatedAt: new Date().toISOString()};
        return updatedPlan;
    },

    async getPhenology(planId: string): Promise<CurrentPhenology> {
        await mockApiDelay();
        // Возвращаем разные данные для разных планов
        if (planId === 'plan-1') {
            return {...mockPhenology};
        }
        return {
            ...mockPhenology,
            planId,
            accumulatedGDD: 350,
            requiredGDDForNext: 480,
            currentPhaseCode: "BBCH-51",
            currentPhaseName: "Бутонизация",
            progressPercent: 73,
            estimatedDaysToNextPhase: 8,
            isCritical: false,
            recommendedActions: []
        };
    },

    // В mock-функциях добавляем
    async getLocations() {
        await mockApiDelay();
        return [...mockLocations];
    },

    async getLocation(id: string) {
        await mockApiDelay();
        const location = mockLocations.find(l => l.id === id);
        if (!location) throw new Error('Location not found');
        return {...location};
    }
};
