import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Edit,
    Eye,
    Flower2,
    MapPin,
    Package,
    Plus,
    Sprout,
    Trash2
} from 'lucide-react';
import {CropPlan} from "@/entities/planning";
import {statusLib} from "@/utils/status.ts";
import {formatArea} from "@/utils/geometry.ts";
import {getCropIcon} from "@/utils/cropIcons.ts";
import {useCropPlans} from "@/features/crop-planning/hooks/useCropPlans.ts";
import Loading from "@/components/shared/Loading.tsx";
import Error from "@/components/shared/Error.tsx";

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
const PlanCard = ({plan, onEdit, onClick}: {
    plan: CropPlan;
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
                        {plan.productionUnit.id}
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
                            style={{ width: `${plan.progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
              {new Date(plan.plantingDate).toLocaleDateString('ru')}
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

const AllCropsPage = () => {
    const navigate = useNavigate();
    const {data: plans, isLoading, error} = useCropPlans();

    const handleViewDetails = (planId: string) => {
        navigate(`/growing/${planId}`);
    };

    if (isLoading) return (<Loading text="Загрузка посевов..."/>);
    if (error) return (<Error text="Посевов не найдено"/>);
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Sprout className="w-6 h-6 text-green-600" />
                                Все посевы
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Управление всеми планами посева
                            </p>
                        </div>
                        <button
                            onClick={() => {
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Новый посев
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {plans && plans.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                        <Sprout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Нет посевов
                        </h3>
                        {<button onClick={() => {
                        }}
                                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Создать план
                            </button>
                        }
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {plans && plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onEdit={() => {
                                }}
                                onClick={() => handleViewDetails(plan.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default AllCropsPage;