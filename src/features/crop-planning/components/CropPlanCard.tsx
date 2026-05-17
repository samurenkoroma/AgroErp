// Компонент карточки посева
import {getCropIcon} from "@/utils/cropIcons.ts";
import {statusLib} from "@/utils/status.ts";
import {CropPlan} from "@/entities/planning/types.ts";

const CropPlanCard = ({plan, onClick}: { plan: CropPlan; onClick: () => void }) => {
    const statusBadge = statusLib.getBadge(plan.status);
    const progressColor = statusLib.getProgressColor(plan.progress);

    return (
        <div
            onClick={onClick}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCropIcon(plan.crop.name)}</span>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{plan.crop.name}</h3>
                        <p className="text-xs text-gray-500">{plan.variety.name}</p>
                    </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                    {statusBadge.label}
                </span>
            </div>

            <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Прогресс</span>
                    <span className="font-medium">{plan.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${progressColor}`}
                        style={{width: `${plan.progress}%`}}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Посадка: {new Date(plan.plantingDate).toLocaleDateString('ru')}</span>
                <span>Сбор: {new Date(plan.expectedHarvestDate).toLocaleDateString('ru')}</span>
            </div>
        </div>
    );
};
export default CropPlanCard