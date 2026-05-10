// src/features/crop-planning/components/CreateCropPlanModal.tsx
import {useMemo, useState} from 'react';
import {Calendar, Check, FileText, Leaf, MapPin, Save, Sprout, X} from 'lucide-react';
import {Modal} from '@/components/common/Modal';
import {useCultivationPlans} from '../hooks/useCultivationPlans';
import {useCultivationAreasByObject} from '../hooks/useCultivationAreas.ts';
import {useCreateCropPlan} from '../hooks/useCropPlans';
import {getCropIcon} from '@/utils/cropIcons';
import {useGreenhouseCrops} from "@/features/catalog/queries/useCrop.ts";
import {useVarieties} from "@/features/catalog/queries/useVariety.ts";
import {CultivationArea} from "@/entities/planning/types.ts";

interface CreateCropPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    preSelectedLocationId?: string;
    objectId: string;
}

export const CreateCropPlanModal = ({
                                        isOpen,
                                        onClose,
                                        onSuccess,
                                        preSelectedLocationId,
                                        objectId
                                    }: CreateCropPlanModalProps) => {
    // Состояния формы
    const [selectedLocationId, setSelectedLocationId] = useState<string>(preSelectedLocationId || '');
    const [selectedCropKey, setSelectedCropKey] = useState<string>('');
    const [selectedVarietyId, setSelectedVarietyId] = useState<string>('');
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Поиск и фильтры
    const [cropSearch, setCropSearch] = useState('');
    const [varietySearch, setVarietySearch] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    const [locationTypeFilter, setLocationTypeFilter] = useState<CultivationArea['type'] | 'all'>('all');

    // API данные
    const {data: crops, isLoading: cropsLoading} = useGreenhouseCrops();
    const {data: varieties, isLoading: varietiesLoading} = useVarieties(selectedCropKey);
    const {data: cultivationPlans, isLoading: plansLoading} = useCultivationPlans(selectedCropKey);
    const {data: locations, isLoading: locationsLoading} = useCultivationAreasByObject({objectId});
    const createPlan = useCreateCropPlan();

    // Выбранные объекты
    const selectedLocation = useMemo(() => {
        return locations?.find(l => l.id === selectedLocationId);
    }, [locations, selectedLocationId]);

    const selectedCrop = useMemo(() => {
        return crops?.find(c => c.key === selectedCropKey);
    }, [crops, selectedCropKey]);

    const selectedVariety = useMemo(() => {
        return varieties?.find(v => v.id === selectedVarietyId);
    }, [varieties, selectedVarietyId]);

    const selectedPlan = useMemo(() => {
        return cultivationPlans?.find(p => p.id === selectedPlanId);
    }, [cultivationPlans, selectedPlanId]);

    // Фильтрация культур
    const filteredCrops = useMemo(() => {
        if (!crops) return [];
        if (!cropSearch) return crops;
        return crops.filter(crop =>
            crop.name.toLowerCase().includes(cropSearch.toLowerCase()) ||
            crop.category.toLowerCase().includes(cropSearch.toLowerCase())
        );
    }, [crops, cropSearch]);

    // Фильтрация локаций
    const filteredLocations = useMemo(() => {
        if (!locations) return [];
        let filtered = locations.filter(l => l.objectId);

        if (locationSearch) {
            filtered = filtered.filter(l =>
                l.name.toLowerCase().includes(locationSearch.toLowerCase())
            );
        }
        if (locationTypeFilter !== 'all') {
            filtered = filtered.filter(l => l.type === locationTypeFilter);
        }
        return filtered;
    }, [locations, locationSearch, locationTypeFilter]);

    // Расчет необходимого количества растений
    const calculateRequiredPlants = useMemo(() => {
        if (!selectedLocation || !selectedVariety) return null;

        const seedingRate = selectedVariety.seedingRates?.[
            selectedLocation.type === 'field' ? 'open_ground' : 'greenhouse'
            ];

        if (!seedingRate) return null;

        const plantsPerM2 = 1 / (seedingRate.rowSpacing * seedingRate.plantSpacing);
        let areaM2 = selectedLocation.areaUnit === 'ha'
            ? selectedLocation.area * 10000
            : selectedLocation.area;

        const totalPlants = plantsPerM2 * areaM2;
        const totalWithSafety = totalPlants * (seedingRate.safetyFactor || 1.1);

        if (totalWithSafety < 1000) {
            return {amount: Math.round(totalWithSafety), unit: 'шт'};
        }
        return {amount: (totalWithSafety / 1000).toFixed(1), unit: 'тыс. шт'};
    }, [selectedLocation, selectedVariety]);

    // Валидация формы
    const isFormValid = useMemo(() => {
        return selectedLocationId && selectedCropKey && selectedVarietyId && selectedPlanId && startDate;
    }, [selectedLocationId, selectedCropKey, selectedVarietyId, selectedPlanId, startDate]);

    const handleSubmit = async () => {
        if (!isFormValid) return;

        await createPlan.mutateAsync({
            cropId: selectedCropKey,
            varietyId: selectedVarietyId,
            cultivationPlanId: selectedPlanId,
            startDate,
            locationId: selectedLocationId,
        });

        onSuccess();
        onClose();
        resetForm();
    };

    const resetForm = () => {
        setSelectedLocationId(preSelectedLocationId || '');
        setSelectedCropKey('');
        setSelectedVarietyId('');
        setSelectedPlanId('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setCropSearch('');
        setVarietySearch('');
        setLocationSearch('');
        setLocationTypeFilter('all');
    };

    const getLocationTypeIcon = (type: CultivationArea['type']) => {
        switch (type) {
            case 'field':
                return '🌾';
            case 'greenhouse':
                return '🌱';
            case 'plot':
                return '📍';
            case 'bed':
                return '📦';
            default:
                return '📌';
        }
    };

    const getLocationTypeText = (type: CultivationArea['type']) => {
        switch (type) {
            case 'field':
                return 'Поле';
            case 'greenhouse':
                return 'Теплица';
            case 'plot':
                return 'Участок';
            case 'bed':
                return 'Грядка';
            default:
                return 'Место';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}
               title={`Посеять ${selectedCrop ? selectedCrop.name : '__'} на ${selectedLocation ? selectedLocation.name : "__"}`}
               size="full">
            <div className="flex flex-col lg:flex-row gap-6 max-h-[75vh] overflow-y-auto">

                {/* Левая колонка - выбор места */}
                <div className="lg:w-1/3 space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600"/>
                            Место посадки *
                        </h3>

                        <div className="space-y-3">
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {locationsLoading ? (
                                    <div className="text-center py-4">Загрузка...</div>
                                ) : (
                                    filteredLocations.map((location) => (
                                        <button
                                            key={location.id}
                                            onClick={() => setSelectedLocationId(location.id)}
                                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                                                selectedLocationId === location.id
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{getLocationTypeIcon(location.type)}</span>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">{location.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {getLocationTypeText(location.type)} • {location.area} {location.areaUnit}
                                                    </p>
                                                </div>
                                                {selectedLocationId === location.id && (
                                                    <Check className="w-4 h-4 text-green-500"/>
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                    {/* Дополнительные параметры */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600"/>
                            Детали плана
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Дата начала *
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>

                            {/* Информация о расчетах */}
                            {selectedLocation && selectedVariety && calculateRequiredPlants && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mt-3">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                                        📊 Предварительный расчет
                                    </p>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span>Площадь:</span>
                                            <span className="font-medium">
                        {selectedLocation.area} {selectedLocation.areaUnit}
                      </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Необходимо растений:</span>
                                            <span className="font-medium text-green-700">
                        {calculateRequiredPlants.amount} {calculateRequiredPlants.unit}
                      </span>
                                        </div>
                                        {selectedVariety.daysToMaturity && (
                                            <div className="flex justify-between">
                                                <span>Плановый сбор:</span>
                                                <span className="font-medium">
                          {new Date(new Date(startDate).setDate(new Date(startDate).getDate() + selectedVariety.daysToMaturity)).toLocaleDateString('ru')}
                        </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Средняя колонка - выбор культуры, сорта, плана */}
                <div className="lg:w-1/3 space-y-4">
                    {/* Выбор культуры */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Sprout className="w-4 h-4 text-green-600"/>
                            Культура *
                        </h3>


                        <div className="grid grid-cols-2 gap-2 max-h-100 overflow-y-auto">
                            {cropsLoading ? (
                                <div className="col-span-3 text-center py-4">Загрузка...</div>
                            ) : (
                                filteredCrops.map((crop) => (
                                    <button
                                        key={crop.key}
                                        onClick={() => {
                                            setSelectedCropKey(crop.key);
                                            setSelectedVarietyId('');
                                            setSelectedPlanId('');
                                        }}
                                        className={`p-2 rounded-lg border text-left transition-all ${
                                            selectedCropKey === crop.key
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{getCropIcon(crop.name)}</span>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">{crop.name}</p>
                                                <p className="text-xs text-gray-500">{crop.category}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                {/* Правая колонка - выбор культуры, сорта, плана */}
                <div className="lg:w-1/3 space-y-4">
                    {/* Выбор сорта */}
                    {selectedCropKey && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Leaf className="w-4 h-4 text-green-600"/>
                                Сорт *
                            </h3>

                            <input
                                type="text"
                                placeholder="Поиск сорта..."
                                value={varietySearch}
                                onChange={(e) => setVarietySearch(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm mb-3"
                            />

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {varietiesLoading ? (
                                    <div className="text-center py-4">Загрузка...</div>
                                ) : (
                                    varieties
                                        ?.filter(v => v.name.toLowerCase().includes(varietySearch.toLowerCase()))
                                        .map((variety) => (
                                            <button
                                                key={variety.id}
                                                onClick={() => setSelectedVarietyId(variety.id)}
                                                className={`w-full p-3 rounded-lg border text-left transition-all ${
                                                    selectedVarietyId === variety.id
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{variety.name}</p>
                                                        <div
                                                            className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                                                            <span>Созревание: {variety.daysToMaturity} дн.</span>
                                                            <span>Урожайность: {variety.yieldPotential} ц/га</span>
                                                            <span>Высота: {variety.plantHeight} м</span>
                                                        </div>
                                                    </div>
                                                    {selectedVarietyId === variety.id && (
                                                        <Check className="w-4 h-4 text-green-500 shrink-0"/>
                                                    )}
                                                </div>
                                            </button>
                                        ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Выбор плана выращивания */}
                    {selectedCropKey && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600"/>
                                План выращивания *
                            </h3>

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {plansLoading ? (
                                    <div className="text-center py-4">Загрузка...</div>
                                ) : (
                                    cultivationPlans?.map((plan) => (
                                        <button
                                            key={plan.id}
                                            onClick={() => setSelectedPlanId(plan.id)}
                                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                                                selectedPlanId === plan.id
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{plan.name}</p>
                                                    {plan.description && (
                                                        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                                                    )}
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {plan.steps.slice(0, 3).map((step, idx) => (
                                                            <span key={idx}
                                                                  className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                                {step.type === 'watering' && '💧 Полив'}
                                                                {step.type === 'fertilizing' && '🧪 Подкормка'}
                                                                {step.type === 'spraying' && '🐛 Обработка'}
                                                                {step.type === 'harvesting' && '✂️ Сбор'}
                              </span>
                                                        ))}
                                                        {plan.steps.length > 3 && (
                                                            <span
                                                                className="text-xs text-gray-400">+{plan.steps.length - 3} ещё</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedPlanId === plan.id && (
                                                    <Check className="w-4 h-4 text-green-500 shrink-0"/>
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}


                </div>
            </div>

            {/* Footer с кнопками */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => {
                        resetForm();
                        onClose();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    <X className="w-4 h-4"/>
                    Отмена
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isFormValid || createPlan.isPending}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {createPlan.isPending ? (
                        <>
                            <div
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                            Сохранение...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4"/>
                            Создать план
                        </>
                    )}
                </button>
            </div>
        </Modal>
    );
};