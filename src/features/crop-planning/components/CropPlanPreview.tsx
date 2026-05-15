// src/features/crop-planning/components/CropPlanPreview.tsx
import {useState} from 'react';
import {
    AlertCircle,
    Bug,
    Calendar,
    CheckCircle,
    Droplets,
    FileText,
    FlaskConical,
    Leaf,
    MapPin,
    Ruler,
    Scissors,
    Sprout
} from 'lucide-react';
import {getCropIcon} from '@/utils/cropIcons';
import {CultivationArea, CultivationPlan} from "@/entities/planning/types.ts";
import {Crop, Variety} from "@/entities/crop";
import {formatArea} from "@/utils/geometry.ts";

interface CropPlanPreviewProps {
    area: CultivationArea;
    crop: Crop;
    variety: Variety | null;
    cultivationPlan: CultivationPlan;
    startDate: string;
}

const getStepIcon = (type: string) => {
    switch (type) {
        case 'watering': return <Droplets className="w-4 h-4" />;
        case 'fertilizing': return <FlaskConical className="w-4 h-4" />;
        case 'spraying': return <Bug className="w-4 h-4" />;
        case 'harvesting': return <Scissors className="w-4 h-4" />;
        default: return <CheckCircle className="w-4 h-4" />;
    }
};

const getStepTypeText = (type: string) => {
    switch (type) {
        case 'watering': return 'Полив';
        case 'fertilizing': return 'Подкормка';
        case 'spraying': return 'Обработка';
        case 'harvesting': return 'Сбор урожая';
        default: return type;
    }
};

const getTriggerText = (trigger: any) => {
    switch (trigger.type) {
        case 'day_offset':
            if (trigger.dayOffset === 0) return 'В день посадки';
            if (trigger.dayOffset > 0) return `Через ${trigger.dayOffset} дней после посадки`;
            return `За ${Math.abs(trigger.dayOffset)} дней до посадки`;
        case 'date':
            return new Date(trigger.date).toLocaleDateString('ru');
        case 'bbch':
            return `Фаза ${trigger.stage}`;
        default:
            return '—';
    }
};

const getLocationTypeIcon = (type: string) => {
    switch (type) {
        case 'field': return '🌾';
        case 'greenhouse': return '🌱';
        case 'plot': return '📍';
        case 'bed': return '📦';
        default: return '📌';
    }
};

const getLocationTypeText = (type: string) => {
    switch (type) {
        case 'field': return 'Поле';
        case 'greenhouse': return 'Теплица';
        case 'plot': return 'Участок';
        case 'bed': return 'Грядка';
        default: return 'Место';
    }
};


export const CropPlanPreview = ({
                                    area,
                                    crop,
                                    variety,
                                    cultivationPlan,
                                    startDate,
                                }: CropPlanPreviewProps) => {
    const [expandedSteps, setExpandedSteps] = useState(false);
    const displaySteps = expandedSteps ? cultivationPlan.steps : cultivationPlan.steps.slice(0, 5);
    const hasMoreSteps = cultivationPlan.steps.length > 5;

    // Расчет предполагаемой даты сбора
    const estimatedHarvestDate = variety
        ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + variety.daysToMaturity))
        : null;

    // Расчет количества растений
    const calculatePlantsCount = () => {
        if (!variety) return null;

        const seedingRate = variety.seedingRates?.[
            area.type === 'field' ? 'open_ground' : 'greenhouse'
            ];

        if (!seedingRate) return null;

        const plantsPerM2 = 1 / (seedingRate.rowSpacing * seedingRate.plantSpacing);
        let areaM2 = area.area > 10000
            ? area.area * 10000
            : area.area;

        const totalPlants = plantsPerM2 * areaM2;
        const totalWithSafety = totalPlants * (seedingRate.safetyFactor || 1.1);

        if (totalWithSafety < 1000) {
            return `${Math.round(totalWithSafety)} шт`;
        }
        return `${(totalWithSafety / 1000).toFixed(1)} тыс. шт`;
    };

    return (
        <div className="space-y-6">

            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                {/* Место посадки */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            Место посадки
                        </h4>
                    </div>
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="text-3xl">{getLocationTypeIcon(area.type)}</div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <p className="font-medium text-gray-900 dark:text-white">{area.name}</p>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                    {getLocationTypeText(area.type)}
                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Ruler className="w-4 h-4" />
                                        <span>Площадь: {formatArea(area.area)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        <span>Начало: {new Date(startDate).toLocaleDateString('ru')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Культура и сорт */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sprout className="w-4 h-4 text-green-600" />
                            Культура и сорт
                        </h4>
                    </div>
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-3xl">{getCropIcon(crop.name)}</span>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">{crop.name}</p>
                                <p className="text-sm text-gray-500">{crop.category}</p>
                                {variety && (
                                    <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Leaf className="w-4 h-4 text-green-600" />
                                            <span className="font-medium text-gray-900 dark:text-white">{variety.name}</span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500">Созревание</p>
                                                <p className="font-medium">{variety.daysToMaturity} дней</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Урожайность</p>
                                                <p className="font-medium">{variety.yieldPotential} ц/га</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Высота</p>
                                                <p className="font-medium">{variety.plantHeight} м</p>
                                            </div>
                                            {calculatePlantsCount() && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Растений</p>
                                                    <p className="font-medium text-green-600">{calculatePlantsCount()}</p>
                                                </div>
                                            )}
                                        </div>
                                        {variety.description && (
                                            <p className="text-xs text-gray-400 mt-2">{variety.description}</p>
                                        )}
                                    </div>
                                )}
                                {!variety && (
                                    <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            Сорт не выбран
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* План работ (шаги) */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-green-600" />
                                План работ
                            </h4>
                            <span className="text-sm text-gray-500">
                {cultivationPlan.steps.length} этапов
              </span>
                        </div>
                    </div>
                    <div className="p-4">
                        {cultivationPlan.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                                {cultivationPlan.description}
                            </p>
                        )}

                        <div className="space-y-3">
                            {displaySteps.map((step, idx) => {
                                const stepDate = new Date(startDate);
                                if (step.trigger.type === 'day_offset' && step.trigger.dayOffset) {
                                    stepDate.setDate(stepDate.getDate() + step.trigger.dayOffset);
                                }

                                return (
                                    <div key={step.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {getStepIcon(step.type)}
                                                <span className="font-medium text-gray-900 dark:text-white">
                          {getStepTypeText(step.type)}
                        </span>
                                                <span className="text-xs text-gray-500 ml-auto">
                          {getTriggerText(step.trigger)}
                        </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {step.trigger.type === 'day_offset' && step.trigger.dayOffset !== undefined && (
                                                    step.trigger.dayOffset === 0
                                                        ? 'Выполняется в день посадки'
                                                        : step.trigger.dayOffset > 0
                                                            ? `Ориентировочная дата: ${stepDate.toLocaleDateString('ru')}`
                                                            : `Ориентировочная дата: ${stepDate.toLocaleDateString('ru')}`
                                                )}
                                                {step.trigger.type === 'date' && `Дата: ${new Date(step.trigger.date).toLocaleDateString('ru')}`}
                                                {step.trigger.type === 'bbch' && `Фаза развития: ${step.trigger.stage}`}
                                            </p>
                                            {step.params && Object.keys(step.params).length > 0 && (
                                                <div className="mt-2 text-xs text-gray-400">
                                                    {step.params.amount && <span>Объем: {step.params.amount}</span>}
                                                    {step.params.fertilizer && <span className="ml-2">Удобрение: {step.params.fertilizer}</span>}
                                                    {step.params.pesticide && <span className="ml-2">Препарат: {step.params.pesticide}</span>}
                                                    {step.params.method && <span className="ml-2">Метод: {step.params.method}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {hasMoreSteps && (
                                <button
                                    onClick={() => setExpandedSteps(!expandedSteps)}
                                    className="w-full text-center text-sm text-green-600 hover:text-green-700 py-2"
                                >
                                    {expandedSteps ? 'Свернуть' : `Показать еще ${cultivationPlan.steps.length - 5} этапов`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Сводка */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Ключевые даты
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-blue-700 dark:text-blue-400">Начало работ</p>
                            <p className="font-medium text-blue-900 dark:text-blue-200">
                                {new Date(startDate).toLocaleDateString('ru')}
                            </p>
                        </div>
                        {estimatedHarvestDate && (
                            <div>
                                <p className="text-blue-700 dark:text-blue-400">Плановый сбор</p>
                                <p className="font-medium text-blue-900 dark:text-blue-200">
                                    {estimatedHarvestDate.toLocaleDateString('ru')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};