export const propsLib = {
    getText(props: string) {
        const texts = {
            length: 'Длина',
            width: 'Ширина',
            volume: 'Объем',
            cellCount: 'Ячеек',
            growing: 'Растет',
            harvested: 'Собрано',
            fallow: 'Пар',
            preparation: 'Подготовка',
            empty: 'Пусто'
        };
        return texts[props as keyof typeof texts] || props;
    },
}
