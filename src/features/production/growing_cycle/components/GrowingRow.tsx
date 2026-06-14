import {Calendar, ChevronDown, ChevronRight, MapPin, MoreVertical} from 'lucide-react';
import {formatArea} from '@/utils/geometry';
import {dateLib} from '@/utils/date';
import {getCropIcon} from '@/utils/cropIcons';
import {getStageIcon} from '@/utils/stageIcons';
import {GrowingListItem} from "@/entities/production/growing-cycle";
import {StatusBadge} from "@/utils/statusIcons.tsx";

interface GrowingRowProps {
    item: GrowingListItem;
    isExpanded: boolean;
    onToggle: () => void;
    onRowClick: () => void;
}

const ProgressBar = ({ progress }: { progress: number }) => {
    const getColor = () => {
        if (progress >= 75) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress >= 25) return 'bg-yellow-500';
        return 'bg-gray-500';
    };

    return (
        <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${getColor()}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{progress}%</span>
        </div>
    );
};



// Компонент для отображения allocation в развернутом виде
const AllocationDetails = ({ allocations }: { allocations: GrowingListItem['allocations'] }) => {
    if (!allocations || allocations.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center text-gray-500">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Нет данных об участках</p>
            </div>
        );
    }

    // Общая статистика по всем allocations
    const totalArea = allocations.reduce((sum, a) => sum + a.area, 0);
    const avgProgress = allocations.reduce((sum, a) => sum + a.progress, 0) / allocations.length;
    const earliestStart = allocations.reduce((earliest, a) => {
        if (!a.startDate) return earliest;
        if (!earliest) return a.startDate;
        return new Date(a.startDate) < new Date(earliest) ? a.startDate : earliest;
    }, '' as string);
    const latestEnd = allocations.reduce((latest, a) => {
        if (!a.endDate) return latest;
        if (!latest) return a.endDate;
        return new Date(a.endDate) > new Date(latest) ? a.endDate : latest;
    }, '' as string);

    return (
        <div className="space-y-4">

            {/* Список участков */}
            <div>

                <div className="space-y-2">
                    {allocations.map((allocation) => (
                        <div key={allocation.productionUnitId} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{allocation.productionUnitName}</p>
                                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                                        <span>Площадь: {formatArea(allocation.area)}</span>
                                        {allocation.startDate && (
                                            <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Начало: {dateLib.format(allocation.startDate)}
                      </span>
                                        )}
                                        {allocation.endDate && (
                                            <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Окончание: {dateLib.format(allocation.endDate)}
                      </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{allocation.progress}%</span>
                                    </div>
                                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${allocation.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const GrowingRow = ({ item, isExpanded, onToggle, onRowClick }: GrowingRowProps) => {
    // Общая площадь из всех allocation
    const totalArea = item.allocations?.reduce((sum, a) => sum + a.area, 0) || item.allocatedArea;

    // Начальная дата из первого allocation
    const startDate = item.startDate || item.allocations?.[0]?.startDate;

    // Конечная дата из первого allocation
    const endDate = item.endDate || item.allocations?.[0]?.endDate;

    return (
        <>
            <tr
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
                {/* Культура / Сорт */}
                <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggle(); }}
                            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{getCropIcon(item.cropName)}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{item.cropName}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-0.5">{item.varietyName}</div>
                        </div>
                    </div>
                </td>

                {/* Площадь (общая) */}
                <td className="px-4 py-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatArea(totalArea)}</span>
                    {item.allocations && item.allocations.length > 1 && (
                        <div className="text-xs text-gray-400">{item.allocations.length} участка</div>
                    )}
                </td>

                {/* Стадия развития */}
                <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{getStageIcon(item.stage)}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.stage}</span>
                    </div>
                </td>

                {/* Прогресс */}
                <td className="px-4 py-4">
                    <ProgressBar progress={item.progress} />
                </td>

                {/* Сроки */}
                <td className="px-4 py-4">
                    <div className="text-sm">
                        <div className="text-gray-700 dark:text-gray-300">{startDate ? dateLib.format(startDate) : '—'}</div>
                        <div className="text-gray-400 text-xs">до {endDate ? dateLib.format(endDate) : '—'}</div>
                    </div>
                </td>

                {/* Статус */}
                <td className="px-4 py-4">
                    <StatusBadge status={item.status} />
                </td>

                {/* Действия */}
                <td className="px-4 py-4">
                    <button className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                </td>
            </tr>

            {/* Развернутая информация - теперь показывает данные из allocations */}
            {isExpanded && (
                <tr className="bg-gray-50 dark:bg-gray-800/50 cursor-pointer">
                    <td colSpan={7} className="px-4 py-4" onClick={onRowClick}>
                        <AllocationDetails allocations={item.allocations || []} />
                    </td>
                </tr>
            )}
        </>
    );
};