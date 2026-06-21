import {Metadata} from '@/entities/shared/types';

export interface Crop {
    id: string;
    name: string;
    imageUrl?: string;
    category: string;
    family: string;
    metadata: Metadata;
    agronomy: AgronomyProfile
}

// src/features/catalog/types.ts

export interface AgronomyProfile {
    thermalRequirements: {
        baseTemperature: number;
        upperTemperature: number;
        gddToHarvest: number;
    };
    tolerance: {
        temperatureMin: number;
        temperatureMax: number;
        humidityMin: number;
        humidityMax: number;
    };
    waterRequirement: {
        dailyNeedMin: number;
        dailyNeedOpt: number;
    };
    lightRequirement: {
        ppfdMin: number;
        ppfdOpt: number;
        dayLengthMin: number;
        dayLengthOpt: number;
        photoperiodType: 'short_day' | 'long_day' | 'day_neutral';
    };
    phenophaseGDD: Array<{
        code: string;
        name: string;
        gddRequired: number;
        description: string;
        isCritical: boolean;
    }>;
}






export const cropCategories = [
    {value: 'Овощные', label: 'Овощные', icon: '🍅'},
    {value: 'Зерновые', label: 'Зерновые', icon: '🌾'},
    {value: 'Бобовые', label: 'Бобовые', icon: '🫘'},
    {value: 'Технические', label: 'Технические', icon: '🌻'},
    {value: 'Зеленные', label: 'Зеленные', icon: '🥬'},
    {value: 'Пряные', label: 'Пряные', icon: '🌿'},
    {value: 'Ягодные', label: 'Ягодные', icon: '🍓'},
    {value: 'Плодовые', label: 'Плодовые', icon: '🍎'}
];

export const cropFamilies = [
    {value: 'solanaceae', label: 'Пасленовые (Solanaceae)', icon: '🍅'},      // Томат, Картофель, Перец, Баклажан
    {value: 'cucurbitaceae', label: 'Тыквенные (Cucurbitaceae)', icon: '🥒'}, // Огурец, Тыква, Кабачок, Арбуз, Дыня
    {value: 'brassicaceae', label: 'Капустные (Brassicaceae)', icon: '🥬'},   // Капуста, Редис, Репа, Хрен
    {value: 'apiaceae', label: 'Зонтичные (Apiaceae)', icon: '🥕'},            // Морковь, Сельдерей, Петрушка, Укроп
    // {value: 'liliaceae', label: 'Луковые (Liliaceae)', icon: '🧅'},            // Лук, Чеснок
    {value: 'amaryllidaceae', label: 'Амариллисовые (Amaryllidaceae)', icon: '🧅'}, // Лук, Чеснок (современная классификация)
    {value: 'fabaceae', label: 'Бобовые (Fabaceae)', icon: '🫘'},              // Горох, Фасоль, Бобы, Соя
    {value: 'poaceae', label: 'Злаковые (Poaceae)', icon: '🌾'},               // Пшеница, Рожь, Ячмень, Овес, Кукуруза
    {value: 'asteraceae', label: 'Астровые (Asteraceae)', icon: '🌻'},         // Подсолнечник, Салат, Топинамбур
    {value: 'rosaceae', label: 'Розовые (Rosaceae)', icon: '🍎'},              // Яблоня, Груша, Слива, Малина, Клубника
    {value: 'lamiaceae', label: 'Яснотковые (Lamiaceae)', icon: '🌿'},         // Базилик, Мята, Розмарин, Тимьян
    {value: 'chenopodiaceae', label: 'Маревые (Chenopodiaceae)', icon: '🍠'},  // Свекла, Шпинат, Мангольд ✅ ДОБАВЛЕНО
    {value: 'polygonaceae', label: 'Гречишные (Polygonaceae)', icon: '🌾'},    // Гречиха, Ревень, Щавель
    {value: 'convolvulaceae', label: 'Вьюнковые (Convolvulaceae)', icon: '🍠'}, // Батат
    {value: 'malvaceae', label: 'Мальвовые (Malvaceae)', icon: '🌿'},          // Бамия, Хлопчатник
    {value: 'poaceae', label: 'Злаковые (Poaceae)', icon: '🌾'},               // Рис, Просо
    {value: 'urticaceae', label: 'Крапивные (Urticaceae)', icon: '🌿'}         // Крапива (зеленые удобрения)
];
