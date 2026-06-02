// src/features/growing-cycle/mock-data.ts

import {Allocation, GrowingCycle, HarvestBatch, Planting} from "@/entities/production";
import {ProductionUnit} from "@/entities/spatial";

export const mockCycles: GrowingCycle[] = [
    {
        id: 'cycle-1',
        name: 'Томаты весенние 2025',
        code: 'TOM-001',
        cropId: 'crop-1',
        cropName: 'Томат',
        varietyId: 'var-1',
        varietyName: 'Бычье сердце',
        method: 'seedling',
        status: 'active',
        expectedHarvestAt: '2025-07-20T00:00:00Z',
        createdAt: '2025-03-15T10:00:00Z',
        updatedAt: '2025-05-01T10:00:00Z'
    },
    {
        id: 'cycle-2',
        name: 'Огурцы летние 2025',
        code: 'OGU-001',
        cropId: 'crop-2',
        cropName: 'Огурец',
        varietyId: 'var-3',
        varietyName: 'Герман F1',
        method: 'seedling',
        status: 'active',
        expectedHarvestAt: '2025-08-15T00:00:00Z',
        createdAt: '2025-04-01T10:00:00Z',
        updatedAt: '2025-05-01T10:00:00Z'
    },
    {
        id: 'cycle-3',
        name: 'Перец сладкий 2025',
        code: 'PER-001',
        cropId: 'crop-3',
        cropName: 'Перец сладкий',
        method: 'seedling',
        status: 'planned',
        expectedHarvestAt: '2025-09-01T00:00:00Z',
        createdAt: '2025-04-15T10:00:00Z',
        updatedAt: '2025-04-15T10:00:00Z'
    }
];

export const mockAllocations: Allocation[] = [
    {
        id: 'alloc-1',
        cycleId: 'cycle-1',
        productionUnitId: 'greenhouse-1',
        productionUnitName: 'Теплица №1',
        productionUnitType: 'GREENHOUSE',
        area: 0.05,
        startedAt: '2025-04-20T00:00:00Z',
        createdAt: '2025-04-15T10:00:00Z',
        updatedAt: '2025-04-20T10:00:00Z'
    },
    {
        id: 'alloc-2',
        cycleId: 'cycle-1',
        productionUnitId: 'field-1',
        productionUnitName: 'Поле Северное',
        productionUnitType: 'FIELD',
        area: 0.5,
        startedAt: '2025-05-01T00:00:00Z',
        createdAt: '2025-04-25T10:00:00Z',
        updatedAt: '2025-05-01T10:00:00Z'
    }
];

export const mockPlantings: Planting[] = [
    {
        id: 'plant-1',
        cycleId: 'cycle-1',
        plantedAt: '2025-04-20T00:00:00Z',
        quantity: 5000,
        createdAt: '2025-04-18T10:00:00Z',
        updatedAt: '2025-04-20T10:00:00Z'
    }
];

export const mockHarvests: HarvestBatch[] = [
    {
        id: 'harvest-1',
        cycleId: 'cycle-1',
        harvestedAt: '2025-06-15T00:00:00Z',
        quantity: 850,
        createdAt: '2025-06-15T10:00:00Z',
        updatedAt: '2025-06-15T10:00:00Z'
    },
    {
        id: 'harvest-2',
        cycleId: 'cycle-1',
        harvestedAt: '2025-06-25T00:00:00Z',
        quantity: 1200,
        createdAt: '2025-06-25T10:00:00Z',
        updatedAt: '2025-06-25T10:00:00Z'
    }
];

export const mockProductionUnits: Partial<ProductionUnit>[] = [
    {id: 'greenhouse-1', name: 'Теплица №1', type: 'GREENHOUSE', area: 0.05, status: 'active'},
    {id: 'greenhouse-2', name: 'Теплица №2', type: 'GREENHOUSE', area: 0.08, status: 'active'},
    {id: 'field-1', name: 'Поле Северное', type: 'FIELD', area: 50, status: 'active'},
    {id: 'field-2', name: 'Поле Восточное', type: 'FIELD', area: 75, status: 'active'},
    {id: 'plot-1', name: 'Участок Приусадебный', type: 'PLOT', area: 0.12, status: 'active'}
];