// src/features/crop-planning/components/CultivationPlanSelector.tsx
import {useState} from 'react';
import {Bug, Check, Droplets, FileText, FlaskConical, Scissors} from 'lucide-react';
import {useCultivationPlans} from '../hooks/useCultivationPlans';
import {CultivationPlan, CultivationStep} from '../../../entities/planning/types.ts';

interface CultivationPlanSelectorProps {
    cropId: string;
    selectedPlanId?: string;
    onSelect: (plan: CultivationPlan) => void;
}

const getStepIcon = (type: CultivationStep['type']) => {
    switch (type) {
        case 'watering':
            return <Droplets className="w-3 h-3"/>;
        case 'fertilizing':
            return <FlaskConical className="w-3 h-3"/>;
        case 'spraying':
            return <Bug className="w-3 h-3"/>;
        case 'harvesting':
            return <Scissors className="w-3 h-3"/>;
        default:
            return <FileText className="w-3 h-3"/>;
    }
};

const getTriggerText = (step: CultivationStep) => {
    switch (step.trigger.type) {
        case 'day_offset':
            return step.trigger.dayOffset === 0
                ? 'В день посадки'
                : step.trigger.dayOffset > 0
                    ? `Через ${step.trigger.dayOffset} дней после посадки`
                    : `За ${Math.abs(step.trigger.dayOffset)} дней до посадки`;
        case 'date':
            return step.trigger.date || 'В указанную дату';
        case 'bbch':
            return `Фаза ${step.trigger.stage}`;
        default:
            return '';
    }
};

export const CultivationPlanSelector = ({cropId, selectedPlanId, onSelect}: CultivationPlanSelectorProps) => {
    const [selectedId, setSelectedId] = useState(selectedPlanId);
    const {data: plans, isLoading} = useCultivationPlans(cropId);

    const handleSelect = (plan: CultivationPlan) => {
        setSelectedId(plan.id);
        onSelect(plan);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"/>
            </div>
        );
    }

    if (!plans?.length) {
        return (
            <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
                <p className="text-gray-500">Нет доступных шаблонов для этой культуры</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {plans.map((plan) => (
                <button
                    key={plan.id}
                    onClick={() => handleSelect(plan)}
                    className={`
            w-full p-4 rounded-lg border transition-all text-left
            ${selectedId === plan.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                    }
          `}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                            {plan.description && (
                                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {plan.steps.slice(0, 4).map((step, idx) => (
                                    <div key={idx}
                                         className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                        {getStepIcon(step.type)}
                                        <span>{getTriggerText(step)}</span>
                                    </div>
                                ))}
                                {plan.steps.length > 4 && (
                                    <span className="text-xs text-gray-400">+{plan.steps.length - 4} ещё</span>
                                )}
                            </div>
                        </div>
                        {selectedId === plan.id && (
                            <Check className="w-5 h-5 text-green-500 shrink-0"/>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
};