// src/features/crop-planning/components/PhenologyDashboard.tsx
import {AlertCircle, Calendar, Clock, Leaf} from 'lucide-react';
import {CurrentPhenology, RecommendedAction} from '../../../entities/planning/types.ts';

interface PhenologyDashboardProps {
    phenology: CurrentPhenology;
}

const getPriorityColor = (priority: RecommendedAction['priority']) => {
    switch (priority) {
        case 'urgent':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'high':
            return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        case 'medium':
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'low':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
};

export const PhenologyDashboard = ({phenology}: PhenologyDashboardProps) => {
    const isCritical = phenology.isCritical;

    return (
        <div className="space-y-6">
            {/* GDD Progress */}
            <div
                className={`rounded-xl p-5 ${isCritical ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'}`}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Leaf className="w-5 h-5 text-green-600"/>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Текущая фаза: {phenology.currentPhaseName}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {phenology.currentPhaseCode} • {phenology.progressPercent}% к следующей фазе
                        </p>
                    </div>
                    {phenology.deviationDays !== 0 && (
                        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                            <AlertCircle className="w-4 h-4"/>
                            <span className="text-sm font-medium">Отклонение {phenology.deviationDays} дн.</span>
                        </div>
                    )}
                </div>

                {/* GDD Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span>Накопленная GDD</span>
                        <span>{phenology.accumulatedGDD} / {phenology.requiredGDDForNext} °C·дн</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{width: `${phenology.progressPercent}%`}}
                        />
                    </div>
                </div>

                {/* Forecast */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500"/>
                        <div>
                            <p className="text-xs text-gray-500">До следующей фазы</p>
                            <p className="text-sm font-semibold">{phenology.estimatedDaysToNextPhase} дней</p>
                        </div>
                    </div>
                    {phenology.estimatedHarvestDate && (
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500"/>
                            <div>
                                <p className="text-xs text-gray-500">Прогноз сбора</p>
                                <p className="text-sm font-semibold">{new Date(phenology.estimatedHarvestDate).toLocaleDateString('ru')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recommended Actions */}
            {phenology.recommendedActions.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-500"/>
                        Рекомендуемые действия
                    </h3>
                    <div className="space-y-2">
                        {phenology.recommendedActions.map((action, idx) => (
                            <div key={idx}
                                 className={`flex items-center gap-3 p-2 rounded-lg ${getPriorityColor(action.priority)}`}>
                                <span className="text-sm">{action.title}</span>
                                <span className="text-xs ml-auto">{action.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};