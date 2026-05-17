import {useMemo, useState} from 'react';
import {FarmMap} from '@/features/farm';
import {useFarmPage} from "@/features/farm/hooks";
import {Calendar, ChevronRight, Layers, List, MapPin, Sprout, X} from "lucide-react";
import {formatArea} from "@/utils/geometry.ts";
import {useNavigate} from "react-router-dom";
import fieldIcon from '@/assets/images/icons/field.png';
import greenhouseIcon from '@/assets/images/icons/greenhouse.png';
import plotIcon from '@/assets/images/icons/plot.png';
import CropsGridView from "@/features/crop-planning/components/CropsGridView.tsx";
import {CropsWidget} from "@/features/crop-planning/components/CropsWidget.tsx";
import Loading from "@/components/shared/Loading.tsx";
import Error from "@/components/shared/Error.tsx";
import {FarmObject} from "@/entities/object";
import {statusLib} from "@/utils/status.ts";

const FarmPage = () => {
    const {farm: currentFarm, objects, cropPlans, isLoading, error} = useFarmPage();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'objects' | 'plans' | 'crops'>('objects');
    const navigate = useNavigate();

    const filteredObjects = useMemo(() => {
        if (!currentFarm) return [];
        if (!objects) return [];
        return objects;
    }, [currentFarm, objects]);

    const handleNavigateToDetails = (obj: FarmObject) => {
        if (obj.type === "field") {
            navigate(`/field/${obj.id}`);
        } else if (obj.type === "greenhouse") {
            navigate(`/greenhouse/${obj.id}`);
        } else if (obj.type === "plot") {
            navigate(`/plot/${obj.id}`);
        }
    };

    const handleNavigateToPlan = (planId: string) => {
        navigate(`/growing/${planId}`);
    };

    // Получение иконки для типа объекта (PNG)
    const getObjectIcon = (type: string): string => {
        switch (type) {
            case 'field':
                return fieldIcon;
            case 'greenhouse':
                return greenhouseIcon;
            case 'plot':
                return plotIcon;
            default:
                return fieldIcon;
        }
    };

    if (isLoading) return (<Loading text="Загрузка теплицы..."/>);
    if (error) return (<Error text="Объекты не найдена"/>);

    return (
        <div className="relative h-full w-full overflow-hidden">
            {activeTab == 'objects' && <FarmMap
                objects={filteredObjects}
                onObjectClick={handleNavigateToDetails}
            />}
            {activeTab == 'plans' && <CropsGridView onNavigateToPlan={handleNavigateToPlan}/>}


            {/* Полупрозрачная панель справа */}
            <div
                className={`absolute right-0 top-0 h-full transition-all duration-300 ${isSidebarOpen ? 'w-96' : 'w-0'}`}
            >
                <div
                    className="h-full bg-black/60 dark:bg-black/70 backdrop-blur-md border-l border-white/20 shadow-2xl overflow-hidden flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-white/20">
                        <div className="p-3 flex justify-end">
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-white/70"/>
                            </button>
                        </div>
                        <button
                            onClick={() => setActiveTab('objects')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                activeTab === 'objects'
                                    ? 'text-white border-b-2 border-green-500'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <List className="w-4 h-4"/>
                            Объекты
                            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                                {filteredObjects.length}
                            </span>
                        </button>
                        <button
                            disabled={objects.length == 0}
                            onClick={() => setActiveTab('plans')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                objects.length > 0 ? activeTab === 'plans'
                                    ? 'text-white border-b-2 border-green-500'
                                    : 'text-gray-400 hover:text-white'
                                    : 'text-gray-700'
                            }`}
                        >
                            <Sprout className="w-4 h-4"/>
                            Посевы
                            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                                {cropPlans?.length}
                            </span>
                        </button>
                    </div>

                    {activeTab === 'objects' && (
                        <button type='button' onClick={() => navigate('/draw')}>Добавить обьект</button>
                    )}
                    {activeTab === 'plans' && (
                        <button type='button' onClick={() => navigate('/plan/1')}>Добавить посев</button>
                    )}

                    {/* Контент вкладки "Объекты" */}
                    {activeTab === 'objects' && (
                        <>
                            {/* Статистика */}
                            {filteredObjects.length > 0 && (
                                <div className="px-4 py-2 border-b border-white/20 bg-white/5">
                                    <div className="flex justify-between text-xs text-gray-300">
                                        <span>Общая площадь:</span>
                                        <span className="font-medium text-white">
                                            {formatArea(currentFarm?.totalArea)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Список объектов */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {isLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div
                                            className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                    </div>
                                ) : filteredObjects.length > 0 ? (
                                    filteredObjects.map((obj) => (
                                        <div
                                            key={obj.id}
                                            className="group p-3 rounded-lg transition-all cursor-pointer bg-white/10 hover:bg-white/20"
                                            onClick={() => handleNavigateToDetails(obj)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* PNG иконка вместо emoji */}
                                                <img
                                                    src={getObjectIcon(obj.type)}
                                                    alt={obj.type}
                                                    className="w-8 h-8 rounded-lg object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className="font-semibold text-white truncate">
                                                            {obj.name}
                                                        </h3>
                                                        <span
                                                            className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white/80 shrink-0">
                                                            {obj.status === 'active' ? 'Активен' : obj.status === 'maintenance' ? 'Обслуживание' : obj.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-300 mt-1">
                                                        {obj.type === 'field' ? 'Поле' : obj.type === 'greenhouse' ? 'Теплица' : 'Участок'} •
                                                        {formatArea(obj.area)}
                                                    </p>
                                                </div>
                                                <ChevronRight
                                                    className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors"/>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-3"/>
                                        <p className="text-gray-400">Объекты не найдены</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Контент вкладки "Планы" */}
                    {activeTab === 'plans' && (
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {/*{activePlans && activePlans.length > 0 ? (*/}
                            {cropPlans ? (
                                cropPlans.map((plan) => {
                                    const statusBadge = statusLib.getBadge(plan.status);
                                    return (
                                        <div
                                            key={plan.id}
                                            className="group p-3 rounded-lg transition-all cursor-pointer bg-white/10 hover:bg-white/20"
                                            onClick={() => handleNavigateToPlan(plan.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                    <Sprout className="w-4 h-4 text-green-400"/>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className="font-semibold text-white truncate">
                                                            {plan.crop.name}
                                                        </h3>
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusBadge.bg} ${statusBadge.text}`}>
                                                            {statusBadge.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-300 mt-1">
                                                        {plan.variety.name}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3"/>
                                                            {new Date(plan.plantingDate).toLocaleDateString('ru')}
                                                        </span>
                                                        {plan.progress > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Sprout className="w-3 h-3"/>
                                                                {plan.progress}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Прогресс бар */}
                                                    {plan.progress > 0 && (
                                                        <div className="mt-2">
                                                            <div
                                                                className="h-1 bg-white/20 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-green-500 rounded-full transition-all"
                                                                    style={{width: `${plan.progress}%`}}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <ChevronRight
                                                    className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors shrink-0"/>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12">
                                    <Sprout className="w-12 h-12 text-gray-500 mx-auto mb-3"/>
                                    <p className="text-gray-400">Нет активных планов</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Перейдите в раздел "Планирование" чтобы создать план
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'crops' && (
                        <CropsWidget onNavigateToPlan={(planId) => navigate(`/growing/${planId}`)}/>
                    )}
                    {/* Подсказка внизу */}
                    <div className="p-3 border-t border-white/20 bg-white/5">
                        <p className="text-xs text-gray-400 text-center">
                            💡 Нажмите на объект или план для просмотра деталей
                        </p>
                    </div>
                </div>
            </div>

            {/* Кнопка открытия панели */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute right-4 top-4 w-10 h-10 bg-black/50 backdrop-blur rounded-lg shadow-lg flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                >
                    <Layers className="w-5 h-5 text-white"/>
                </button>
            )}
        </div>
    );
};

export default FarmPage;