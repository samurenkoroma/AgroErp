import {useEffect, useMemo, useState} from 'react';
import {Check, Droplets, Leaf, Loader2, MapPin, Package, Save, X} from 'lucide-react';
import {Modal} from '@/components/common/Modal.tsx';
import {PlantingRecord} from "@/entities/planning/types.ts";
import {getCropIcon} from "@/utils/cropIcons.ts";
import {useVarieties} from "@/features/catalog/queries/useVariety.ts";
import {Crop, Variety} from "@/entities";
import {useSeasonOptions} from "@/features/season/queries/useSeasons.ts";

interface PlantingRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (record: PlantingRecord) => void;
    object: {
        id: string;
        name: string;
        type: 'field' | 'bed';
        area: number; // Всегда в гектарах
    };
    availableCrops: Crop[];
    initialData?: PlantingRecord;
}

export const PlantingRecordModal = ({
                                        isOpen,
                                        onClose,
                                        onSave,
                                        object,
                                        availableCrops,
                                        initialData,
                                    }: PlantingRecordModalProps) => {
    const [selectedCropKey, setSelectedCropKey] = useState<string>(initialData?.cropId || '');
    const [selectedVarietyId, setSelectedVarietyId] = useState<string>(initialData?.varietyId || '');
    const [selectedSeason, setSelectedSeason] = useState<number>(initialData?.season || new Date().getFullYear());
    const [plantingDate, setPlantingDate] = useState<string>(initialData?.plantingDate || new Date().toISOString().split('T')[0]);
    const [harvestDate, setHarvestDate] = useState<string>(initialData?.harvestDate || '');
    const [status, setStatus] = useState<PlantingRecord['status']>(initialData?.status || 'sown');
    const [actualYield, setActualYield] = useState<number | undefined>(initialData?.actualYield);
    const [notes, setNotes] = useState<string>(initialData?.notes || '');

    // Загружаем сорта для выбранной культуры
    const {
        data: varietiesData,
        isLoading: isLoadingVarieties,
        error: varietiesError
    } = useVarieties(selectedCropKey);

    // Доступные сорта для выбранной культуры
    const varietiesForCrop = useMemo(() => {
        if (!selectedCropKey || !varietiesData) return [];
        return varietiesData || [];
    }, [selectedCropKey, varietiesData]);

    // Получаем выбранную культуру и сорт
    const selectedCrop = useMemo(() => {
        return availableCrops.find(c => c.key === selectedCropKey);
    }, [selectedCropKey, availableCrops]);

    const selectedVariety = useMemo(() => {
        if (!selectedVarietyId) return null;
        return varietiesForCrop.find((v: Variety) => v.id === selectedVarietyId);
    }, [selectedVarietyId, varietiesForCrop]);

    // Доступные сезоны (текущий и прошлые 5 лет)
    const {data: availableSeasons} = useSeasonOptions()

    // Получение нормы высева для конкретного типа выращивания
    const getSeedingRateForGrowingType = (variety: Variety, objectType: string) => {
        // Определяем ключ для поиска в seedingRates
        let growingTypeKey = '';

        if (objectType === 'field') {
            growingTypeKey = 'open_ground';
        } else {
            // Для bed (грядка) используем greenhouse
            growingTypeKey = 'greenhouse';
        }

        if (!variety.seedingRates) return null;

        // Прямой доступ по ключу
        if (variety.seedingRates[growingTypeKey]) {
            return variety.seedingRates[growingTypeKey];
        }

        // Поиск по полю growing_type
        const rate = Object.values(variety.seedingRates).find(
            (rate: any) => rate.growing_type === growingTypeKey
        );
        if (rate) return rate;

        // Если не нашли, берем первый доступный
        const firstRate = Object.values(variety.seedingRates)[0];
        if (firstRate) return firstRate;

        return null;
    };

    // Расчет количества растений
    const calculateSeedsAmount = useMemo(() => {
        if (!selectedVariety) return null;

        // Площадь всегда в гектарах от бэкенда
        const areaHa = object.area;
        if (!areaHa || areaHa <= 0) return null;

        // Получаем норму высева для типа выращивания
        const seedingRate = getSeedingRateForGrowingType(selectedVariety, object.type);

        if (!seedingRate) return null;

        // Расчет количества растений на квадратный метр
        // plant_spacing и row_spacing в метрах
        const rowSpacing = seedingRate.rowSpacing;
        const plantSpacing = seedingRate.plantSpacing;

        if (!rowSpacing || !plantSpacing || rowSpacing <= 0 || plantSpacing <= 0) return null;

        // Количество растений на 1 м²
        const plantsPerM2 = 1 / (rowSpacing * plantSpacing);

        // Переводим гектары в квадратные метры (1 га = 10000 м²)
        const areaM2 = areaHa * 10000;

        // Общее количество растений
        const totalPlants = plantsPerM2 * areaM2;

        // Учитываем коэффициент запаса (обычно 1.05-1.15 для компенсации потерь)
        const safetyFactor = seedingRate.safetyFactor || 1.1;
        const totalWithSafety = totalPlants * safetyFactor;

        // Округляем до целого числа
        const roundedAmount = Math.round(totalWithSafety);

        if (roundedAmount < 1) return {amount: 0, unit: 'шт'};
        if (roundedAmount < 1000) return {amount: roundedAmount, unit: 'шт'};
        return {amount: Number((roundedAmount / 1000).toFixed(1)), unit: 'тыс. шт'};
    }, [selectedVariety, object]);

    // Сброс формы
    const resetForm = () => {
        setSelectedCropKey('');
        setSelectedVarietyId('');
        setSelectedSeason(new Date().getFullYear());
        setPlantingDate(new Date().toISOString().split('T')[0]);
        setHarvestDate('');
        setStatus('sown');
        setActualYield(undefined);
        setNotes('');
    };

    // Обработка сохранения
    const handleSave = () => {
        if (!selectedCrop || !plantingDate) return;

        const record: PlantingRecord = {
            objectId: object.id,
            objectName: object.name,
            objectType: object.type,
            season: selectedSeason,
            cropId: selectedCrop.key,
            cropName: selectedCrop.name,
            varietyId: selectedVarietyId || undefined,
            varietyName: selectedVariety?.name,
            plantingDate,
            harvestDate: harvestDate || undefined,
            status,
            area: object.area,
            seedsAmount: calculateSeedsAmount?.amount || 0,
            seedsUnit: calculateSeedsAmount?.unit || 'шт',
            actualYield: actualYield,
            yieldUnit: 'ц/га',
            notes: notes || undefined,
        };

        onSave(record);
        resetForm();
        onClose();
    };

    // Проверка, выбран ли сорт (для отображения расчета)
    const isVarietySelected = !!selectedVariety;

    // Опции статуса для кнопок
    const statusOptions = [
        {value: 'planned', label: 'Запланировано', icon: '📋', color: 'blue'},
        {value: 'sown', label: 'Посеяно', icon: '🌱', color: 'green'},
        {value: 'growing', label: 'Растет', icon: '🌿', color: 'emerald'},
        {value: 'harvested', label: 'Собрано', icon: '🏆', color: 'orange'},
        {value: 'failed', label: 'Погибло', icon: '💀', color: 'red'}
    ] as const;

    // Сбрасываем выбранный сорт при смене культуры
    useEffect(() => {
        setSelectedVarietyId('');
    }, [selectedCropKey]);

    // Форматирование урожайности для отображения
    const formatYieldPotential = (variety: Variety) => {
        if (variety.yieldPotential) {
            return `${variety.yieldPotential} ц/га`;
        }
        return '—';
    };

    // Форматирование площади для отображения
    const formatAreaDisplay = (area: number) => {
        if (area < 0.01) {
            // Если меньше 0.01 га (100 м²), показываем в м²
            const squareMeters = area * 10000;
            return `${Math.round(squareMeters)} м²`;
        }
        return `${area.toFixed(2)} га`;
    };

    // Отладочная информация (можно убрать после проверки)
    useEffect(() => {
        if (selectedVariety && calculateSeedsAmount) {
            console.log('=== Расчет количества ===');
            console.log('Объект:', object.name, 'Тип:', object.type);
            console.log('Площадь (га):', object.area);
            console.log('Площадь (м²):', object.area * 10000);
            console.log('Сорт:', selectedVariety.name);
            console.log('Результат:', calculateSeedsAmount.amount, calculateSeedsAmount.unit);

            const seedingRate = getSeedingRateForGrowingType(selectedVariety, object.type);
            if (seedingRate) {
                console.log('Схема посадки:', seedingRate.rowSpacing, 'x', seedingRate.plantSpacing, 'м');
                console.log('Коэффициент запаса:', seedingRate.safetyFactor);
                console.log('Растений на м²:', (1 / (seedingRate.rowSpacing * seedingRate.plantSpacing)).toFixed(2));
            }
        }
    }, [selectedVariety, calculateSeedsAmount, object]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                resetForm();
                onClose();
            }}
            title="Фиксация посадки"
            size="full"
        >
            <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
                {/* Информация об объекте */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{object.name}</p>
                            <p className="text-sm text-gray-500">
                                {object.type === 'field' ? 'Поле' : 'Грядка'} •
                                Площадь: {formatAreaDisplay(object.area)}
                            </p>
                        </div>

                        <div className="ml-auto flex gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Сезон
                                </label>
                                <select
                                    value={selectedSeason}
                                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                                    className="w-32 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                >
                                    {availableSeasons && availableSeasons.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Дата посадки *
                                </label>
                                <input
                                    type="date"
                                    value={plantingDate}
                                    onChange={(e) => setPlantingDate(e.target.value)}
                                    className="w-36 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Дата сбора
                                </label>
                                <input
                                    type="date"
                                    value={harvestDate}
                                    onChange={(e) => setHarvestDate(e.target.value)}
                                    className="w-36 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Выбор культуры и статус */}
                <div className="grid grid-cols-4 gap-6">
                    {/* Культуры */}
                    <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Культура *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {availableCrops.map(crop => (
                                <button
                                    key={crop.key}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCropKey(crop.key);
                                        setSelectedVarietyId('');
                                    }}
                                    className={`
                                        p-3 rounded-lg border transition-all text-left
                                        ${selectedCropKey === crop.key
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                    }
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{getCropIcon(crop.name)}</span>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{crop.name}</p>
                                            <p className="text-xs text-gray-500">{crop.category}</p>
                                        </div>
                                        {selectedCropKey === crop.key && (
                                            <Check className="w-4 h-4 text-green-500 ml-auto"/>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Статус */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                            Статус
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {statusOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setStatus(option.value as PlantingRecord['status'])}
                                    className={`
                                        p-2 rounded-lg border transition-all text-center
                                        ${status === option.value
                                        ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20 ring-2 ring-${option.color}-500`
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }
                                    `}
                                >
                                    <span className="text-xl">{option.icon}</span>
                                    <p className="text-xs font-medium mt-1">{option.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Выбор сорта - загружается динамически */}
                {selectedCrop && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <Leaf className="w-4 h-4"/>
                                Сорт
                            </div>
                        </label>

                        {/* Состояние загрузки */}
                        {isLoadingVarieties && (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-gray-500"/>
                                <span className="ml-2 text-sm text-gray-500">Загрузка сортов...</span>
                            </div>
                        )}

                        {/* Ошибка загрузки */}
                        {varietiesError && (
                            <div
                                className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                <p className="text-sm text-red-700 dark:text-red-300 text-center">
                                    Ошибка загрузки сортов. Попробуйте позже.
                                </p>
                            </div>
                        )}

                        {/* Выбор сорта */}
                        {!isLoadingVarieties && !varietiesError && (
                            <>
                                <select
                                    value={selectedVarietyId}
                                    onChange={(e) => setSelectedVarietyId(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    disabled={varietiesForCrop.length === 0}
                                >
                                    <option value="">-- Не выбран --</option>
                                    {varietiesForCrop.map((variety: Variety) => (
                                        <option key={variety.id} value={variety.id}>
                                            {variety.name} ({variety.daysToMaturity} дн.)
                                        </option>
                                    ))}
                                </select>

                                {varietiesForCrop.length === 0 && (
                                    <p className="text-sm text-gray-500 mt-1 text-center">
                                        Нет доступных сортов для выбранной культуры
                                    </p>
                                )}
                            </>
                        )}

                        {/* Информация о сорте */}
                        {selectedVariety && (
                            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                                    Информация о сорте
                                </p>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Созревание:</span>
                                        <span className="ml-1 font-medium">{selectedVariety.daysToMaturity} дней</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Высота:</span>
                                        <span className="ml-1 font-medium">{selectedVariety.plantHeight} м</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Урожайность:</span>
                                        <span
                                            className="ml-1 font-medium">{formatYieldPotential(selectedVariety)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Схема посадки:</span>
                                        {(() => {
                                            const seedingRate = getSeedingRateForGrowingType(selectedVariety, object.type);
                                            if (seedingRate) {
                                                return (
                                                    <span className="ml-1 font-medium">
                                                        {seedingRate.rowSpacing}×{seedingRate.plantSpacing} м
                                                    </span>
                                                );
                                            }
                                            return <span className="ml-1 text-gray-400">—</span>;
                                        })()}
                                    </div>
                                </div>

                                {/* Требования к поливу */}
                                {selectedVariety.waterRequirement && (
                                    <div className="mt-3 pt-2 border-t border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Droplets className="w-3 h-3"/>
                                            <span>Полив: {selectedVariety.waterRequirement.dailyNeedOpt} л/м²/день</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Предупреждение о необходимости выбора сорта для расчета */}
                {selectedCrop && !isVarietySelected && !isLoadingVarieties && (
                    <div
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                            💡 Выберите сорт для расчета необходимого количества рассады/семян
                        </p>
                    </div>
                )}

                {/* Расчет количества (только если выбран сорт) */}
                {selectedCrop && isVarietySelected && calculateSeedsAmount && calculateSeedsAmount.amount > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-gray-500"/>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Необходимое количество
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            {calculateSeedsAmount.amount.toLocaleString()} {calculateSeedsAmount.unit}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Расчет на основе схемы посадки для сорта "{selectedVariety.name}"
                        </p>
                        <div className="text-xs text-gray-400 mt-2">
                            Площадь: {formatAreaDisplay(object.area)} •
                            Схема: {(() => {
                            const seedingRate = getSeedingRateForGrowingType(selectedVariety, object.type);
                            if (seedingRate) {
                                return `${seedingRate.rowSpacing}×${seedingRate.plantSpacing} м`;
                            }
                            return '—';
                        })()}
                        </div>
                    </div>
                )}

                {/* Если расчет дал 0 - показываем предупреждение */}
                {selectedCrop && isVarietySelected && calculateSeedsAmount && calculateSeedsAmount.amount === 0 && (
                    <div
                        className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
                            ⚠️ Невозможно рассчитать количество. Проверьте схему посадки для этого сорта.
                        </p>
                    </div>
                )}

                {/* Урожайность (для завершенных) */}
                {status === 'harvested' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <Droplets className="w-4 h-4"/>
                                Фактическая урожайность
                            </div>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={actualYield || ''}
                                onChange={(e) => setActualYield(Number(e.target.value))}
                                placeholder="Урожайность"
                                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                step="0.1"
                            />
                            <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                                ц/га
                            </span>
                        </div>
                    </div>
                )}

                {/* Заметки */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Заметки
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Дополнительная информация..."
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none"
                    />
                </div>
            </div>

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
                    onClick={handleSave}
                    disabled={!selectedCrop || !plantingDate}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4"/>
                    Сохранить посадку
                </button>
            </div>
        </Modal>
    );
};

export default PlantingRecordModal;