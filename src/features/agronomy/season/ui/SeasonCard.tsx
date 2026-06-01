import {Calendar, CheckCircle, Edit, Play, Trash2} from "lucide-react";
import {Season, seasonLib} from "@/entities/agronomy/season";

interface SeasonCardProps {
    season: Season;
    isSelected: boolean;
    onClick: () => void;
    onEdit: () => void;
    onDelete?: () => void;
    onActivate?: () => void;
}

const SeasonCard = ({season, isSelected, onClick, onEdit, onActivate}: SeasonCardProps) => {
    const getStatusIcon = () => {
        switch (season.status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4"/>;
            case 'current':
                return <Play className="w-4 h-4"/>;
            case 'planning':
                return <Calendar className="w-4 h-4"/>;
            default:
                return <Calendar className="w-4 h-4"/>;
        }
    };


    return (
        <div
            onClick={onClick}
            className={`
        bg-white dark:bg-gray-900 rounded-xl border-2 transition-all cursor-pointer
        ${isSelected
                ? 'border-green-500 shadow-lg ring-2 ring-green-500/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-green-300 hover:shadow-md'
            }
      `}
        >
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{season.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
              <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${seasonLib.getStatusColor(season.status)}`}>
                {getStatusIcon()}
                  {season.status === 'current' && 'Текущий'}
                  {season.status === 'completed' && 'Завершен'}
                  {season.status === 'planning' && 'Черновик'}
              </span>
                            <span className="text-xs text-gray-500">
                {seasonLib.getStatusText(season.status)}
              </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Edit className="w-4 h-4 text-gray-500"/>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4 text-red-500"/>
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Период</span>
                        <span className="text-gray-900 dark:text-white">
              {new Date(season.startDate).toLocaleDateString('ru')} — {new Date(season.endDate).toLocaleDateString('ru')}
            </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{season.statistics.totalPlans}</p>
                            <p className="text-xs text-gray-500">Планов</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{season.statistics.totalArea.toFixed(1)}</p>
                            <p className="text-xs text-gray-500">Га</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                {season.statistics.totalHarvest > 0 ? `${(season.statistics.totalHarvest / 1000).toFixed(1)}т` : '—'}
                            </p>
                            <p className="text-xs text-gray-500">Урожай</p>
                        </div>
                    </div>

                    {seasonLib.isPlanning(season) && onActivate && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onActivate();
                            }}
                            className="w-full mt-3 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Play className="w-3 h-3"/>
                            Активировать сезон
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
export default SeasonCard