import {format} from "date-fns";

export const dateLib = {
    format(dateStr?: Date) {
        if (!dateStr) return '—';
        return dateStr.toLocaleDateString('ru');
    },
    getDateString(date: Date): string {
        return format(date, "yyyy-MM-dd");
    },
}
