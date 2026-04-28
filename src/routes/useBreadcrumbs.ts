import { useMatches } from 'react-router-dom';
import { BreadcrumbItem } from './types';

const routeLabels: Record<string, string> = {
    dashboard: 'Дашборд',
    crop: 'Культуры',
    types: 'Типы культур',
    varieties: 'Сорта',
    plans: 'Планы выращивания',
    growing: 'Выращивание',
    seasons: 'Сезоны',
    areas: 'Места выращивания',
    cycles: 'Циклы',
    configure: 'Настройка',
    profile: 'Профиль',
    settings: 'Настройки',
};

export const useBreadcrumbs = (): BreadcrumbItem[] => {
    const matches = useMatches();

    const breadcrumbs: BreadcrumbItem[] = matches
        .filter((match) => match.pathname !== '/')
        .map((match) => {
            const path = match.pathname;
            const pathSegments = path.split('/').filter(Boolean);
            const lastSegment = pathSegments[pathSegments.length - 1];

            let title = routeLabels[lastSegment] || lastSegment;

            // Обработка динамических параметров (id)
            if (title?.startsWith(':')) {
                title = 'Детали';
            }

            return {
                title: title.charAt(0).toUpperCase() + title.slice(1),
                path,
                isActive: false,
            };
        });

    // Помечаем последний элемент как активный
    if (breadcrumbs.length > 0) {
        breadcrumbs[breadcrumbs.length - 1].isActive = true;
    }

    return breadcrumbs;
};