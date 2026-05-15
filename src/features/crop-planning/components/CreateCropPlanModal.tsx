// src/features/crop-planning/components/CreateCropPlanModal.tsx
import {useEffect, useMemo, useState} from 'react';
import {Calendar, Check, ChevronDown, ChevronUp, FileText, Leaf, MapPin, Save, Sprout, X} from 'lucide-react';
import {Modal} from '@/components/common/Modal';
import {useCultivationPlans} from '../hooks/useCultivationPlans';
import {useCreateCropPlan} from '../hooks/useCropPlans';
import {getCropIcon} from '@/utils/cropIcons';
import {CultivationArea} from "@/entities/planning/types.ts";
import {useGreenhouseCrops} from "@/features/catalog/queries/useCrop.ts";
import {useVarieties} from "@/features/catalog/queries/useVariety.ts";
import {useCultivationAreasByObject} from "@/features/crop-planning/hooks/useCultivationAreas.ts";
import {CropPlanPreview} from "@/features/crop-planning/components/CropPlanPreview.tsx";
import {formatArea} from "@/utils/geometry.ts";
import {useSeasonOptions} from "@/features/season/queries/useSeasons.ts";
import {Select} from "@/components/common/Select.tsx";

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
                                        objectId,
                                    }: CreateCropPlanModalProps) => {
    // Основные состояния формы
    const [selectedLocationId, setSelectedLocationId] = useState<string>(preSelectedLocationId || '');
    const [selectedCropKey, setSelectedCropKey] = useState<string>('');
    const [selectedVarietyId, setSelectedVarietyId] = useState<string>('');
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Состояния для поиска
    const [cropSearch, setCropSearch] = useState('');
    const [varietySearch, setVarietySearch] = useState('');

    // ✅ Состояние для аккордеонов - изначально все развернуты
    const [expandedSections, setExpandedSections] = useState({
        location: true,
        season: true,
        crop: false,
        variety: false,
        plan: false,
    });

    // API данные
    const {data: crops, isLoading: cropsLoading} = useGreenhouseCrops();
    const {data: seasonOption} = useSeasonOptions()
    const {data: varieties, isLoading: varietiesLoading} = useVarieties(selectedCropKey);
    const {data: cultivationPlans, isLoading: plansLoading} = useCultivationPlans(selectedCropKey);
    const {data: locations, isLoading: locationsLoading} = useCultivationAreasByObject({objectId});
    const createPlan = useCreateCropPlan();

    // ✅ Эффект для инициализации при монтировании и открытии модалки
    useEffect(() => {
        if (isOpen && preSelectedLocationId) {
            setSelectedLocationId(preSelectedLocationId);
            // После выбора локации, раскрываем секцию культуры
            setExpandedSections(prev => ({
                ...prev,
                location: false,  // сворачиваем локацию
                crop: true,       // разворачиваем культуру
            }));
        }
    }, [isOpen, preSelectedLocationId]);

    // ✅ Эффект для проверки загрузки локаций и установки выбранной
    useEffect(() => {
        if (isOpen && preSelectedLocationId && locations && locations.length > 0) {
            const locationExists = locations.some(l => l.id === preSelectedLocationId);
            if (locationExists && !selectedLocationId) {
                setSelectedLocationId(preSelectedLocationId);
            }
        }
    }, [isOpen, preSelectedLocationId, locations, selectedLocationId]);

    // Выбранные объекты
    const selectedLocation = useMemo(() => {
        return locations?.find(l => l.id === selectedLocationId);
    }, [locations, selectedLocationId]);

    const selectedCrop = useMemo(() => {
        return crops?.find(c => c.key === selectedCropKey);
    }, [crops, selectedCropKey]);

    const selectedSeason = useMemo(() => {
        return seasonOption?.find(s => s.value === selectedSeasonId);
    }, [selectedSeasonId, seasonOption]);

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


    // // Расчет необходимого количества растений
    // const calculateRequiredPlants = useMemo(() => {
    //     if (!selectedLocation || !selectedVariety) return null;
    //
    //     const seedingRate = selectedVariety.seedingRates?.[
    //         selectedLocation.type === 'field' ? 'open_ground' : 'greenhouse'
    //         ];
    //
    //     if (!seedingRate) return null;
    //
    //     const plantsPerM2 = 1 / (seedingRate.rowSpacing * seedingRate.plantSpacing);
    //     let areaM2 = selectedLocation.areaUnit === 'ha'
    //         ? selectedLocation.area * 10000
    //         : selectedLocation.area;
    //
    //     const totalPlants = plantsPerM2 * areaM2;
    //     const totalWithSafety = totalPlants * (seedingRate.safety_factor || 1.1);
    //
    //     if (totalWithSafety < 1000) {
    //         return {amount: Math.round(totalWithSafety), unit: 'шт'};
    //     }
    //     return {amount: (totalWithSafety / 1000).toFixed(1), unit: 'тыс. шт'};
    // }, [selectedLocation, selectedVariety]);

    // Валидация формы
    const isFormValid = useMemo(() => {
        // return selectedLocationId && selectedCropKey && selectedVarietyId && selectedPlanId && startDate;
        return selectedLocationId && selectedCropKey && selectedPlanId && selectedSeasonId;
    }, [selectedLocationId, selectedCropKey,  selectedPlanId, selectedSeasonId]);

    const handleSubmit = async () => {
        if (!isFormValid) return;

        await createPlan.mutateAsync({
            varietyId: selectedVarietyId?selectedVarietyId:undefined ,
            cultivationPlanId: selectedPlanId,
            seasonId: selectedSeasonId,
            areaId: selectedLocationId,
        });

        onSuccess();
        resetForm();
    };

    const resetForm = () => {
        setSelectedLocationId('');
        setSelectedCropKey('');
        setSelectedSeasonId('');
        setSelectedVarietyId('');
        setSelectedPlanId('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setCropSearch('');
        setVarietySearch('');
        // Сбрасываем аккордеоны в открытое состояние
        setExpandedSections({
            location: true,
            season: true,
            crop: false,
            variety: false,
            plan: false
        });
        onClose();

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
        <Modal isOpen={isOpen} onClose={resetForm} title="Создание посева" size="full">
            <div className="h-full flex flex-col">
                <div className="flex-1 flex flex-col lg:flex-row gap-6 ">
                    <div className="lg:w-2/5 space-y-4">
                        {/*  выбор места */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        {/* Заголовок места - кликабельный */}
                        <button
                            onClick={() => setExpandedSections(prev => ({...prev, location: true}))}
                            className="w-full flex items-center justify-between"
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-green-600"/>
                                Место посадки:
                                {selectedLocation && (
                                    <span
                                        className="ml-2 text-sm font-normal text-green-600 dark:text-green-400"> {selectedLocation.name}</span>
                                )}
                            </h3>
                            <div className="text-gray-400">
                                {expandedSections.location ? <ChevronUp className="w-5 h-5"/> :
                                    <ChevronDown className="w-5 h-5"/>}
                            </div>
                        </button>

                        {expandedSections.location && (
                            <div className="mt-3 space-y-3">
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {locationsLoading ? (
                                        <div className="text-center py-4">Загрузка...</div>
                                    ) : (
                                        locations && locations.map((location) => (
                                            <button
                                                key={location.id}
                                                onClick={() => {
                                                    setExpandedSections(prev => ({
                                                        ...prev,
                                                        location: false,
                                                        crop: true
                                                    }))
                                                    setSelectedLocationId(location.id)
                                                }
                                                }
                                                className={`w-full p-3 rounded-lg border text-left transition-all ${
                                                    selectedLocationId === location.id
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-green-500'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="text-xl">{getLocationTypeIcon(location.type)}</span>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">{location.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {getLocationTypeText(location.type)} • {formatArea(location.area)}
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
                        )}
                    </div>
                        {/* Выбор культуры - Аккордеон с анимацией */}

                        {selectedLocation && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <button
                                    onClick={() => setExpandedSections(prev => ({...prev, crop: !prev.crop}))}
                                    className="w-full flex items-center justify-between group"
                                >
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Sprout
                                            className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform"/> Культура
                                        {selectedCrop && (
                                            <span
                                                className="ml-2 text-sm font-normal text-green-600 dark:text-green-400 animate-fadeIn">{selectedCrop.name}</span>
                                        )}
                                    </h3>
                                    <div
                                        className={`text-gray-400 transition-transform duration-200 ${expandedSections.crop ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="w-5 h-5"/>
                                    </div>
                                </button>

                                {/* Контент с анимацией */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        expandedSections.crop ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                        {cropsLoading ? (
                                            <div className="col-span-2 text-center py-4">Загрузка...</div>
                                        ) : (
                                            filteredCrops.map((crop) => (
                                                <button
                                                    key={crop.key}
                                                    onClick={() => {
                                                        setSelectedCropKey(crop.key);
                                                        setSelectedVarietyId('');
                                                        setSelectedPlanId('');
                                                        // ✅ Сворачиваем блок культуры после выбора
                                                        setExpandedSections(prev => ({...prev, crop: false}));
                                                        // ✅ Разворачиваем блок сорта (если нужно)
                                                        setExpandedSections(prev => ({
                                                            ...prev,
                                                            variety: true,
                                                            plan: true
                                                        }));
                                                    }}
                                                    className={`p-2 rounded-lg border text-left transition-all ${
                                                        selectedCropKey === crop.key
                                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-green-500'
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

                        )}

                        {selectedCropKey && varieties && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <button
                                onClick={() => setExpandedSections(prev => ({...prev, variety: !prev.variety}))}
                                className="w-full flex items-center justify-between"
                            >
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Leaf className="w-4 h-4 text-green-600"/>Сорт
                                    {selectedVariety && (
                                        <span
                                            className="ml-2 text-sm font-normal text-green-600 dark:text-green-400">{selectedVariety.name}</span>
                                    )}
                                </h3>
                                <div className="text-gray-400">
                                    {expandedSections.variety ? <ChevronUp className="w-5 h-5"/> :
                                        <ChevronDown className="w-5 h-5"/>}
                                </div>
                            </button>

                            {expandedSections.variety && (
                                <div className="mt-3">
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {varietiesLoading ? (
                                            <div className="text-center py-4">Загрузка...</div>
                                        ) : (
                                            varieties
                                                ?.filter(v => v.name.toLowerCase().includes(varietySearch.toLowerCase()))
                                                .map((variety) => (
                                                    <button
                                                        key={variety.id}
                                                        onClick={() => {
                                                            setSelectedVarietyId(variety.id);
                                                            // ✅ Сворачиваем блок сорта после выбора
                                                            setExpandedSections(prev => ({...prev, variety: false}));
                                                            // ✅ Разворачиваем блок плана (если нужно)
                                                            setExpandedSections(prev => ({...prev, plan: true}));
                                                        }}
                                                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                                                            selectedVarietyId === variety.id
                                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20  ring-green-500'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <p className="font-medium text-gray-900 dark:text-white">{variety.name}</p>
                                                            <div
                                                                className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                                                                <span>Созревание: {variety.daysToMaturity} дн.</span>
                                                                <span>Урожайность: {variety.yieldPotential} ц/га</span>
                                                                <span>Высота: {variety.plantHeight} м</span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {selectedCropKey && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <button
                                onClick={() => setExpandedSections(prev => ({...prev, plan: !prev.plan}))}
                                className="w-full flex items-center justify-between"
                            >
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600"/>
                                    Метод выращивания
                                    {selectedPlan && (
                                        <span
                                            className="ml-2 text-sm font-normal text-blue-600 dark:text-blue-400">{selectedPlan.name}</span>
                                    )}
                                </h3>
                                <div className="text-gray-400">
                                    {expandedSections.plan ? <ChevronUp className="w-5 h-5"/> :
                                        <ChevronDown className="w-5 h-5"/>}
                                </div>
                            </button>

                            {expandedSections.plan && (
                                <div className="mt-3">
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {plansLoading ? (
                                            <div className="text-center py-4">Загрузка...</div>
                                        ) : (
                                            cultivationPlans?.map((plan) => (
                                                <button
                                                    key={plan.id}
                                                    onClick={() => {
                                                        setSelectedPlanId(plan.id);
                                                        // ✅ Сворачиваем блок плана после выбора
                                                        setExpandedSections(prev => ({...prev, plan: false}));
                                                    }}
                                                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                                                        selectedPlanId === plan.id
                                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-green-500'
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

                    )}

                        {seasonOption && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <button
                                    onClick={() => setExpandedSections(prev => ({...prev, season: !prev.season}))}
                                    className="w-full flex items-center justify-between"
                                >
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-600"/>
                                        Сезон
                                        {selectedSeason && (
                                            <span
                                                className="ml-2 text-sm font-normal text-blue-600 dark:text-blue-400">{selectedSeason.label}</span>
                                        )}
                                    </h3>
                                    <div className="text-gray-400">
                                        {expandedSections.season ? <ChevronUp className="w-5 h-5"/> :
                                            <ChevronDown className="w-5 h-5"/>}
                                    </div>
                                </button>

                                {expandedSections.season && (
                                    <div className="mt-3">
                                        <Select
                                            value={selectedSeasonId}
                                            onChange={(value) => {
                                                setExpandedSections(prev => ({...prev, season: !prev.season}))
                                                setSelectedSeasonId(value)
                                            }}
                                            options={seasonOption}
                                            placeholder="Выберите сезон"
                                            // label="Сезон"
                                            required
                                            // searchable
                                            // clearable
                                            size="md"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedLocation && selectedCrop && selectedPlan && selectedSeason &&
                            <div className="text-center">
                                <p className="text-lg text-red-300 mt-1">
                                    Проверьте введенные данные перед сохранением
                                </p>
                            </div>}
                    </div>
                    <div className="lg:w-3/5 space-y-4">
                        {selectedLocation && selectedCrop && selectedPlan &&

                            (<CropPlanPreview
                                area={selectedLocation}
                                crop={selectedCrop}
                                variety={selectedVariety}
                                cultivationPlan={selectedPlan}
                                startDate={startDate}
                            />)}
                </div>


                </div>

            {/* Footer с кнопками */}
                <div className='shrink-0'>

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
                </div>
            </div>
        </Modal>
    );
};