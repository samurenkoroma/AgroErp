import {useEffect, useState} from 'react';
import {CheckCircle} from 'lucide-react';
import {getStageConfig, stageConfig} from '@/utils/stageIcons';

interface StageProgressProps {
    currentStage: string;
    showLabels?: boolean;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onStageClick?: (stage: string) => void;
}

export const StageProgress = ({
                                  currentStage,
                                  showLabels = true,
                                  size = 'md',
                                  interactive = false,
                                  onStageClick
                              }: StageProgressProps) => {
    const [animated, setAnimated] = useState(false);
    const stages = Object.entries(stageConfig);
    const currentIndex = stages.findIndex(([key]) => key === currentStage);
    const progress = ((currentIndex + 1) / stages.length) * 100;

    useEffect(() => {
        setAnimated(true);
    }, []);

    const sizeClasses = {
        sm: { h: 'h-1', text: 'text-xs', icon: 'w-4 h-4' },
        md: { h: 'h-1.5', text: 'text-sm', icon: 'w-5 h-5' },
        lg: { h: 'h-2', text: 'text-base', icon: 'w-6 h-6' }
    };

    return (
        <div className="space-y-3">
            {/* Progress bar */}
            <div className="relative">
                <div className={`w-full ${sizeClasses[size].h} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
                    <div
                        className={`h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-700 ease-out ${animated ? '' : 'w-0'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Stage markers */}
                <div className="absolute top-0 left-0 right-0 flex justify-between -translate-y-1/2">
                    {stages.map(([stage], idx) => {
                        const isCompleted = idx <= currentIndex;
                        const config = getStageConfig(stage);

                        return (
                            <button
                                key={stage}
                                onClick={() => interactive && onStageClick?.(stage)}
                                className={`
                  transition-all duration-300 transform
                  ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                  ${isCompleted ? config.color : 'text-gray-400'}
                `}
                                style={{ marginLeft: idx === 0 ? 0 : idx === stages.length - 1 ? 'auto' : undefined }}
                            >
                                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${isCompleted ? config.bgColor : 'bg-gray-100 dark:bg-gray-800'}
                `}>
                                    {isCompleted ? <CheckCircle className={`${sizeClasses[size].icon} ${config.color}`} /> : config.icon}
                                </div>
                                {showLabels && (
                                    <span className={`absolute mt-2 text-xs text-gray-500 whitespace-nowrap -translate-x-1/2 left-1/2 ${sizeClasses[size].text}`}>
                    {config.label}
                  </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};