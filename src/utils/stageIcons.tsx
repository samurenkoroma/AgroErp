// src/utils/stageIcons.ts

export const stageConfig: Record<string, { label: string; icon: string; color: string; bgColor: string; progress: number }> = {
    planning: {
        label: 'Планирование',
        icon: '📋',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        progress: 0
    },
    germination: {
        label: 'Прорастание',
        icon: '🌱',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        progress: 14
    },
    seedling: {
        label: 'Рассада',
        icon: '🌿',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        progress: 28
    },
    vegetative: {
        label: 'Вегетация',
        icon: '🌳',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        progress: 42
    },
    flowering: {
        label: 'Цветение',
        icon: '🌸',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        progress: 57
    },
    fruiting: {
        label: 'Плодоношение',
        icon: '🍎',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        progress: 71
    },
    harvesting: {
        label: 'Сбор урожая',
        icon: '📦',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        progress: 85
    },
    completed: {
        label: 'Завершен',
        icon: '✅',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        progress: 100
    }
};

// Получить конфигурацию стадии
export const getStageConfig = (stage: string) => {
    return stageConfig[stage] || stageConfig.planning;
};

// Получить emoji иконку стадии
export const getStageIcon = (stage: string): string => {
    return getStageConfig(stage).icon;
};

// Получить цвет стадии
export const getStageColor = (stage: string): string => {
    return getStageConfig(stage).color;
};

// Компонент бейджа стадии
export const StageBadge = ({ stage, size = 'sm' }: { stage: string; size?: 'sm' | 'md' | 'lg' }) => {
    const config = getStageConfig(stage);
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base'
    };

    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses[size]}`}>
      <span>{config.icon}</span>
            {config.label}
    </span>
    );
};

// Компонент иконки стадии (только emoji)
export const StageIcon = ({ stage, size = 'md' }: { stage: string; size?: 'sm' | 'md' | 'lg' }) => {
    const config = getStageConfig(stage);
    const sizeClasses = {
        sm: 'text-base',
        md: 'text-xl',
        lg: 'text-2xl'
    };

    return <span className={sizeClasses[size]}>{config.icon}</span>;
};