export const statusLib = {
    getColor(status: string) {
        const colors = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            free: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            sown: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            growing: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
            harvested: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            fallow: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return colors[status as keyof typeof colors] || colors.active;
    },

    getText(status: string) {
        const texts = {
            active: 'Активна',
            inactive: 'Неактивна',
            free: 'Свободно',
            sown: 'Засеяно',
            growing: 'Растет',
            harvested: 'Собрано',
            fallow: 'Пар',
        };
        return texts[status as keyof typeof texts] || status;
    },
    getBadge(status: string) {
        const badges = {
            active: {bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Активен'},
            completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Завершен'},
            cancelled: {bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Отменен'},
            in_progress:  {bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'В процессе'},
            planned:  {bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400',label: 'Запланирован'},
            draft:  {bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', label: 'Черновик'}
        }
        return badges[status as keyof typeof badges] || badges.active;
    },

    getProgressColor(progress: number) {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress >= 25) return 'bg-yellow-500';
        return 'bg-gray-500';
    }
}
