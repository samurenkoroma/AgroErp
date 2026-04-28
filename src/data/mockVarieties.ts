import {CropVariety} from "@/features/planting/ui/PlantingRecordModal.tsx";

export const mockVarieties: CropVariety[] = [
    // Сорта пшеницы
    {
        id: 'var-1-1',
        name: 'Мироновская 65',
        cropId: 'crop-1',
        cropName: 'Пшеница озимая',
        seedingRate: {type: 'seeds', value: 160, unit: 'кг/га', note: 'Норма высева для сорта Мироновская 65'},
        growingDays: 265,
        yieldPotential: {min: 45, max: 55, unit: 'ц/га'}
    },
    {
        id: 'var-1-2',
        name: 'Подолянка',
        cropId: 'crop-1',
        cropName: 'Пшеница озимая',
        seedingRate: {type: 'seeds', value: 180, unit: 'кг/га', note: 'Норма высева для сорта Подолянка'},
        growingDays: 270,
        yieldPotential: {min: 50, max: 60, unit: 'ц/га'}
    },
    {
        id: 'var-1-3',
        name: 'Астория',
        cropId: 'crop-1',
        cropName: 'Пшеница озимая',
        seedingRate: {type: 'seeds', value: 170, unit: 'кг/га', note: 'Норма высева для сорта Астория'},
        growingDays: 268,
        yieldPotential: {min: 48, max: 58, unit: 'ц/га'}
    },

    // Сорта томатов
    {
        id: 'var-2-1',
        name: 'Бычье сердце',
        cropId: 'crop-2',
        cropName: 'Томат',
        seedingRate: {type: 'seedlings', value: 3, unit: 'раст/м²', note: 'Крупноплодный сорт, требуется больше места'},
        growingDays: 120,
        yieldPotential: {min: 8, max: 12, unit: 'кг/м²'}
    },
    {
        id: 'var-2-2',
        name: 'Черри красный',
        cropId: 'crop-2',
        cropName: 'Томат',
        seedingRate: {type: 'seedlings', value: 5, unit: 'раст/м²', note: 'Мелкоплодный сорт, более густая посадка'},
        growingDays: 85,
        yieldPotential: {min: 5, max: 8, unit: 'кг/м²'}
    },
    {
        id: 'var-2-3',
        name: 'Розовый гигант',
        cropId: 'crop-2',
        cropName: 'Томат',
        seedingRate: {type: 'seedlings', value: 3.5, unit: 'раст/м²', note: 'Крупноплодный розовый сорт'},
        growingDays: 110,
        yieldPotential: {min: 10, max: 15, unit: 'кг/м²'}
    },

    // Сорта огурцов
    {
        id: 'var-3-1',
        name: 'Изящный',
        cropId: 'crop-3',
        cropName: 'Огурец',
        seedingRate: {type: 'seedlings', value: 3, unit: 'раст/м²', note: 'Пчелоопыляемый сорт'},
        growingDays: 45,
        yieldPotential: {min: 6, max: 9, unit: 'кг/м²'}
    },
    {
        id: 'var-3-2',
        name: 'Герман F1',
        cropId: 'crop-3',
        cropName: 'Огурец',
        seedingRate: {
            type: 'seedlings',
            value: 4,
            unit: 'раст/м²',
            note: 'Партенокарпический гибрид, более густая посадка'
        },
        growingDays: 40,
        yieldPotential: {min: 12, max: 16, unit: 'кг/м²'}
    },

    // Сорта картофеля
    {
        id: 'var-4-1',
        name: 'Невский',
        cropId: 'crop-4',
        cropName: 'Картофель',
        seedingRate: {type: 'seeds', value: 2800, unit: 'кг/га', note: 'Среднеранний сорт'},
        growingDays: 80,
        yieldPotential: {min: 300, max: 400, unit: 'ц/га'}
    },
    {
        id: 'var-4-2',
        name: 'Ред Скарлет',
        cropId: 'crop-4',
        cropName: 'Картофель',
        seedingRate: {type: 'seeds', value: 3000, unit: 'кг/га', note: 'Ранний красный сорт'},
        growingDays: 70,
        yieldPotential: {min: 350, max: 450, unit: 'ц/га'}
    },

    // Сорта моркови
    {
        id: 'var-5-1',
        name: 'Нантская 4',
        cropId: 'crop-5',
        cropName: 'Морковь',
        seedingRate: {type: 'seeds', value: 5, unit: 'кг/га', note: 'Среднеспелый сорт'},
        growingDays: 80,
        yieldPotential: {min: 400, max: 600, unit: 'ц/га'}
    },
    {
        id: 'var-5-2',
        name: 'Лосиноостровская 13',
        cropId: 'crop-5',
        cropName: 'Морковь',
        seedingRate: {type: 'seeds', value: 7, unit: 'кг/га', note: 'Позднеспелый сорт'},
        growingDays: 110,
        yieldPotential: {min: 500, max: 700, unit: 'ц/га'}
    },
];