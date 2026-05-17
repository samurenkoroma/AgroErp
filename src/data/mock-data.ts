import {
    CropPlan,
    CropPlanDTO,
    CultivationPlan,
    CurrentPhenology,
    PlanStatisticsResponse,
    TaskDTO
} from '../entities/planning/types.ts';

// ============================================
// 3. ШАБЛОНЫ ВЫРАЩИВАНИЯ (Cultivation Plans)
// ============================================

export const mockCultivationPlans: CultivationPlan[] = [
    {
        id: "basic-tomato",
        name: "Базовый план томата",
        version: 0,
        cropKey: "tomato",
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
export const mockCropPlans: CropPlan[] = [
    {
        id: 'plan-1',
        name: 'Пшеница озимая 2025',
        crop_name: 'Пшеница озимая',
        variety_name: 'Мироновская 65',
        bed_id: 'field-1',
        bed_name: 'Поле Северное',
        object_type: 'field',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2024-09-15',
        expected_harvest_date: '2025-07-20',
        expected_yield: 4250,
        actual_yield: 3100,
        progress: 72,
        area: 50,
        area_unit: 'ha',
        is_seedling: false,
        created_at: '2024-08-01T10:00:00Z',
        updated_at: '2025-04-15T14:30:00Z',
        assigned_to: 'user-1',
        assigned_name: 'Иван Иванов',
        tasks_completed: 12,
        tasks_total: 18,
        notes: 'Хорошая перезимовка'
    },
    {
        id: 'plan-2',
        name: 'Томаты ранние 2025',
        crop_name: 'Томат',
        variety_name: 'Бычье сердце',
        bed_id: 'greenhouse-1-bed1',
        bed_name: 'Теплица №1 / Грядка 1',
        object_type: 'greenhouse',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2025-04-20',
        expected_harvest_date: '2025-07-20',
        expected_yield: 1750,
        actual_yield: 450,
        progress: 25,
        area: 0.25,
        area_unit: 'm2',
        is_seedling: true,
        seedling_status: 'growing',
        created_at: '2025-02-15T10:00:00Z',
        updated_at: '2025-04-20T08:00:00Z',
        assigned_to: 'user-1',
        assigned_name: 'Иван Иванов',
        tasks_completed: 8,
        tasks_total: 32,
        notes: 'Рассада крепкая'
    },
    {
        id: 'plan-3',
        name: 'Кукуруза 2025',
        crop_name: 'Кукуруза',
        variety_name: 'Днепровский 247',
        bed_id: 'field-2',
        bed_name: 'Поле Восточное',
        object_type: 'field',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2025-04-25',
        expected_harvest_date: '2025-09-10',
        expected_yield: 5250,
        actual_yield: 3750,
        progress: 71,
        area: 75,
        area_unit: 'ha',
        is_seedling: false,
        created_at: '2025-02-01T10:00:00Z',
        updated_at: '2025-04-25T14:30:00Z',
        assigned_to: 'user-2',
        assigned_name: 'Петр Петров',
        tasks_completed: 15,
        tasks_total: 21,
        notes: 'Всходы дружные'
    },
    {
        id: 'plan-4',
        name: 'Огурцы весенние 2025',
        crop_name: 'Огурец',
        variety_name: 'Герман F1',
        bed_id: 'greenhouse-1-bed2',
        bed_name: 'Теплица №1 / Грядка 2',
        object_type: 'greenhouse',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2025-05-01',
        expected_harvest_date: '2025-07-15',
        expected_yield: 600,
        actual_yield: 320,
        progress: 53,
        area: 0.25,
        area_unit: 'm2',
        is_seedling: true,
        seedling_status: 'planted',
        created_at: '2025-03-01T10:00:00Z',
        updated_at: '2025-05-01T09:00:00Z',
        assigned_to: 'user-3',
        assigned_name: 'Мария Сидорова',
        tasks_completed: 14,
        tasks_total: 26,
        notes: 'Хороший урожай'
    },
    {
        id: 'plan-5',
        name: 'Соя 2025',
        crop_name: 'Соя',
        variety_name: 'Аннушка',
        bed_id: 'field-3',
        bed_name: 'Поле Западное',
        object_type: 'field',
        status: 'draft',
        status_text: 'Черновик',
        planting_date: '2025-05-10',
        expected_harvest_date: '2025-08-20',
        expected_yield: 2300,
        actual_yield: 0,
        progress: 0,
        area: 33,
        area_unit: 'ha',
        is_seedling: false,
        created_at: '2025-04-10T10:00:00Z',
        updated_at: '2025-04-10T10:00:00Z',
        assigned_to: 'user-1',
        assigned_name: 'Иван Иванов',
        tasks_completed: 0,
        tasks_total: 15,
        notes: 'План в разработке'
    },
    {
        id: 'plan-6',
        name: 'Перец сладкий 2025',
        crop_name: 'Перец сладкий',
        variety_name: 'Калифорнийское чудо',
        bed_id: 'greenhouse-2-bed1',
        bed_name: 'Теплица №2 / Грядка 1',
        object_type: 'greenhouse',
        status: 'planned',
        status_text: 'Запланирован',
        planting_date: '2025-05-25',
        expected_harvest_date: '2025-08-25',
        expected_yield: 800,
        actual_yield: 0,
        progress: 0,
        area: 0.2,
        area_unit: 'm2',
        is_seedling: true,
        seedling_status: 'sowing',
        created_at: '2025-04-15T10:00:00Z',
        updated_at: '2025-04-15T10:00:00Z',
        assigned_to: 'user-1',
        assigned_name: 'Иван Иванов',
        tasks_completed: 2,
        tasks_total: 28,
        notes: 'Семена заказаны'
    },
    {
        id: 'plan-7',
        name: 'Картофель 2025',
        crop_name: 'Картофель',
        variety_name: 'Невский',
        bed_id: 'plot-1-bed1',
        bed_name: 'Участок Приусадебный / Грядка 1',
        object_type: 'plot',
        status: 'completed',
        status_text: 'Завершен',
        planting_date: '2025-04-01',
        expected_harvest_date: '2025-07-01',
        expected_yield: 500,
        actual_yield: 520,
        progress: 100,
        area: 0.04,
        area_unit: 'm2',
        is_seedling: false,
        created_at: '2025-03-01T10:00:00Z',
        updated_at: '2025-07-01T16:00:00Z',
        assigned_to: 'user-3',
        assigned_name: 'Мария Сидорова',
        tasks_completed: 18,
        tasks_total: 18,
        notes: 'Урожай отличный!'
    }
];
export const mockCropPlan: CropPlanDTO = {
    id: 'plan-tomato-1',
    bed_id: 'greenhouse-1',
    name: 'Томаты ранние 2025',
    variety_id: 'var-tomato-1',
    variety_name: 'Бычье сердце',
    crop_name: 'Томат',
    status: 'active',
    status_text: 'Активный',
    season_start: '2025-03-01T00:00:00Z',
    season_end: '2025-07-31T00:00:00Z',
    planting_date: '2025-04-20T00:00:00Z',
    sowing_date: '2025-03-01T00:00:00Z',
    seeds_planted: 1000,
    expected_yield: 2000,
    harvest_kg: 450,
    progress: 45,
    stages: [
        {
            id: 'stage-1',
            name: 'Посев семян на рассаду',
            type: 'sowing',
            description: 'Посев семян в кассеты',
            status: 'completed',
            status_text: 'Завершен',
            order: 1,
            bbch_start: 0,
            bbch_end: 9,
            is_applicable: true,
            start_date: '2025-03-01T00:00:00Z',
            end_date: '2025-03-01T00:00:00Z'
        },
        {
            id: 'stage-2',
            name: 'Выращивание рассады',
            type: 'seedling',
            description: 'Уход за рассадой, полив, подкормка',
            status: 'completed',
            status_text: 'Завершен',
            order: 2,
            bbch_start: 10,
            bbch_end: 19,
            is_applicable: true,
            start_date: '2025-03-02T00:00:00Z',
            end_date: '2025-04-19T00:00:00Z'
        },
        {
            id: 'stage-3',
            name: 'Закалка рассады',
            type: 'hardening',
            description: 'Адаптация к внешним условиям',
            status: 'completed',
            status_text: 'Завершен',
            order: 3,
            bbch_start: 19,
            bbch_end: 19,
            is_applicable: true,
            start_date: '2025-04-13T00:00:00Z',
            end_date: '2025-04-19T00:00:00Z'
        },
        {
            id: 'stage-4',
            name: 'Высадка в грунт',
            type: 'planting',
            description: 'Высадка рассады на постоянное место',
            status: 'in_progress',
            status_text: 'В процессе',
            order: 4,
            bbch_start: 20,
            bbch_end: 29,
            is_applicable: true,
            start_date: '2025-04-20T00:00:00Z',
            end_date: null
        },
        {
            id: 'stage-5',
            name: 'Вегетативный рост',
            type: 'vegetative',
            description: 'Рост и развитие растений',
            status: 'pending',
            status_text: 'Ожидает',
            order: 5,
            bbch_start: 30,
            bbch_end: 49,
            is_applicable: true,
            start_date: null,
            end_date: null
        },
        {
            id: 'stage-6',
            name: 'Цветение',
            type: 'flowering',
            description: 'Формирование цветочных кистей',
            status: 'pending',
            status_text: 'Ожидает',
            order: 6,
            bbch_start: 50,
            bbch_end: 69,
            is_applicable: true,
            start_date: null,
            end_date: null
        },
        {
            id: 'stage-7',
            name: 'Плодоношение',
            type: 'fruiting',
            description: 'Формирование и созревание плодов',
            status: 'pending',
            status_text: 'Ожидает',
            order: 7,
            bbch_start: 70,
            bbch_end: 89,
            is_applicable: true,
            start_date: null,
            end_date: null
        },
        {
            id: 'stage-8',
            name: 'Сбор урожая',
            type: 'harvest',
            description: 'Сбор плодов',
            status: 'pending',
            status_text: 'Ожидает',
            order: 8,
            bbch_start: 90,
            bbch_end: 99,
            is_applicable: true,
            start_date: null,
            end_date: null
        }
    ],
    current_stage: {
        id: 'stage-4',
        name: 'Высадка в грунт',
        type: 'planting',
        description: 'Высадка рассады на постоянное место',
        status: 'in_progress',
        status_text: 'В процессе',
        order: 4,
        bbch_start: 20,
        bbch_end: 29,
        is_applicable: true,
        start_date: '2025-04-20T00:00:00Z',
        end_date: null
    },
    assigned_to: 'user-1',
    assigned_name: 'Иван Иванов',
    created_at: '2025-02-15T10:00:00Z',
    started_at: '2025-03-01T00:00:00Z',
    completed_at: null,
    seedlingInfo: {
        isSeedling: true,
        sowingDate: '2025-03-01T00:00:00Z',
        expectedPlantingDate: '2025-04-20T00:00:00Z',
        optimalAgeMin: 45,
        optimalAgeMax: 55,
        seedlingHeight: 20,
        leafCount: 6,
        hardeningDays: 7,
        hardeningStartDate: '2025-04-13T00:00:00Z',
        hardeningEndDate: '2025-04-19T00:00:00Z',
        containerType: 'Кассета',
        containerSize: '40 ячеек',
        notes: 'Требуется хорошее освещение для предотвращения вытягивания. Рекомендуется досвечивание фитолампами 14-16 часов в сутки.',
        recommendedStages: [
            {
                bbchCode: 'BBCH-19',
                name: '9 и более листьев',
                description: 'Рассада сформировала 6-8 настоящих листьев, высота 15-20 см'
            }
        ]
    }
};
export const mockStatistics: PlanStatisticsResponse = {
    plan_id: 'plan-tomato-1',
    plan_name: 'Томаты ранние 2025',
    variety_name: 'Бычье сердце',
    status: 'active',
    progress: 45,
    completed_stages: 3,
    total_stages: 8,
    pending_stages: 4,
    in_progress_stages: 1,
    skipped_stages: 0,
    days_since_planting: 0,
    days_remaining: 85,
    days_to_harvest: 85,
    expected_yield: 2000,
    actual_yield: 0,
    yield_efficiency: 0,
    total_tasks: 24,
    completed_tasks: 11,
    pending_tasks: 13,
    overdue_tasks: 0,
    avg_task_completion_days: 2.5,
    deviation_days: 0,
    recommendations: [
        'Контролировать влажность почвы после высадки',
        'Провести профилактическую обработку от фитофторы'
    ]
};
export const mockTasks: TaskDTO[] = [
    {
        id: 'task-1',
        plan_id: 'plan-tomato-1',
        bed_id: 'greenhouse-1',
        type: 'irrigation',
        type_text: 'Полив',
        status: 'pending',
        status_text: 'Ожидает',
        priority: 'high',
        priority_text: 'Высокий',
        priority_color: '#FF9800',
        title: 'Полив после высадки',
        description: 'Обильный полив для лучшей приживаемости рассады',
        instructions: 'Поливать под корень, 0.5-1 литр на растение',
        scheduled_date: '2025-04-20T08:00:00Z',
        due_date: '2025-04-20T18:00:00Z',
        is_overdue: false,
        estimated_duration: 60,
        actual_duration: 0,
        latitude: 55.7558,
        longitude: 37.6173,
        photos: [],
        comments: [],
        completed_at: null,
        completed_by: null
    },
    {
        id: 'task-2',
        plan_id: 'plan-tomato-1',
        bed_id: 'greenhouse-1',
        type: 'protection',
        type_text: 'Защита',
        status: 'pending',
        status_text: 'Ожидает',
        priority: 'medium',
        priority_text: 'Средний',
        priority_color: '#2196F3',
        title: 'Профилактическая обработка',
        description: 'Обработка от фитофторы и других болезней',
        instructions: 'Опрыскать растения препаратом "Ридомил Голд"',
        scheduled_date: '2025-04-25T10:00:00Z',
        due_date: '2025-04-27T18:00:00Z',
        is_overdue: false,
        estimated_duration: 45,
        actual_duration: 0,
        latitude: 55.7558,
        longitude: 37.6173,
        photos: [],
        comments: [],
        completed_at: null,
        completed_by: null
    }
];
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
            plans = plans.filter(p => p.cropKey === cropId);
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
        const plan = mockCropPlan.find(p => p.id === id);
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


};
