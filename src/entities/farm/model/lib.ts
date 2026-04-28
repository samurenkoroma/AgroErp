import {Farm} from './types';
import {Field, Greenhouse, Plot} from "@/entities";

export const farmLib = {
    /**
     * Получить общую статистику по ферме
     */
    getStats(farm: Farm) {
        const sownArea = farm.fields
            .filter(f => f.status === 'sown' || f.status === 'growing')
            .reduce((sum, f) => sum + f.area, 0);

        const freeArea = farm.totalArea - sownArea;

        return {
            totalFields: farm.fields.length,
            sownArea: Number(sownArea.toFixed(1)),
            freeArea: Number(freeArea.toFixed(1)),
            greenhouseCount: farm.greenhouses.length,
            totalCropsPlanted: farm.fields.filter(f => f.plannedCrop).length,
            utilizationPercent: Math.round((sownArea / farm.totalArea) * 100),
        };
    },

    /**
     * Получить все поля с определённой культурой
     */
    getFieldsByCrop(farm: Farm, cropId: string): Field[] {
        return farm.fields.filter(field => field.plannedCrop?.id === cropId);
    },

    /**
     * Добавить новое поле (иммутабельно)
     */
    addField(farm: Farm, newField: Field): Farm {
        return {
            ...farm,
            fields: [...farm.fields, newField],
            totalArea: farm.totalArea + newField.area,
            updatedAt: new Date().toISOString(),
        };
    },

    /**
     * Проверить, есть ли свободные поля
     */
    hasFreeFields(farm: Farm): boolean {
        return farm.fields.some(f => f.status === 'free');
    },

    /**
     * Получить центр фермы (среднее по всем полям)
     */
    getCenter(farm: Farm): [number, number] {
        if (farm.fields.length === 0) return [farm.location.lng, farm.location.lat];

        const sumLng = farm.fields.reduce((sum, f) => sum + (f.center?.[0] || farm.location.lng), 0);
        const sumLat = farm.fields.reduce((sum, f) => sum + (f.center?.[1] || farm.location.lat), 0);

        return [sumLng / farm.fields.length, sumLat / farm.fields.length];
    },

    getLocation(farm?: Farm | null): [number, number] {
        // if (farm == null) {
            return [30.042502443243485, 45.9098828805537]
        // }
        // return [farm.location.lng, farm.location.lat]
    },


    getObjectTypeLabel(type: (Field | Greenhouse | Plot)['type']): string {
        const labels: Record<string, string> = {
            field: 'Поле',
            greenhouse: 'Теплица',
            plot: 'Участок',
            // warehouse: 'Склад',
            // equipment_shed: 'Ангар',
            // irrigation_system: 'Система орошения'
        };
        return labels[type];
    },
    getStatusLabel(status: (Field | Greenhouse | Plot)['status']): string {
        const labels = {
            active: 'Активен',
            inactive: 'Неактивен',
            archived: 'В архиве',
            free: "Свободен",
            sown: "Засеяно",
            growing: "Растет",
            harvested: "Убрано",
            fallow: "Под паром",
            maintenance: "Обслуживание",
        };
        return labels[status];
    }

};





