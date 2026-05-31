import {Capability, ProductionUnitType} from "@/entities/spatial";

export const ProductionUnitDescriptions: Record<ProductionUnitType, {
    name: string;
    description: string;
    typicalDimensions: string;
    parentTypes: ProductionUnitType[];
    childTypes: ProductionUnitType[];
    capabilities: Capability[];
    icon: string;
    color: string;
}> = {
    FIELD: {
        name: 'Поле',
        description: 'Открытая сельскохозяйственная земля для выращивания зерновых, овощей, технических культур',
        typicalDimensions: 'от 1 до 1000+ га',
        parentTypes: [],
        childTypes: ['BLOCK', 'BED', 'ROW'],
        capabilities: ['SOIL', 'IRRIGATION', 'FERTIGATION', 'DRAINAGE', 'SENSOR_SUPPORT'],
        icon: '🌾',
        color: '#22c55e'
    },
    PLOT: {
        name: 'Участок',
        description: `Небольшой участок земли (приусадебный, дачный, фермерский). 
      Гибридный тип: может использоваться как открытый грунт, так и для установки 
      гидропонных/аэропонных систем, теплиц, контейнеров.
      
      Преимущества:
      • Можно выращивать в открытом грунте
      • Можно размещать мобильные теплицы
      • Можно устанавливать гидропонные системы (NFT, DWC)
      • Можно размещать контейнерные фермы
      • Подходит для вертикального выращивания`,
        typicalDimensions: '1 сотка (0.01 га) - 1 га',
        parentTypes: [],
        childTypes: ['BLOCK', 'BED', 'ROW', 'GREENHOUSE', 'CONTAINER', 'NFT_CHANNEL', 'DWC_TANK', 'AEROPONIC_CHAMBER', 'RACK'],
        capabilities: [
            'SOIL', 'IRRIGATION', 'FERTIGATION', 'DRAINAGE',  // Полевые возможности
            'HYDROPONIC', 'AEROPONIC',                         // Гидропонные возможности
            'SENSOR_SUPPORT', 'AUTOMATION'                     // IoT возможности
        ],
        icon: '🏡',
        color: '#f59e0b'  // Оранжевый цвет для участка
    },
    BLOCK: {
        name: 'Блок поля',
        description: 'Логический сегмент поля для организации севооборота или раздельного выращивания',
        typicalDimensions: '0.5-100 га',
        parentTypes: ['FIELD'],
        childTypes: ['BED', 'ROW'],
        capabilities: ['SOIL', 'IRRIGATION', 'SENSOR_SUPPORT'],
        icon: '📐',
        color: '#22c55e'
    },
    BED: {
        name: 'Грядка',
        description: 'Приподнятая или стационарная грядка для выращивания овощей, зелени',
        typicalDimensions: 'ширина 0.5-1.5м, длина 5-50м',
        parentTypes: ['FIELD', 'BLOCK', 'GREENHOUSE', 'GREENHOUSE_ZONE'],
        childTypes: [],
        capabilities: ['SOIL', 'IRRIGATION'],
        icon: '📦',
        color: '#22c55e'
    },
    ROW: {
        name: 'Ряд',
        description: 'Линейная посадка для пропашных культур (кукуруза, подсолнечник)',
        typicalDimensions: 'длина до 1000м, междурядье 0.5-0.7м',
        parentTypes: ['FIELD', 'BLOCK'],
        childTypes: [],
        capabilities: ['SOIL', 'IRRIGATION'],
        icon: '📏',
        color: '#22c55e'
    },
    GREENHOUSE: {
        name: 'Теплица',
        description: 'Защищенный грунт для круглогодичного выращивания',
        typicalDimensions: 'от 100 до 10000+ м²',
        parentTypes: [],
        childTypes: ['GREENHOUSE_ZONE', 'BED', 'RACK'],
        capabilities: ['HYDROPONIC', 'CLIMATE_CONTROL', 'LIGHTING', 'SENSOR_SUPPORT', 'AUTOMATION'],
        icon: '🌱',
        color: '#3b82f6'
    },
    GREENHOUSE_ZONE: {
        name: 'Зона теплицы',
        description: 'Секция теплицы с индивидуальными параметрами климата',
        typicalDimensions: '50-500 м²',
        parentTypes: ['GREENHOUSE'],
        childTypes: ['BED', 'ROW'],
        capabilities: ['HYDROPONIC', 'LIGHTING', 'SENSOR_SUPPORT'],
        icon: '🌿',
        color: '#3b82f6'
    },
    CONTAINER: {
        name: 'Контейнерная ферма',
        description: 'Модульная вертикальная ферма в контейнере',
        typicalDimensions: '20-40 футов (6-12м)',
        parentTypes: [],
        childTypes: ['RACK', 'SHELF', 'POT', 'TRAY'],
        capabilities: ['AEROPONIC', 'CLIMATE_CONTROL', 'LIGHTING', 'AUTOMATION', 'SENSOR_SUPPORT'],
        icon: '📦',
        color: '#8b5cf6'
    },
    RACK: {
        name: 'Стеллаж',
        description: 'Многоуровневая конструкция для вертикального выращивания',
        typicalDimensions: 'высота 2.2м, ширина 1.2м, глубина 0.8м',
        parentTypes: ['CONTAINER', 'GREENHOUSE'],
        childTypes: ['SLOT', 'POT', 'TRAY'],
        capabilities: ['AEROPONIC', 'LIGHTING', 'SLOT_BASED'],
        icon: '🗄️',
        color: '#8b5cf6'
    },
    SHELF: {
        name: 'Полка',
        description: 'Отдельный уровень стеллажа',
        typicalDimensions: 'высота 0.5м, площадь 1м²',
        parentTypes: ['RACK'],
        childTypes: ['POT', 'TRAY'],
        capabilities: ['AEROPONIC', 'LIGHTING'],
        icon: '📚',
        color: '#8b5cf6'
    },
    VERTICAL_TOWER: {
        name: 'Вертикальная башня',
        description: 'Специализированная вертикальная конструкция для аэропоники',
        typicalDimensions: 'высота 1.5-2.5м, диаметр 0.3-0.5м',
        parentTypes: ['CONTAINER', 'GREENHOUSE'],
        childTypes: ['SLOT'],
        capabilities: ['AEROPONIC', 'LIGHTING', 'SLOT_BASED'],
        icon: '🏗️',
        color: '#8b5cf6'
    },
    SLOT: {
        name: 'Слот',
        description: 'Минимальная единица для одного растения',
        typicalDimensions: '7×7см до 15×15см',
        parentTypes: ['RACK', 'SHELF', 'VERTICAL_TOWER'],
        childTypes: [],
        capabilities: ['AEROPONIC'],
        icon: '🔲',
        color: '#8b5cf6'
    },
    POT: {
        name: 'Горшок',
        description: 'Индивидуальная емкость для растения',
        typicalDimensions: 'объем 1-50л, диаметр 10-40см',
        parentTypes: ['RACK', 'SHELF', 'CONTAINER'],
        childTypes: [],
        capabilities: ['SOIL'],
        icon: '🍯',
        color: '#8b5cf6'
    },
    TRAY: {
        name: 'Лоток',
        description: 'Плоская емкость для множества растений',
        typicalDimensions: '54×28см, 72-128 ячеек',
        parentTypes: ['RACK', 'SHELF', 'CONTAINER'],
        childTypes: [],
        capabilities: ['SOIL'],
        icon: '📎',
        color: '#8b5cf6'
    },
    NFT_CHANNEL: {
        name: 'NFT канал',
        description: 'Канал с питательным раствором для гидропоники',
        typicalDimensions: 'ширина 10-15см, длина до 20м',
        parentTypes: ['GREENHOUSE'],
        childTypes: [],
        capabilities: ['HYDROPONIC'],
        icon: '💧',
        color: '#3b82f6'
    },
    DWC_TANK: {
        name: 'DWC бак',
        description: 'Бак с питательным раствором для глубоководной культуры',
        typicalDimensions: 'объем 500-2000л',
        parentTypes: ['GREENHOUSE'],
        childTypes: [],
        capabilities: ['HYDROPONIC'],
        icon: '🛢️',
        color: '#3b82f6'
    },
    AEROPONIC_CHAMBER: {
        name: 'Аэропонная камера',
        description: 'Герметичная камера с туманом питательного раствора',
        typicalDimensions: 'объем 1-5м³',
        parentTypes: ['CONTAINER', 'GREENHOUSE'],
        childTypes: [],
        capabilities: ['AEROPONIC'],
        icon: '💨',
        color: '#8b5cf6'
    },
    RESERVOIR: {
        name: 'Резервуар',
        description: 'Емкость для воды или питательного раствора',
        typicalDimensions: 'объем 200-5000л',
        parentTypes: ['GREENHOUSE', 'CONTAINER'],
        childTypes: [],
        capabilities: ['IRRIGATION'],
        icon: '💧',
        color: '#3b82f6'
    },
    STORAGE: {
        name: 'Хранилище',
        description: 'Помещение для хранения урожая или инвентаря',
        typicalDimensions: 'площадь 50-500м²',
        parentTypes: [],
        childTypes: [],
        capabilities: [],
        icon: '🏚️',
        color: '#6b7280'
    }
};