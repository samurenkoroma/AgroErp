import { Season } from "@/entities/season";

export const mockSeasons: Season[] = [
    {
        id: "season-001",
        name: "Весенний сезон 2025",
        startDate: "2025-03-15T00:00:00.000Z",
        endDate: "2025-07-15T00:00:00.000Z",
        status: "current",
        statistics: {
            totalPlans: 24,
            activePlans: 18,
            totalArea: 10,
            completedPlans: 6,
            totalHarvest: 48500, // кг
            crops: [
                {
                    name: "Огурец",
                    icon: "🥒",
                    area: 2.4,
                    yield: 18500,
                    yieldPerHa: 385.4
                },
                {
                    name: "Томат",
                    icon: "🍅",
                    area: 3.2,
                    yield: 22400,
                    yieldPerHa: 350.0
                },
                {
                    name: "Перец",
                    icon: "🫑",
                    area: 1.8,
                    yield: 7600,
                    yieldPerHa: 211.1
                }
            ]
        },
        plantingArea: [
            {
                id: "loc-001",
                name: "Поле №3 (Южное)",
                type: "field",
                cropName: "Огурец",
                varietyName: "Нежинский",
                area: 1.2,
                plantedDate: "2025-03-20T00:00:00.000Z",
                harvestDate: null,
                yieldEfficiency: 92,
                resources: {
                    waterUsed: 125000, // литры
                    fertilizerUsed: [
                        { name: "Аммиачная селитра", amount: 240 },
                        { name: "Суперфосфат", amount: 180 },
                        { name: "Калийная соль", amount: 120 }
                    ],
                    fuelUsed: 320,
                    laborHours: 145
                }
            },
            {
                id: "loc-002",
                name: "Теплица №1",
                type: "greenhouse",
                cropName: "Огурец",
                varietyName: "Кураж F1",
                area: 1.2,
                plantedDate: "2025-03-10T00:00:00.000Z",
                harvestDate: null,
                yieldEfficiency: 96,
                resources: {
                    waterUsed: 98000,
                    fertilizerUsed: [
                        { name: "Аммиачная селитра", amount: 280 },
                        { name: "Суперфосфат", amount: 200 },
                        { name: "Калийная соль", amount: 150 }
                    ],
                    fuelUsed: 180,
                    laborHours: 210
                }
            },
            {
                id: "loc-003",
                name: "Поле №7 (Центральное)",
                type: "field",
                cropName: "Томат",
                varietyName: "Бычье сердце",
                area: 1.6,
                plantedDate: "2025-04-01T00:00:00.000Z",
                harvestDate: null,
                yieldEfficiency: 88,
                resources: {
                    waterUsed: 142000,
                    fertilizerUsed: [
                        { name: "Аммиачная селитра", amount: 320 },
                        { name: "Суперфосфат", amount: 250 },
                        { name: "Калийная соль", amount: 200 }
                    ],
                    fuelUsed: 410,
                    laborHours: 195
                }
            },
            {
                id: "loc-004",
                name: "Теплица №2",
                type: "greenhouse",
                cropName: "Томат",
                varietyName: "Черри красный",
                area: 1.6,
                plantedDate: "2025-03-25T00:00:00.000Z",
                harvestDate: null,
                yieldEfficiency: 94,
                resources: {
                    waterUsed: 110000,
                    fertilizerUsed: [
                        { name: "Аммиачная селитра", amount: 260 },
                        { name: "Суперфосфат", amount: 190 },
                        { name: "Калийная соль", amount: 170 }
                    ],
                    fuelUsed: 160,
                    laborHours: 185
                }
            },
            {
                id: "loc-005",
                name: "Поле №5 (Западное)",
                type: "field",
                cropName: "Перец",
                varietyName: "Калифорнийское чудо",
                area: 1.8,
                plantedDate: "2025-04-10T00:00:00.000Z",
                harvestDate: null,
                yieldEfficiency: 75,
                resources: {
                    waterUsed: 118000,
                    fertilizerUsed: [
                        { name: "Аммиачная селитра", amount: 220 },
                        { name: "Суперфосфат", amount: 170 },
                        { name: "Калийная соль", amount: 190 }
                    ],
                    fuelUsed: 380,
                    laborHours: 170
                }
            }
        ],
        weather: {
            avgTemp: 18.5,
            totalPrecipitation: 245,
            sunnyDays: 42
        },
        notes: "Сезон начат с задержкой из-за весенних заморозков. Огурцы показали отличную всхожесть."
    },
    {
        id: "season-002",
        name: "Летний сезон 2025",
        startDate: "2025-07-01T00:00:00.000Z",
        endDate: "2025-10-15T00:00:00.000Z",
        status: "planning",
        statistics: {
            totalPlans: 28,
            activePlans: 0,
            completedPlans: 0,
            totalHarvest: 0,
            totalArea: 10,
            crops: [
                {
                    name: "Огурец",
                    icon: "🥒",
                    area: 2.8,
                    yield: 0,
                    yieldPerHa: 0
                },
                {
                    name: "Томат",
                    icon: "🍅",
                    area: 3.5,
                    yield: 0,
                    yieldPerHa: 0
                },
                {
                    name: "Баклажан",
                    icon: "🍆",
                    area: 1.5,
                    yield: 0,
                    yieldPerHa: 0
                },
                {
                    name: "Кабачок",
                    icon: "🥒",
                    area: 1.2,
                    yield: 0,
                    yieldPerHa: 0
                }
            ]
        },
        plantingArea: [
            {
                id: "loc-006",
                name: "Поле №3 (Южное)",
                type: "field",
                cropName: "Огурец",
                varietyName: "Нежинский",
                area: 1.4,
                plantedDate: null,
                harvestDate: null,
                yieldEfficiency: 0,
                resources: {
                    waterUsed: 0,
                    fertilizerUsed: [],
                    fuelUsed: 0,
                    laborHours: 0
                }
            },
            {
                id: "loc-007",
                name: "Теплица №1",
                type: "greenhouse",
                cropName: "Огурец",
                varietyName: "Меринда F1",
                area: 1.4,
                plantedDate: null,
                harvestDate: null,
                yieldEfficiency: 0,
                resources: {
                    waterUsed: 0,
                    fertilizerUsed: [],
                    fuelUsed: 0,
                    laborHours: 0
                }
            },
            {
                id: "loc-008",
                name: "Поле №7 (Центральное)",
                type: "field",
                cropName: "Томат",
                varietyName: "Розовый гигант",
                area: 2.0,
                plantedDate: null,
                harvestDate: null,
                yieldEfficiency: 0,
                resources: {
                    waterUsed: 0,
                    fertilizerUsed: [],
                    fuelUsed: 0,
                    laborHours: 0
                }
            },
            {
                id: "loc-009",
                name: "Теплица №2",
                type: "greenhouse",
                cropName: "Томат",
                varietyName: "Сливка",
                area: 1.5,
                plantedDate: null,
                harvestDate: null,
                yieldEfficiency: 0,
                resources: {
                    waterUsed: 0,
                    fertilizerUsed: [],
                    fuelUsed: 0,
                    laborHours: 0
                }
            },
            {
                id: "loc-010",
                name: "Поле №9 (Восточное)",
                type: "field",
                cropName: "Баклажан",
                varietyName: "Алмаз",
                area: 1.5,
                plantedDate: null,
                harvestDate: null,
                yieldEfficiency: 0,
                resources: {
                    waterUsed: 0,
                    fertilizerUsed: [],
                    fuelUsed: 0,
                    laborHours: 0
                }
            },
            {
                id: "loc-011",
                name: "Поле №2 (Северное)",
                type: "field",
                cropName: "Кабачок",
                varietyName: "Цукеша",
                area: 1.2,
                plantedDate: null,
                harvestDate: null,
                yieldEfficiency: 0,
                resources: {
                    waterUsed: 0,
                    fertilizerUsed: [],
                    fuelUsed: 0,
                    laborHours: 0
                }
            }
        ],
        weather: null,
        notes: "Планируется расширение тепличного комплекса. Закуплены новые сорта томатов для летнего сезона."
    },
    {
        id: "season-003",
        name: "Осенний сезон 2024",
        startDate: "2024-08-20T00:00:00.000Z",
        endDate: "2024-11-30T00:00:00.000Z",
        status: "completed",
        statistics: {
            totalPlans: 20,
            activePlans: 0,
            completedPlans: 20,
            totalHarvest: 42300,
            totalArea: 10,
            crops: [
                {
                    name: "Огурец",
                    icon: "🥒",
                    area: 2.0,
                    yield: 15200,
                    yieldPerHa: 380.0
                },
                {
                    name: "Томат",
                    icon: "🍅",
                    area: 2.5,
                    yield: 18900,
                    yieldPerHa: 378.0
                },
                {
                    name: "Перец",
                    icon: "🫑",
                    area: 1.2,
                    yield: 5200,
                    yieldPerHa: 216.7
                },
                {
                    name: "Капуста",
                    icon: "🥬",
                    area: 1.5,
                    yield: 3000,
                    yieldPerHa: 100.0
                }
            ]
        },
        plantingArea: [
            {
                id: "loc-012",
                name: "Поле №3 (Южное)",
                type: "field",
                cropName: "Огурец",
                varietyName: "Конкурент",
                area: 1.0,
                plantedDate: "2024-08-25T00:00:00.000Z",
                harvestDate: "2024-10-15T00:00:00.000Z",
                yieldEfficiency: 95,
                resources: {
                    waterUsed: 98000,
                    fertilizerUsed: [
                        { name: "Аммиачная селитра", amount: 180 },
                        { name: "Суперфосфат", amount: 140 },
                        { name: "Калийная соль", amount: 100 }
                    ],
                    fuelUsed: 250,
                    laborHours: 120
                }
            },
            {
                id: "loc-013",
                name: "Теплица №1",
                type: "greenhouse",
                cropName: "Огурец",
                varietyName: "Зозуля F1",
                area: 1.0,
                plantedDate: "2024-09-01T00:00:00.000Z",
                harvestDate: "2024-10-25T00:00:00.000Z",
                yieldEfficiency: 98,
                resources: {
                    waterUsed: 85000,
                    fertilizerUsed: [
                        { name: "Аммиачная селитра", amount: 190 },
                        { name: "Суперфосфат", amount: 150 },
                        { name: "Калийная соль", amount: 110 }
                    ],
                    fuelUsed: 150,
                    laborHours: 110
                }
            },
            {
                id: "loc-014",
                name: "Поле №7 (Центральное)",
                type: "field",
                cropName: "Томат",
                varietyName: "Новичок",
                area: 1.3,
                plantedDate: "2024-08-20T00:00:00.000Z",
                harvestDate: "2024-10-10T00:00:00.000Z",
                yieldEfficiency: 90,
                resources: {
                    waterUsed: 112000,
                    fertilizerUsed: [
                        { name: "Аммиачная селитра", amount: 210 },
                        { name: "Суперфосфат", amount: 170 },
                        { name: "Калийная соль", amount: 140 }
                    ],
                    fuelUsed: 280,
                    laborHours: 130
                }
            },
            {
                id: "loc-015",
                name: "Теплица №2",
                type: "greenhouse",
                cropName: "Томат",
                varietyName: "Де Барао",
                area: 1.2,
                plantedDate: "2024-09-05T00:00:00.000Z",
                harvestDate: "2024-11-05T00:00:00.000Z",
                yieldEfficiency: 92,
                resources: {
                    waterUsed: 105000,
                    fertilizerUsed: [
                        { name: "Аммиачная селитра", amount: 200 },
                        { name: "Суперфосфат", amount: 160 },
                        { name: "Калийная соль", amount: 130 }
                    ],
                    fuelUsed: 220,
                    laborHours: 140
                }
            },
            {
                id: "loc-016",
                name: "Поле №5 (Западное)",
                type: "field",
                cropName: "Перец",
                varietyName: "Ласточка",
                area: 1.2,
                plantedDate: "2024-08-28T00:00:00.000Z",
                harvestDate: "2024-10-20T00:00:00.000Z",
                yieldEfficiency: 85,
                resources: {
                    waterUsed: 85000,
                    fertilizerUsed: [
                        { name: "Аммиачная селитра", amount: 150 },
                        { name: "Суперфосфат", amount: 120 },
                        { name: "Калийная соль", amount: 140 }
                    ],
                    fuelUsed: 240,
                    laborHours: 100
                }
            },
            {
                id: "loc-017",
                name: "Поле №8 (Пойменное)",
                type: "field",
                cropName: "Капуста",
                varietyName: "Слава",
                area: 1.5,
                plantedDate: "2024-08-15T00:00:00.000Z",
                harvestDate: "2024-10-30T00:00:00.000Z",
                yieldEfficiency: 88,
                resources: {
                    waterUsed: 185000,
                    fertilizerUsed: [
                        { name: "Аммиачная селитра", amount: 120 },
                        { name: "Суперфосфат", amount: 90 },
                        { name: "Калийная соль", amount: 80 }
                    ],
                    fuelUsed: 190,
                    laborHours: 95
                }
            }
        ],
        weather: {
            avgTemp: 14.2,
            totalPrecipitation: 180,
            sunnyDays: 35
        },
        notes: "Урожайность огурцов превысила плановые показатели на 15% благодаря благоприятным погодным условиям сентября."
    }
];


