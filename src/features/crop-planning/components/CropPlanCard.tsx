// Компонент карточки посева
import {getCropIcon} from "@/utils/cropIcons.ts";
import {statusLib} from "@/utils/status.ts";
import {AlertTriangle, Calendar, CheckCircle, Edit, Flower2, MapPin, Sprout} from "lucide-react";
import {formatArea} from "@/utils/geometry.ts";
import {CropPlanCardVM} from "@/features/crop-planning/mapper/toCropPlanCard.ts";

const SeedlingBadge = ({ status }: { status?: string }) => {
    const config: Record<string, { bg: string; text: string; label: string; icon: JSX.Element }> = {
        sowing: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Посев', icon: <Sprout className="w-3 h-3" /> },
        growing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Растет', icon: <Flower2 className="w-3 h-3" /> },
        ready: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Готова', icon: <CheckCircle className="w-3 h-3" /> },
        planted: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Высажена', icon: <MapPin className="w-3 h-3" /> },
        overdue: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Переросла', icon: <AlertTriangle className="w-3 h-3" /> }
    };

    if (!status || !config[status]) return null;
    const style = config[status];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
            {style.label}
    </span>
    );
};


// Карточка плана (для grid-режима)
const CropPlanCard = ({plan, onEdit, onClick}: {
    plan: CropPlanCardVM;
    onEdit: () => void;
    onClick: () => void;
}) => {
    const getProgressColor = () => {
        if (plan.progress >= 80) return 'bg-green-500';
        if (plan.progress >= 50) return 'bg-blue-500';
        if (plan.progress >= 25) return 'bg-yellow-500';
        return 'bg-gray-500';
    };
    const statusBadge = statusLib.getBadge(plan.status);
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all group">
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">{getCropIcon(plan.crop.name)}</span>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{plan.crop.name}</h3>
                            <p className="text-xs text-gray-500">{plan.variety.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                    {statusBadge.label}
                </span>
                        {plan.is_seedling && <SeedlingBadge status={plan.seedling_status} />}
                    </div>
                </div>

                <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {plan.productionUnit.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatArea(plan.productionUnit.area)}</p>
                </div>

                <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Прогресс</span>
                        <span className="font-medium">{plan.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${getProgressColor()}`}
                            style={{width: `${plan.progress}%`}}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
              {plan.plantingDate.toLocaleDateString('ru')}
          </span>

                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={(e) => { e.stopPropagation(); onClick(); }}
                        className="flex-1 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    >
                        Детали
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};
export default CropPlanCard