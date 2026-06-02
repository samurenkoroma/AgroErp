// src/components/growing/GDDProgress.tsx
import {useEffect, useState} from 'react';
import {Info, TrendingUp} from 'lucide-react';

interface GDDProgressProps {
    currentGDD: number;
    requiredGDD: number;
    currentStage: string;
    nextStage: string;
    dailyAccumulation?: number;
    forecastGDD?: number;
    size?: 'sm' | 'md' | 'lg';
    showDetails?: boolean;
}

const sizeConfig = {
    sm: { ring: 80, strokeWidth: 6, textSize: 'text-xl', iconSize: 'w-4 h-4' },
    md: { ring: 120, strokeWidth: 8, textSize: 'text-2xl', iconSize: 'w-5 h-5' },
    lg: { ring: 160, strokeWidth: 10, textSize: 'text-3xl', iconSize: 'w-6 h-6' }
};

export const GDDProgress = ({
                                currentGDD,
                                requiredGDD,
                                currentStage,
                                nextStage,
                                dailyAccumulation = 12.5,
                                forecastGDD = 85,
                                size = 'md',
                                showDetails = true
                            }: GDDProgressProps) => {
    const [progress, setProgress] = useState(0);
    const [animated, setAnimated] = useState(false);

    const percent = Math.min(100, (currentGDD / requiredGDD) * 100);
    const remaining = Math.max(0, requiredGDD - currentGDD);
    const daysToNext = Math.ceil(remaining / dailyAccumulation);

    const config = sizeConfig[size];
    const radius = (config.ring - config.strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const getGDDStatus = () => {
        if (percent >= 100) return { color: 'text-green-600', message: 'Цель достигнута!' };
        if (percent >= 75) return { color: 'text-emerald-600', message: 'Почти готово' };
        if (percent >= 50) return { color: 'text-blue-600', message: 'Хороший прогресс' };
        if (percent >= 25) return { color: 'text-yellow-600', message: 'Начало пути' };
        return { color: 'text-gray-600', message: 'Только начали' };
    };

    const status = getGDDStatus();

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Накопленные GDD</h3>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Info className="w-3 h-3" />
                    <span>Сумма активных температур</span>
                </div>
            </div>

            <div className="flex flex-col items-center">
                {/* Круговая диаграмма */}
                <div className="relative" style={{ width: config.ring, height: config.ring }}>
                    <svg width={config.ring} height={config.ring} className="transform -rotate-90">
                        {/* Фоновый круг */}
                        <circle
                            cx={config.ring / 2}
                            cy={config.ring / 2}
                            r={radius}
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth={config.strokeWidth}
                            className="dark:stroke-gray-700"
                        />
                        {/* Прогресс круг */}
                        <circle
                            cx={config.ring / 2}
                            cy={config.ring / 2}
                            r={radius}
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth={config.strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={animated ? strokeDashoffset : circumference}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-bold ${config.textSize} text-gray-900 dark:text-white`}>
              {Math.round(currentGDD)}
            </span>
                        <span className="text-xs text-gray-500">из {requiredGDD}</span>
                    </div>
                </div>

                {/* Процент */}
                <div className="mt-3 text-center">
          <span className={`text-sm font-semibold ${status.color}`}>
            {percent.toFixed(1)}% завершено
          </span>
                    <p className="text-xs text-gray-500 mt-1">{status.message}</p>
                </div>
            </div>

            {showDetails && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-gray-500">Текущая фаза</p>
                            <p className="font-medium text-gray-900 dark:text-white">{currentStage}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Следующая фаза</p>
                            <p className="font-medium text-gray-900 dark:text-white">{nextStage}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Осталось GDD</p>
                            <p className="font-medium text-blue-600">{remaining.toFixed(0)} °C·дн</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Прогноз до фазы</p>
                            <p className="font-medium text-amber-600">~{daysToNext} дней</p>
                        </div>
                    </div>

                    {/* Прогресс-бар накопления */}
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Ежедневное накопление</span>
                            <span>{dailyAccumulation} °C·дн/день</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${(dailyAccumulation / 20) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Прогноз на неделю */}
                    {forecastGDD > 0 && (
                        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-blue-700 dark:text-blue-300">Прогноз на неделю</span>
                                <span className="font-semibold text-blue-700 dark:text-blue-300">+{forecastGDD} °C·дн</span>
                            </div>
                            <div className="h-1 bg-blue-200 dark:bg-blue-800 rounded-full mt-1 overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${(forecastGDD / (requiredGDD - currentGDD)) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};