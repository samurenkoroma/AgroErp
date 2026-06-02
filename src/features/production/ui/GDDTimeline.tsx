// src/components/growing/GDDTimeline.tsx
import {useState} from 'react';
import {ChevronRight, TrendingUp} from 'lucide-react';

interface GDDPhase {
    name: string;
    code: string;
    gddRequired: number;
    isCompleted: boolean;
    isCurrent: boolean;
    date?: string;
}

interface GDDTimelineProps {
    phases: GDDPhase[];
    currentGDD: number;
}

export const GDDTimeline = ({ phases, currentGDD }: GDDTimelineProps) => {
    const [expanded, setExpanded] = useState(false);
    const displayPhases = expanded ? phases : phases.slice(0, 4);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">BBCH / GDD фазы</h3>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                    {expanded ? 'Свернуть' : 'Показать все'}
                    <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                </button>
            </div>

            <div className="space-y-3">
                {displayPhases.map((phase, idx) => {
                    const isCompleted = currentGDD >= phase.gddRequired;
                    const isCurrent = phase.isCurrent;

                    return (
                        <div key={phase.code} className="relative">
                            <div className="flex items-center gap-3">
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isCompleted ? 'bg-green-500 text-white' :
                                    isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' :
                                        'bg-gray-200 dark:bg-gray-700 text-gray-500'}
                `}>
                                    {isCompleted ? '✓' : idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{phase.name}</p>
                                            <p className="text-xs text-gray-500">{phase.code}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {phase.gddRequired} GDD
                                            </p>
                                            {phase.date && (
                                                <p className="text-xs text-gray-400">{phase.date}</p>
                                            )}
                                        </div>
                                    </div>
                                    {!isCompleted && !isCurrent && (
                                        <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${Math.min(100, (currentGDD / phase.gddRequired) * 100)}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {idx < phases.length - 1 && (
                                <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200 dark:bg-gray-700 -z-10" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};