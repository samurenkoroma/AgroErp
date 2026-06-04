// src/features/production-units/hierarchy.ts

import {ProductionUnitType} from "@/entities/spatial";

/**
 * Допустимые родительско-дочерние отношения
 */

export const UnitHierarchy: Record<ProductionUnitType, ProductionUnitType[]> = {
    // Корневые элементы
    FIELD: ['BLOCK', 'BED', 'ROW'],
    PLOT: ['BLOCK', 'BED', 'ROW', 'GREENHOUSE', 'CONTAINER', 'NFT_CHANNEL', 'DWC_TANK', 'AEROPONIC_CHAMBER', 'RACK'],
    GREENHOUSE: ['GREENHOUSE_ZONE', 'BED', 'RACK'],
    CONTAINER: [ 'RACK', 'SHELF', 'POT', 'TRAY', 'RESERVOIR', 'DWC_TANK'],
    STORAGE: [],

    // Полевая иерархия
    BLOCK: ['BED', 'ROW'],
    BED: ['ROW'],
    ROW: [],

    // Тепличная иерархия
    GREENHOUSE_ZONE: ['BED', 'ROW'],

    // Контейнерная иерархия
    RACK: ['SHELF', 'SLOT', 'POT', 'TRAY'],
    SHELF: ['POT', 'TRAY'],
    VERTICAL_TOWER: ['SLOT'],

    // Терминальные элементы
    SLOT: [],
    POT: [],
    TRAY: [],

    // Гидропонные системы
    NFT_CHANNEL: [],
    DWC_TANK: ['SLOT'],
    AEROPONIC_CHAMBER: [],

    // Служебные
    RESERVOIR: []
};