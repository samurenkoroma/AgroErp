import {FarmObject} from "@/entities/object";

export const farmLib = {


    getLocation(): [number, number] {
        return [30.042502443243485, 45.9098828805537]
    },


    getObjectTypeLabel(type: FarmObject['type']): string {
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
    getStatusLabel(status: FarmObject['status']): string {
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





