import {Season} from "@/entities/season";
import baseLib from "@/utils/baseLib.ts";
import {format} from "date-fns";

export const seasonLib = {


    getStatusColor(status: Season["status"]) {
        switch (status) {
            case 'current':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'completed':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'planning':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    },

    getStatusText(type: Season["status"]) {
        switch (type) {
            case 'current':
                return 'Текущий';
            case 'planning':
                return 'Планирование';
            case 'completed':
                return 'Завершён'
            default:
                return '';
        }
    },

    getDateString(date: Date): string {
        return format(date, "yyyy-MM-dd");
    },

    isPlanning(season: Season): boolean {
        return season.status === 'planning'
    },

    New(): Season {
        const year = new Date().getFullYear();
        return {
            id: baseLib.genId(),
            name: `Сезон ${year}`,
            startDate: new Date(year, 0, 1),
            endDate: new Date(year, 11, 31),
            status: 'planning',
        };
    }
}