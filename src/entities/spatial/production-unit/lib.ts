// ==================== UTILITIES ====================

import {Capability, ProductionUnitType} from "@/entities/spatial";
import {UnitHierarchy} from "@/entities/spatial/production-unit/hierarchy.ts";

export const getUnitIcon = (type: ProductionUnitType): string => {
    const icons: Record<ProductionUnitType, string> = {
        FIELD: '🌾',
        PLOT: '🏡',
        BLOCK: '📐',
        BED: '📦',
        ROW: '📏',
        GREENHOUSE: '🌱',
        GREENHOUSE_ZONE: '🌿',
        CONTAINER: '📦',
        POT: '🍯',
        TRAY: '📎',
        NFT_CHANNEL: '💧',
        DWC_TANK: '🛢️',
        AEROPONIC_CHAMBER: '💨',
        RACK: '🗄️',
        SHELF: '📚',
        VERTICAL_TOWER: '🏗️',
        SLOT: '🔲',
        RESERVOIR: '💧',
        STORAGE: '🏚️'
    };
    return icons[type] || '📍';
};

export const getUnitTypeName = (type: ProductionUnitType): string => {
    const names: Record<ProductionUnitType, string> = {
        FIELD: 'Поле',
        PLOT: 'Участок',
        BLOCK: 'Блок',
        BED: 'Грядка',
        ROW: 'Ряд',
        GREENHOUSE: 'Теплица',
        GREENHOUSE_ZONE: 'Зона теплицы',
        CONTAINER: 'Контейнер',
        POT: 'Горшок',
        TRAY: 'Лоток',
        NFT_CHANNEL: 'NFT Канал',
        DWC_TANK: 'DWC Резервуар',
        AEROPONIC_CHAMBER: 'Аэропоника',
        RACK: 'Стеллаж',
        SHELF: 'Полка',
        VERTICAL_TOWER: 'Вертикальная башня',
        SLOT: 'Слот',
        RESERVOIR: 'Резервуар',
        STORAGE: 'Хранилище'
    };
    return names[type] || type;
};

export const getCapabilityIcon = (capability: Capability): string => {
    const icons: Record<Capability, string> = {
        SOIL: '🪴',
        IRRIGATION: '💧',
        FERTIGATION: '🧪',
        DRAINAGE: '🚰',
        HYDROPONIC: '💧',
        AEROPONIC: '💨',
        NUTRIENT_CONTROL: '⚗️',
        LIGHTING: '💡',
        CLIMATE_CONTROL: '🌡️',
        SENSOR_SUPPORT: '📡',
        AUTOMATION: '🤖',
        SLOT_BASED: '🔲',
        MOBILE: '🚚'
    };
    return icons[capability] || '🔧';
};

export const getCapabilityName = (capability: Capability): string => {
    const names: Record<Capability, string> = {
        SOIL: 'Грунт',
        IRRIGATION: 'Полив',
        FERTIGATION: 'Фертигация',
        DRAINAGE: 'Дренаж',
        HYDROPONIC: 'Гидропоника',
        AEROPONIC: 'Аэропоника',
        NUTRIENT_CONTROL: 'Контроль питания',
        LIGHTING: 'Досветка',
        CLIMATE_CONTROL: 'Климат-контроль',
        SENSOR_SUPPORT: 'Датчики',
        AUTOMATION: 'Автоматизация',
        SLOT_BASED: 'Слотовая система',
        MOBILE: 'Мобильный'
    };
    return names[capability] || capability;
};
export const getAvailableChildTypes = (parentType?: ProductionUnitType): ProductionUnitType[] => {
    if (!parentType) {
        return ['FIELD', 'PLOT', 'GREENHOUSE', 'CONTAINER', 'STORAGE'];
    }

    return UnitHierarchy[parentType] || [];
};

export const getAvailableCapabilities = (type: ProductionUnitType): string[] => {
    const capabilities: Record<ProductionUnitType, string[]> = {
        // Полевые типы
        FIELD: ['SOIL', 'IRRIGATION', 'FERTIGATION', 'DRAINAGE', 'SENSOR_SUPPORT'],
        PLOT: [
            'SOIL', 'IRRIGATION', 'FERTIGATION', 'DRAINAGE',  // Полевые
            'HYDROPONIC', 'AEROPONIC',                        // Гидропонные
            'SENSOR_SUPPORT', 'AUTOMATION'                    // IoT
        ],
        BLOCK: ['SOIL', 'IRRIGATION', 'SENSOR_SUPPORT'],
        BED: ['SOIL', 'IRRIGATION'],
        ROW: ['SOIL', 'IRRIGATION'],

        // Тепличные типы
        GREENHOUSE: ['HYDROPONIC', 'CLIMATE_CONTROL', 'LIGHTING', 'SENSOR_SUPPORT', 'AUTOMATION'],
        GREENHOUSE_ZONE: ['HYDROPONIC', 'LIGHTING', 'SENSOR_SUPPORT'],

        // Контейнерные типы
        CONTAINER: ['AEROPONIC', 'CLIMATE_CONTROL', 'LIGHTING', 'AUTOMATION', 'SENSOR_SUPPORT'],
        RACK: ['AEROPONIC', 'LIGHTING', 'SLOT_BASED'],
        SHELF: ['AEROPONIC', 'LIGHTING'],
        VERTICAL_TOWER: ['AEROPONIC', 'LIGHTING', 'SLOT_BASED'],
        SLOT: ['AEROPONIC'],
        POT: ['SOIL'],
        TRAY: ['SOIL'],

        // Гидропонные
        NFT_CHANNEL: ['HYDROPONIC'],
        DWC_TANK: ['HYDROPONIC'],
        AEROPONIC_CHAMBER: ['AEROPONIC'],

        // Служебные
        RESERVOIR: ['IRRIGATION'],
        STORAGE: []
    };

    return capabilities[type] || [];
};
