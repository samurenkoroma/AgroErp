// src/features/production-units/examples.ts

export const TypicalConfigurations = {
    // Традиционное полевое хозяйство
    traditionalFarm: {
        root: 'FIELD',
        structure: [
            'FIELD → BLOCK → BED',  // Поле → Блок → Грядка
            'FIELD → ROW'           // Поле → Ряд
        ]
    },

    // Тепличное хозяйство
    greenhouseFarm: {
        root: 'GREENHOUSE',
        structure: [
            'GREENHOUSE → GREENHOUSE_ZONE → BED',  // Теплица → Зона → Грядка
            'GREENHOUSE → RACK → SLOT'             // Теплица → Стеллаж → Слот
        ]
    },

    // Вертикальная ферма
    verticalFarm: {
        root: 'CONTAINER',
        structure: [
            'CONTAINER → RACK → SLOT',      // Контейнер → Стеллаж → Слот
            'CONTAINER → VERTICAL_TOWER → SLOT',  // Контейнер → Башня → Слот
            'CONTAINER → SHELF → POT'       // Контейнер → Полка → Горшок
        ]
    },

    // Гидропонная система
    hydroponicSystem: {
        root: 'GREENHOUSE',
        structure: [
            'GREENHOUSE → NFT_CHANNEL',      // Теплица → NFT канал
            'GREENHOUSE → DWC_TANK',         // Теплица → DWC бак
            'GREENHOUSE → AEROPONIC_CHAMBER' // Теплица → Аэропоника
        ]
    }
};