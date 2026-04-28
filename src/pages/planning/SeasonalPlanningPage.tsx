// pages/planning/SeasonalPlanningPage.tsx
import {useCallback, useMemo, useState} from 'react';
import {Calendar, Calendar as CalendarIcon, ChevronDown, ChevronRight, Package, Sprout, Trash2} from 'lucide-react';
import {FarmMap} from '@/features/farm';
import {Bed, Crop, FarmObject} from "@/entities";
import CreateCropPlanModal, {CreateCropPlanCommand} from "@/features/planting/ui/CreateCropPlanModal.tsx";
import {useUIStore} from "@/stores/uiStore.ts";
import {useFarmPage} from "@/features/farm/hooks";
import Loading from "@/components/shared/Loading.tsx";
import {PlantingPlan} from "@/types.ts";


// ==================== MOCK DATA ====================

const CURRENT_YEAR = new Date().getFullYear();
const NEXT_SEASON_YEAR = CURRENT_YEAR + 1;

// ==================== MAIN COMPONENT ====================

const SeasonalPlanningPage = () => {
    const [plans, setPlans] = useState<PlantingPlan[]>([]);
    const [selectedObject, setSelectedObject] = useState<FarmObject | null>(null);
    const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
    const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [isBedsModalOpen, setIsBedsModalOpen] = useState(false);
    const [showRotationWarning, setShowRotationWarning] = useState(false);
    const [expandedCrops, setExpandedCrops] = useState<Set<string>>(new Set());
    const [notes, setNotes] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const {objects, isLoading} = useFarmPage();
    const [selectedBedForPlan, setSelectedBedForPlan] = useState<{
        id: string;
        name: string;
        type: string
    } | null>(null);
    const {addNotification} = useUIStore();

    // Расчет количества семян/рассады (примерный)
    const calculateSeedsAmount = (crop: Crop, area: number, areaUnit: 'ha' | 'm2'): {
        amount: number;
        unit: string
    } => {
        let areaInUnit = areaUnit === 'ha' ? area : area / 10000;

        if (crop.seedingRate.type === 'seeds') {
            const amount = areaInUnit * crop.seedingRate.value;
            if (amount < 1) return {amount: Math.round(amount * 1000), unit: 'г'};
            if (amount < 1000) return {amount: Math.round(amount), unit: 'кг'};
            return {amount: Number((amount / 1000).toFixed(1)), unit: 'т'};
        } else {
            const amount = area * crop.seedingRate.value;
            if (amount < 1000) return {amount: Math.round(amount), unit: 'шт'};
            return {amount: Number((amount / 1000).toFixed(1)), unit: 'тыс. шт'};
        }
    };

    // Проверка севооборота
    const checkCropRotation = (object: GrowingObject, bed: Bed | null, crop: Crop): {
        isGood: boolean;
        warning: string | null
    } => {
        const lastCrops = bed?.lastCropId
            ? [{cropId: bed.lastCropId, year: bed.lastCropYear || CURRENT_YEAR - 1}]
            : object.lastCrops || [];

        for (const last of lastCrops) {
            const lastCropData = mockCrops.find(c => c.id === last.cropId);
            if (!lastCropData) continue;

            const yearsDiff = NEXT_SEASON_YEAR - (last.year || CURRENT_YEAR - 1);

            if (crop.cropRotation.badPredecessors.includes(lastCropData.name)) {
                if (yearsDiff < crop.cropRotation.minBreakYears) {
                    return {
                        isGood: false,
                        warning: `${lastCropData.name} рос ${last.year ? `в ${last.year} году` : 'в прошлом сезоне'}. Рекомендуемый перерыв: ${crop.cropRotation.minBreakYears} года. К следующему сезону пройдет: ${yearsDiff} лет.`
                    };
                }
            }
        }

        return {isGood: true, warning: null};
    };

    // Обработка создания плана
    const handleCreatePlan = (command: CreateCropPlanCommand) => {
        console.log('Новый план:', command);
        // TODO: Отправить запрос на бэкенд
        addNotification({
            type: 'success',
            message: `План "${command.name}" успешно создан`
        });
        setIsCreateModalOpen(false);
    };
    // В обработчике клика по объекту
    const handleObjectClick = useCallback((obj: any) => {
        if (obj.type === 'field') {
            // Для полей - сразу открываем модалку создания плана
            setSelectedBedForPlan({
                id: obj.id,
                name: obj.name,
                type: obj.type
            });
            setIsCreateModalOpen(true);
        } else {
            // Для теплиц/участков - показываем схему грядок
            setSelectedObject(obj);
            setIsBedsModalOpen(true);
        }
    }, []);

    // В обработчике клика по грядке
    const handleBedClick = (bed: Bed) => {
        setSelectedBedForPlan({
            id: bed.id,
            name: `${selectedObject?.name} / ${bed.name || bed.number}`,
            type: selectedObject?.type || 'plot'
        });
        setIsBedsModalOpen(false);
        setIsCreateModalOpen(true);
    };

    // Добавление плана
    const addPlan = () => {
        if (!selectedObject || !selectedCrop) return;
        const area = selectedBed ? selectedBed.area : selectedObject.area;
        const areaUnit = selectedObject.type === 'field' ? 'ha' : 'm2';
        const seedsAmount = calculateSeedsAmount(selectedCrop, area, areaUnit);

        const newPlan: PlantingPlan = {
            id: `${Date.now()}-${Math.random()}`,
            objectId: selectedObject.id,
            objectName: selectedObject.name,
            objectType: selectedObject.type,
            bedId: selectedBed?.id,
            bedName: selectedBed?.name || (selectedBed ? `Грядка ${selectedBed.number}` : undefined),
            cropId: selectedCrop.id,
            cropName: selectedCrop.name,
            cropCategory: selectedCrop.category,
            season: NEXT_SEASON_YEAR,
            status: 'planned',
            seedsAmount: seedsAmount.amount,
            seedsUnit: seedsAmount.unit,
            area: area,
            notes: notes || undefined,
            createdAt: new Date().toISOString()
        };

        setPlans(prev => [...prev, newPlan]);
        setIsCropModalOpen(false);
        setSelectedObject(null);
        setSelectedBed(null);
        setSelectedCrop(null);
        setNotes('');
    };

    // Удаление плана
    const deletePlan = (planId: string) => {
        setPlans(prev => prev.filter(p => p.id !== planId));
    };

    // Группировка планов по культурам
    const groupedPlans = useMemo(() => {
        const groups: Record<string, { crop: Crop; plans: PlantingPlan[]; expanded: boolean }> = {};

        plans.forEach(plan => {
            const crop = mockCrops.find(c => c.id === plan.cropId);
            if (!crop) return;

            if (!groups[plan.cropId]) {
                groups[plan.cropId] = {
                    crop,
                    plans: [],
                    expanded: expandedCrops.has(plan.cropId)
                };
            }
            groups[plan.cropId].plans.push(plan);
        });

        return Object.values(groups);
    }, [plans, expandedCrops]);

    // Подсчет статистики
    const stats = useMemo(() => {
        let totalArea = 0;
        let totalPlans = plans.length;

        plans.forEach(plan => {
            totalArea += plan.area;
        });

        return {totalPlans, totalArea: totalArea.toFixed(1)};
    }, [plans]);

    // Переключение раскрытия группы
    const toggleExpand = (cropId: string) => {
        setExpandedCrops(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cropId)) {
                newSet.delete(cropId);
            } else {
                newSet.add(cropId);
            }
            return newSet;
        });
    };

    // Получение иконки для типа объекта
    const getObjectIcon = (type: string) => {
        switch (type) {
            case 'field':
                return '🌾';
            case 'greenhouse':
                return '🌱';
            case 'plot':
                return '📍';
            default:
                return '📌';
        }
    };

    if (isLoading) return (<Loading text="Загрузка объектов..."/>);

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar className="w-6 h-6 text-green-600"/>
                                Планирование посевной
                            </h1>
                            <div
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                                Сезон {NEXT_SEASON_YEAR}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">
                            Планирование на следующий сезон. Нажмите на поле, теплицу или участок на карте
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <span>📋</span>
                            <span className="font-medium">{stats.totalPlans}</span>
                            <span className="text-gray-500">планов</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <span>📍</span>
                            <span className="font-medium">{stats.totalArea}</span>
                            <span className="text-gray-500">{selectedObject?.type === 'field' ? 'га' : 'м²'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Карта */}
                <div className="flex-1 relative">
                    <FarmMap
                        objects={objects}
                        onObjectClick={handleObjectClick}
                    />

                    {/* Легенда */}
                    <div
                        className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-lg p-3 shadow-lg text-xs space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Поле</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Теплица</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded"></div>
                            <span>Участок</span>
                        </div>
                    </div>
                </div>

                {/* Правая панель - список планов */}
                <div
                    className="w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sprout className="w-5 h-5 text-green-600"/>
                            План на сезон {NEXT_SEASON_YEAR}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            {plans.length === 0 ? 'Нет запланированных посадок' : `${plans.length} запланированных посадок`}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {groupedPlans.length === 0 ? (
                            <div className="text-center py-12">
                                <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
                                <p className="text-gray-500">Нет запланированных посадок</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Нажмите на поле, теплицу или участок на карте
                                </p>
                            </div>
                        ) : (
                            groupedPlans.map(group => (
                                <div key={group.crop.id}
                                     className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    {/* Заголовок группы */}
                                    <button
                                        onClick={() => toggleExpand(group.crop.id)}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{group.crop.icon || '🌱'}</span>
                                            <div className="text-left">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {group.crop.name}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {group.plans.length} {group.plans.length === 1 ? 'объект' : 'объекта'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {group.plans.reduce((sum, p) => sum + p.area, 0).toFixed(1)} {group.crop.seedingRate.type === 'seeds' ? 'га' : 'м²'}
                      </span>
                                            {group.expanded ? (
                                                <ChevronDown className="w-4 h-4 text-gray-500"/>
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-gray-500"/>
                                            )}
                                        </div>
                                    </button>

                                    {/* Список объектов в группе */}
                                    {group.expanded && (
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {group.plans.map(plan => (
                                                <div key={plan.id}
                                                     className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <span
                                                                className="text-lg">{getObjectIcon(plan.objectType)}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                    {plan.objectName}
                                                                </p>
                                                                {plan.bedName && (
                                                                    <p className="text-xs text-gray-500">{plan.bedName}</p>
                                                                )}
                                                                <div
                                                                    className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Package className="w-3 h-3"/>
                                      {plan.seedsAmount} {plan.seedsUnit}
                                  </span>
                                                                    <span className="flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3"/>
                                    Сезон {plan.season}
                                  </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => deletePlan(plan.id)}
                                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500"/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Подсказка */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <div className="text-xs text-gray-500 text-center space-y-1">
                            <p>💡 <strong>Совет:</strong></p>
                            <p>• Планирование на сезон {NEXT_SEASON_YEAR}</p>
                            <p>• Нажмите на поле для быстрого планирования</p>
                            <p>• Для теплиц и участков сначала выберите грядку</p>
                        </div>
                    </div>
                </div>
            </div>

            <CreateCropPlanModal
            isOpen={isCreateModalOpen}
            onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedBedForPlan(null);
        }}
            onSave={handleCreatePlan}
            bedId={selectedBedForPlan?.id || ''}
            bedName={selectedBedForPlan?.name || ''}
            objectType={selectedBedForPlan?.type as any || 'field'}
            latitude={55.7558}
            longitude={37.6173}
            availableCrops={[]}
            availableVarieties={[]}
            currentUserId="user-1"
            currentUserName="Иван Иванов"
            />
        </div>
    );
};

export default SeasonalPlanningPage;