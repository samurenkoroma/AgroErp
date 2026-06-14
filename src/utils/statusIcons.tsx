// src/utils/stageIcons.ts

import {AlertCircle, CheckCircle, Clock, Play} from "lucide-react";
import {statusLib} from "@/utils/status.ts";
import {GrowingListItem} from "@/entities/production/growing-cycle";
import {getStageConfig} from "@/utils/stageIcons.tsx";

export const statusConfig: Record<string, {
    bg: string;
    icon: any;
    text: string;
    label: string;
}> = {
    planned: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-600 dark:text-gray-400',
        icon: <Clock className="w-3 h-3"/>,
        label: statusLib.getText('planned')
    },
    active: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        icon: <Play className="w-3 h-3"/>,
        label: statusLib.getText('active')
    },
    warning: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        icon: <AlertCircle className="w-3 h-3"/>,
        label: statusLib.getText('warning')
    },
    completed: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: <CheckCircle className="w-3 h-3"/>,
        label: statusLib.getText('completed')
    }

};

// Получить конфигурацию стадии
export const getStatusConfig = (stage: string) => {
    return statusConfig[stage] || statusConfig.planning;
};

// Получить emoji иконку стадии
export const getStatusIcon = (status: string): string => {
    return getStatusConfig(status).icon;
};

// Получить цвет стадии
export const getStatus = (status: string): string => {
    return getStageConfig(status).color;
};

// Компонент бейджа стадии
export const StatusBadge = ({status}: { status: GrowingListItem['status'] }) => {
    const config = {
        planned: {
            bg: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-600 dark:text-gray-400',
            icon: <Clock className="w-3 h-3"/>,
            label: statusLib.getText('planned')
        },
        active: {
            bg: 'bg-green-100 dark:bg-green-900/30',
            text: 'text-green-700 dark:text-green-400',
            icon: <Play className="w-3 h-3"/>,
            label: statusLib.getText('active')
        },
        warning: {
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            text: 'text-yellow-700 dark:text-yellow-400',
            icon: <AlertCircle className="w-3 h-3"/>,
            label: statusLib.getText('warning')
        },
        completed: {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-700 dark:text-blue-400',
            icon: <CheckCircle className="w-3 h-3"/>,
            label: statusLib.getText('completed')
        }
    };
    console.log(status)
    const style = config[status];

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
            {style.label}
    </span>
    );
};

// Компонент иконки стадии (только emoji)
export const StatusIcon = ({status, size = 'md'}: { status: string; size?: 'sm' | 'md' | 'lg' }) => {
    const config = getStatusConfig(status);
    const sizeClasses = {
        sm: 'text-base',
        md: 'text-xl',
        lg: 'text-2xl'
    };

    return <span className={sizeClasses[size]}>{config.icon}</span>;
};
export const getStatusLabel = (statusKey: string): string => {
    const labels: Record<string, string> = {
        planning: 'Планирование',
        germination: 'Прорастание',
        seedling: 'Рассада',
        vegetative: 'Вегетация',
        flowering: 'Цветение',
        fruiting: 'Плодоношение',
        harvesting: 'Сбор урожая',
        completed: 'Завершен'
    };
    return labels[statusKey] || statusKey;
};