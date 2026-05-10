// src/features/crop-planning/components/Timeline.tsx
import {AlertCircle, CheckCircle, Clock, Play} from 'lucide-react';
import {Phenophase} from '../../../entities/planning/types.ts';

interface TimelineProps {
    phenophases: Phenophase[];
    currentGDD: number;
    currentPhaseCode?: string;
}

const getPhaseStatus = (phase: Phenophase, currentGDD: number) => {
    if (currentGDD >= phase.gddRequired) return 'completed';
    return 'upcoming';
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'completed':
            return <CheckCircle className="w-5 h-5 text-green-500"/>;
        case 'current':
            return <Play className="w-5 h-5 text-blue-500"/>;
        default:
            return <Clock className="w-5 h-5 text-gray-400"/>;
    }
};

export const Timeline = ({phenophases, currentGDD, currentPhaseCode}: TimelineProps) => {
    // Сортируем фазы по GDD
    const sortedPhases = [...phenophases].sort((a, b) => a.gddRequired - b.gddRequired);

    // Определяем текущую фазу
    const phasesWithStatus = sortedPhases.map((phase, idx) => {
        let status = getPhaseStatus(phase, currentGDD);
        if (phase.code === currentPhaseCode) status = 'current';
        return {...phase, status};
    });

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"/>

            <div className="space-y-6 relative">
                {phasesWithStatus.map((phase, idx) => (
                    <div key={phase.code} className="relative flex gap-4">
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 flex items-center justify-center
                ${phase.status === 'completed' ? 'border-green-500' :
                                phase.status === 'current' ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
                            }
              `}>
                                {getStatusIcon(phase.status)}
                            </div>
                        </div>
                        <div
                            className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{phase.name}</h3>
                                    <p className="text-sm text-gray-500">{phase.code}</p>
                                    {phase.description && (
                                        <p className="text-xs text-gray-400 mt-1">{phase.description}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        GDD: {phase.gddRequired}
                                    </p>
                                    {phase.isCritical && (
                                        <span className="inline-flex items-center gap-1 text-xs text-red-500 mt-1">
                      <AlertCircle className="w-3 h-3"/>
                      Критическая фаза
                    </span>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar for current phase */}
                            {phase.status === 'current' && (
                                <div className="mt-3">
                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all"
                                            style={{
                                                width: `${Math.min(100, (currentGDD / phase.gddRequired) * 100)}%`
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Прогресс: {Math.min(100, Math.round((currentGDD / phase.gddRequired) * 100))}%
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};