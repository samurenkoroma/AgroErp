// src/utils/status.ts
import {
    Play, Pause, CheckCircle, Calendar, Package, Archive, XCircle,
    Sprout, Leaf, Trees, Flower2, Apple, Droplets, Circle, TrendingUp, Wrench
} from 'lucide-react';
import { ReactNode } from 'react';

// ==================== ТИПЫ ====================

interface ConfigItem {
    bg: string;
    text: string;
    icon: ReactNode;
    label: string;
    emoji: string;
    order: number; // Порядок для сортировки
}

// ==================== СТАТУСЫ (Statuses) ====================

export const statusConfig: Record<string, ConfigItem> = {
    // Новые статусы
    empty: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-500 dark:text-gray-400',
        icon: <Circle className="w-3 h-3" />,
        label: 'Свободно',
        emoji: '◻️',
        order: 0
    },
    preparation: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        icon: <Wrench className="w-3 h-3" />,
        label: 'Подготовка',
        emoji: '🔧',
        order: 1
    },
    planned: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-600 dark:text-gray-400',
        icon: <Calendar className="w-3 h-3" />,
        label: 'Запланирован',
        emoji: '📋',
        order: 2
    },
    active: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        icon: <Play className="w-3 h-3" />,
        label: 'Активен',
        emoji: '▶️',
        order: 3
    },
    growing: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        icon: <TrendingUp className="w-3 h-3" />,
        label: 'Растет',
        emoji: '📈',
        order: 4
    },
    paused: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        icon: <Pause className="w-3 h-3" />,
        label: 'Приостановлен',
        emoji: '⏸️',
        order: 5
    },
    harvesting: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: <Package className="w-3 h-3" />,
        label: 'Сбор урожая',
        emoji: '📦',
        order: 6
    },
    completed: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Завершен',
        emoji: '✅',
        order: 7
    },
    failed: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        icon: <XCircle className="w-3 h-3" />,
        label: 'Неудача',
        emoji: '❌',
        order: 8
    },
    archived: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-500 dark:text-gray-400',
        icon: <Archive className="w-3 h-3" />,
        label: 'Архивирован',
        emoji: '📁',
        order: 9
    }
};

// ==================== СТАДИИ РАЗВИТИЯ (Stages) ====================

export const stageConfig: Record<string, ConfigItem> = {
    planning: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-600 dark:text-gray-400',
        icon: <Calendar className="w-4 h-4" />,
        label: 'Планирование',
        emoji: '📋',
        order: 1
    },
    germination: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: <Sprout className="w-4 h-4" />,
        label: 'Прорастание',
        emoji: '🌱',
        order: 2
    },
    seedling: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        icon: <Sprout className="w-4 h-4" />,
        label: 'Рассада',
        emoji: '🌿',
        order: 3
    },
    vegetative: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        icon: <Trees className="w-4 h-4" />,
        label: 'Вегетация',
        emoji: '🌳',
        order: 4
    },
    flowering: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        icon: <Flower2 className="w-4 h-4" />,
        label: 'Цветение',
        emoji: '🌸',
        order: 5
    },
    fruiting: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-400',
        icon: <Apple className="w-4 h-4" />,
        label: 'Плодоношение',
        emoji: '🍎',
        order: 6
    },
    harvesting: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        icon: <Package className="w-4 h-4" />,
        label: 'Сбор урожая',
        emoji: '📦',
        order: 7
    },
    completed: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Завершено',
        emoji: '✅',
        order: 8
    }
};

// ==================== МЕТОДЫ ВЫРАЩИВАНИЯ (Methods) ====================

export const methodConfig: Record<string, ConfigItem> = {
    seedling: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        icon: <Sprout className="w-4 h-4" />,
        label: 'Рассадный',
        emoji: '🌱',
        order: 1
    },
    direct_sow: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        icon: <Leaf className="w-4 h-4" />,
        label: 'Прямой посев',
        emoji: '🌾',
        order: 2
    },
    hydroponic: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: <Droplets className="w-4 h-4" />,
        label: 'Гидропоника',
        emoji: '💧',
        order: 3
    }
};

// ==================== ОБЩИЕ ФУНКЦИИ ====================

export const getConfig = (type: 'status' | 'stage' | 'method', key: string): ConfigItem => {
    const configs = {
        status: statusConfig,
        stage: stageConfig,
        method: methodConfig
    };
    const defaultConfigs = {
        status: statusConfig.planned,
        stage: stageConfig.planning,
        method: methodConfig.seedling
    };
    return configs[type][key] || defaultConfigs[type];
};

export const getLabel = (type: 'status' | 'stage' | 'method', key: string): string => {
    return getConfig(type, key).label;
};

export const getEmoji = (type: 'status' | 'stage' | 'method', key: string): string => {
    return getConfig(type, key).emoji;
};

export const getIcon = (type: 'status' | 'stage' | 'method', key: string): ReactNode => {
    return getConfig(type, key).icon;
};

export const getBgColor = (type: 'status' | 'stage' | 'method', key: string): string => {
    return getConfig(type, key).bg;
};

export const getTextColor = (type: 'status' | 'stage' | 'method', key: string): string => {
    return getConfig(type, key).text;
};

// ==================== ОПЦИИ ДЛЯ SELECT ====================

export const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
    value,
    label: config.label,
    emoji: config.emoji
}));

export const stageOptions = Object.entries(stageConfig).map(([value, config]) => ({
    value,
    label: config.label,
    emoji: config.emoji
}));

export const methodOptions = Object.entries(methodConfig).map(([value, config]) => ({
    value,
    label: config.label,
    emoji: config.emoji
}));

// ==================== КОМПОНЕНТЫ БЕЙДЖЕЙ ====================

interface BadgeProps {
    type: 'status' | 'stage' | 'method';
    value: string;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    showEmoji?: boolean;
}

const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
};

const emojiSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
};

const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
};

export const Badge = ({ type, value, size = 'sm', showIcon = false, showEmoji = true }: BadgeProps) => {
    const config = getConfig(type, value);

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size]}`}>
      {showEmoji && <span className={emojiSizeClasses[size]}>{config.emoji}</span>}
            {showIcon && !showEmoji && <span className={iconSizeClasses[size]}>{config.icon}</span>}
            {config.label}
    </span>
    );
};

// Компоненты-обертки
export const StatusBadge = ({
                                status,
                                size = 'sm',
                                showIcon = false,
                                showEmoji = true
                            }: {
    status: string;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    showEmoji?: boolean;
}) => (
    <Badge type="status" value={status} size={size} showIcon={showIcon} showEmoji={showEmoji} />
);

export const StageBadge = ({
                               stage,
                               size = 'sm',
                               showIcon = false,
                               showEmoji = true
                           }: {
    stage: string;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    showEmoji?: boolean;
}) => (
    <Badge type="stage" value={stage} size={size} showIcon={showIcon} showEmoji={showEmoji} />
);

export const MethodBadge = ({
                                method,
                                size = 'sm',
                                showIcon = false,
                                showEmoji = true
                            }: {
    method: string;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    showEmoji?: boolean;
}) => (
    <Badge type="method" value={method} size={size} showIcon={showIcon} showEmoji={showEmoji} />
);

// ==================== ХЕЛПЕР ====================

export const getOptionHelpers = () => ({
    statuses: statusConfig,
    stages: stageConfig,
    methods: methodConfig,
    statusOptions,
    stageOptions,
    methodOptions,
    getConfig,
    getLabel,
    getEmoji,
    getIcon,
    getBgColor,
    getTextColor,
    StatusBadge,
    StageBadge,
    MethodBadge
});


// ==================== ДЕФОЛТНЫЕ ЗНАЧЕНИЯ (FALLBACK) ====================

export const getStatusEmoji = (value: string): string => {
    const emojis: Record<string, string> = {
        planned: '📋',
        active: '▶️',
        paused: '⏸️',
        harvesting: '📦',
        completed: '✅',
        failed: '❌',
        archived: '📁',
        empty:  '◻️'

    };
    return emojis[value] || '📌';
};

export const getStageEmoji = (value: string): string => {
    const emojis: Record<string, string> = {
        planning: '📋',
        germination: '🌱',
        seedling: '🌿',
        vegetative: '🌳',
        flowering: '🌸',
        fruiting: '🍎',
        harvesting: '📦',
        completed: '✅'
    };
    return emojis[value] || '🌱';
};

export const getMethodEmoji = (value: string): string => {
    const emojis: Record<string, string> = {
        seedling: '🌱',
        direct_sow: '🌾',
        hydroponic: '💧'
    };
    return emojis[value] || '🌱';
};

// ==================== ЦВЕТА ДЛЯ СТАТУСОВ ====================

export const getStatusBgColor = (status: string): string => {
    const colors: Record<string, string> = {
        planned: 'bg-gray-100 dark:bg-gray-800',
        active: 'bg-green-100 dark:bg-green-900/30',
        paused: 'bg-yellow-100 dark:bg-yellow-900/30',
        harvesting: 'bg-blue-100 dark:bg-blue-900/30',
        completed: 'bg-green-100 dark:bg-green-900/30',
        failed: 'bg-red-100 dark:bg-red-900/30',
        archived: 'bg-gray-100 dark:bg-gray-800',
        empty:   'bg-gray-100 dark:bg-gray-800',

    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-800';
};

export const getStatusTextColor = (status: string): string => {
    const colors: Record<string, string> = {
        planned: 'text-gray-600 dark:text-gray-400',
        active: 'text-green-700 dark:text-green-400',
        paused: 'text-yellow-700 dark:text-yellow-400',
        harvesting: 'text-blue-700 dark:text-blue-400',
        completed: 'text-green-700 dark:text-green-400',
        failed: 'text-red-700 dark:text-red-400',
        archived: 'text-gray-500 dark:text-gray-400',
        empty:  'text-gray-500 dark:text-gray-400',
    };
    return colors[status] || 'text-gray-600 dark:text-gray-400';
};

export const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
        planned: <Calendar className="w-3 h-3"/>,
        active: <Play className="w-3 h-3"/>,
        paused: <Pause className="w-3 h-3"/>,
        harvesting: <Package className="w-3 h-3"/>,
        completed: <CheckCircle className="w-3 h-3"/>,
        failed: <XCircle className="w-3 h-3"/>,
        archived: <Archive className="w-3 h-3"/>
    };
    return icons[status] || <Calendar className="w-3 h-3"/>;
};

// ==================== ЦВЕТА ДЛЯ СТАДИЙ ====================

export const getStageBgColor = (stage: string): string => {
    const colors: Record<string, string> = {
        planning: 'bg-gray-100 dark:bg-gray-800',
        germination: 'bg-blue-100 dark:bg-blue-900/30',
        seedling: 'bg-green-100 dark:bg-green-900/30',
        vegetative: 'bg-emerald-100 dark:bg-emerald-900/30',
        flowering: 'bg-purple-100 dark:bg-purple-900/30',
        fruiting: 'bg-orange-100 dark:bg-orange-900/30',
        harvesting: 'bg-amber-100 dark:bg-amber-900/30',
        completed: 'bg-green-100 dark:bg-green-900/30'
    };
    return colors[stage] || 'bg-gray-100 dark:bg-gray-800';
};

export const getStageTextColor = (stage: string): string => {
    const colors: Record<string, string> = {
        planning: 'text-gray-600 dark:text-gray-400',
        germination: 'text-blue-700 dark:text-blue-400',
        seedling: 'text-green-700 dark:text-green-400',
        vegetative: 'text-emerald-700 dark:text-emerald-400',
        flowering: 'text-purple-700 dark:text-purple-400',
        fruiting: 'text-orange-700 dark:text-orange-400',
        harvesting: 'text-amber-700 dark:text-amber-400',
        completed: 'text-green-700 dark:text-green-400'
    };
    return colors[stage] || 'text-gray-600 dark:text-gray-400';
};

export const getStageIcon = (stage: string) => {
    const icons: Record<string, JSX.Element> = {
        planning: <Calendar className="w-4 h-4"/>,
        germination: <Sprout className="w-4 h-4"/>,
        seedling: <Sprout className="w-4 h-4"/>,
        vegetative: <Trees className="w-4 h-4"/>,
        flowering: <Flower2 className="w-4 h-4"/>,
        fruiting: <Apple className="w-4 h-4"/>,
        harvesting: <Package className="w-4 h-4"/>,
        completed: <CheckCircle className="w-4 h-4"/>
    };
    return icons[stage] || <Calendar className="w-4 h-4"/>;
};

// ==================== ЦВЕТА ДЛЯ МЕТОДОВ ====================

export const getMethodBgColor = (method: string): string => {
    const colors: Record<string, string> = {
        seedling: 'bg-green-100 dark:bg-green-900/30',
        direct_sow: 'bg-emerald-100 dark:bg-emerald-900/30',
        hydroponic: 'bg-blue-100 dark:bg-blue-900/30'
    };
    return colors[method] || 'bg-gray-100 dark:bg-gray-800';
};

export const getMethodTextColor = (method: string): string => {
    const colors: Record<string, string> = {
        seedling: 'text-green-700 dark:text-green-400',
        direct_sow: 'text-emerald-700 dark:text-emerald-400',
        hydroponic: 'text-blue-700 dark:text-blue-400'
    };
    return colors[method] || 'text-gray-600 dark:text-gray-400';
};

export const getMethodIcon = (method: string) => {
    const icons: Record<string, JSX.Element> = {
        seedling: <Sprout className="w-4 h-4"/>,
        direct_sow: <Leaf className="w-4 h-4"/>,
        hydroponic: <Droplets className="w-4 h-4"/>
    };
    return icons[method] || <Sprout className="w-4 h-4"/>;
};