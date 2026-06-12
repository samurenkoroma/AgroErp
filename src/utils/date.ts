import {format} from "date-fns";

export const dateLib = {
    format(dateStr?: string): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru');
    },
    getDateString(date: Date): string {
        return format(date, "yyyy-MM-dd");
    },
}
