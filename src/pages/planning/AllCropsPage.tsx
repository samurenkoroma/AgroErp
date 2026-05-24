import {useNavigate} from 'react-router-dom';
import {Plus, Sprout} from 'lucide-react';
import {useCropPlanCards} from "@/features/crop-planning/hooks/useCropPlans.ts";
import Loading from "@/components/shared/Loading.tsx";
import Error from "@/components/shared/Error.tsx";
import CropPlanCard from "@/features/crop-planning/components/CropPlanCard.tsx";


const AllCropsPage = () => {
    const navigate = useNavigate();
    const {data: plans, isLoading, error} = useCropPlanCards();

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
                            <CropPlanCard
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