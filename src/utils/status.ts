export const statusLib = {
    getColor(status: string) {
        const colors = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            free: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            empty: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
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
            preparation: 'Подготовка',
            empty: 'Пусто'
        };
        return texts[status as keyof typeof texts] || status;
    },
}
