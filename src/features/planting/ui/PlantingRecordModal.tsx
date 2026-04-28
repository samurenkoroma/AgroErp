import {useEffect, useMemo, useState} from 'react';
import {AlertTriangle, Check, Droplets, Leaf, MapPin, Package, Save, X} from 'lucide-react';
import {Modal} from '@/components/common/Modal';
import {mockVarieties} from "@/data/mockVarieties.ts";
import {formatArea} from "@/utils/geometry.ts";
import {PlantingRecord} from "@/entities/planting/model/types.ts";
import {CropVariety} from "@/entities";

interface PlantingRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (record: PlantingRecord) => void;
    object: {
        id: string;
        name: string;
        type: 'field' | 'bed';
        area: number;
    };
    availableCrops: {
        id: string;
        name: string;
        category: string;
        icon?: string;
        seedingRate: {
            type: 'seeds' | 'seedlings';
            value: number;
            unit: string;
        };
    }[];
    availableVarieties: CropVariety[];
    initialData?: PlantingRecord;
}


export const PlantingRecordModal = ({
                                        isOpen,
                                        onClose,
                                        onSave,
                                        object,
                                        availableCrops,
                                        availableVarieties = mockVarieties,
                                        initialData,
                                    }: PlantingRecordModalProps) => {
    const [selectedCropId, setSelectedCropId] = useState<string>(initialData?.cropId || '');
    const [selectedVarietyId, setSelectedVarietyId] = useState<string>(initialData?.varietyId || '');
    const [selectedSeason, setSelectedSeason] = useState<number>(initialData?.season || new Date().getFullYear());
    const [plantingDate, setPlantingDate] = useState<string>(initialData?.plantingDate || new Date().toISOString().split('T')[0]);
    const [harvestDate, setHarvestDate] = useState<string>(initialData?.harvestDate || '');
    const [status, setStatus] = useState<PlantingRecord['status']>(initialData?.status || ('sown'));
    const [actualYield, setActualYield] = useState<number | undefined>(initialData?.actualYield);
    const [notes, setNotes] = useState<string>(initialData?.notes || '');
    const [showVarietyWarning, setShowVarietyWarning] = useState(false);

    // Получаем выбранную культуру и сорт
    const selectedCrop = useMemo(() => {
        return availableCrops.find(c => c.id === selectedCropId);
    }, [selectedCropId, availableCrops]);

    const selectedVariety = useMemo(() => {
        if (!selectedVarietyId) return null;
        return availableVarieties.find(v => v.id === selectedVarietyId && v.cropId === selectedCropId);
    }, [selectedVarietyId, selectedCropId, availableVarieties]);

    // Доступные сорта для выбранной культуры
    const varietiesForCrop = useMemo(() => {
        if (!selectedCropId) return [];
        return availableVarieties.filter(v => v.cropId === selectedCropId);
    }, [selectedCropId, availableVarieties]);

    // Доступные сезоны (текущий и прошлые 5 лет)
    const availableSeasons = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const seasons = [];
        for (let i = 0; i <= 5; i++) {
            seasons.push(currentYear - i);
        }
        return seasons;
    }, []);

    // Расчет количества семян/рассады
    const calculateSeedsAmount = useMemo(() => {
        if (!selectedCrop) return null;

        const area = object.area;
        const areaUnit = object.type === 'field' ? 'ha' : 'm2';
        let areaInUnit = areaUnit === 'ha' ? area : area;


        // Используем норму из сорта если есть, иначе из культуры
        const seedingRate = selectedVariety?.seedingRate || selectedCrop.seedingRate;

        if (seedingRate.type === 'seeds') {
            const amount = areaInUnit * seedingRate.value;
            if (amount < 1) return {amount: Math.round(amount * 1000), unit: 'г'};
            if (amount < 1000) return {amount: Math.round(amount), unit: 'кг'};
            return {amount: Number((amount / 1000).toFixed(1)), unit: 'т'};
        } else {
            const amount = area * 10000 * seedingRate.value;
            if (amount < 1000) return {amount: Math.round(amount), unit: 'шт'};
            return {amount: Number((amount / 1000).toFixed(1)), unit: 'тыс. шт'};
        }
    }, [selectedCrop, selectedVariety, object]);

    // Сброс формы
    const resetForm = () => {
        setSelectedCropId('');
        setSelectedVarietyId('');
        setSelectedSeason(new Date().getFullYear());
        setPlantingDate(new Date().toISOString().split('T')[0]);
        setHarvestDate('');
        setStatus('sown');
        setActualYield(undefined);
        setNotes('');
        setShowVarietyWarning(false);
    };

    // Обработка сохранения
    const handleSave = () => {
        if (!selectedCrop || !plantingDate) return;

        const area = object.area;

        const record: PlantingRecord = {
            objectId: object.id,
            objectName: object.name,
            objectType: object.type,
            season: selectedSeason,
            cropId: selectedCrop.id,
            cropName: selectedCrop.name,
            varietyId: selectedVarietyId || undefined,
            varietyName: selectedVariety?.name,
            plantingDate,
            harvestDate: harvestDate || undefined,
            status,
            area,
            seedsAmount: calculateSeedsAmount?.amount || 0,
            seedsUnit: calculateSeedsAmount?.unit || '',
            actualYield: actualYield,
            yieldUnit: selectedCrop.seedingRate.type === 'seeds' ? 'ц/га' : 'кг/м²',
            notes: notes || undefined,
        };

        onSave(record);
        resetForm();
        onClose();
    };

    // Эффект для предупреждения о смене сорта
    useEffect(() => {
        if (selectedVarietyId && !selectedVariety) {
            setShowVarietyWarning(true);
        } else {
            setShowVarietyWarning(false);
        }
    }, [selectedVarietyId, selectedVariety]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                resetForm();
                onClose();
            }}
            title='Фиксация посадки'
            size="full"
        >
            <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">


                {/* Информация об объекте */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{object.name}</p>
                            <p className="text-sm text-gray-500">
                                {object.type === 'field' ? 'Поле' : 'Грядка'} •
                                Площадь: {formatArea(object.area)}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-20">
                                Сезон
                                <select
                                    value={selectedSeason}
                                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                >
                                    {availableSeasons.map(year => (
                                        <option key={year} value={year}>
                                            {year} год {year === new Date().getFullYear() ? '(текущий)' : year === new Date().getFullYear() - 1 ? '(прошлый)' : ''}
                                        </option>
                                    ))}
                                </select>

                            </label>

                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-5">
                                Дата посадки *
                                <input
                                    type="date"
                                    value={plantingDate}
                                    onChange={(e) => setPlantingDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </label>

                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-5">
                                Дата сбора (если есть)
                                <input
                                    type="date"
                                    value={harvestDate}
                                    onChange={(e) => setHarvestDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </label>

                        </div>
                    </div>
                </div>


                {/* Выбор культуры */}
                <div>
                    <div className="grid grid-cols-4 gap-20 text-sm font-medium">
                        <div className="col-start-1 col-end-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Культура *
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {availableCrops.map(crop => (
                                    <button
                                        key={crop.id}
                                        onClick={() => {
                                            setSelectedCropId(crop.id);
                                            setSelectedVarietyId(''); // Сбрасываем сорт при смене культуры
                                        }}
                                        className={`
                  p-3 rounded-lg border transition-all text-left
                  ${selectedCropId === crop.id
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                        }
                `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{crop.icon || '🌱'}</span>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{crop.name}</p>
                                                <p className="text-xs text-gray-500">{crop.category}</p>
                                            </div>
                                            {selectedCropId === crop.id && (
                                                <Check className="w-4 h-4 text-green-500 ml-auto"/>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Статус */}
                        <div>
                            <label
                                className="block text-sm font-medium text-center text-gray-700 dark:text-gray-300 mb-2">
                                Статус
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    {value: 'planned', label: 'Запланировано', icon: '📋', color: 'blue'},
                                    {value: 'sown', label: 'Посеяно', icon: '🌱', color: 'green'},
                                    {value: 'growing', label: 'Растет', icon: '🌿', color: 'emerald'},
                                    {value: 'harvested', label: 'Собрано', icon: '🏆', color: 'orange'},
                                    {value: 'failed', label: 'Погибло', icon: '💀', color: 'red'}
                                ].map(option => (
                                    <button
                                        key={option.value}
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
                </div>

                {/* Выбор сорта */}
                {selectedCrop && varietiesForCrop.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <Leaf className="w-4 h-4"/>
                                Сорт (опционально)
                            </div>
                        </label>
                        <select
                            value={selectedVarietyId}
                            onChange={(e) => setSelectedVarietyId(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                            <option value="">-- Не выбран (средние нормы) --</option>
                            {varietiesForCrop.map(variety => (
                                <option key={variety.id} value={variety.id}>
                                    {variety.name} {variety.growingDays ? `(${variety.growingDays} дн.)` : ''}
                                </option>
                            ))}
                        </select>

                        {/* Информация о сорте */}
                        {selectedVariety && (
                            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                                    Информация о сорте
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {selectedVariety.growingDays && (
                                        <div>
                                            <span className="text-gray-500">Вегетация:</span>
                                            <span className="ml-1 font-medium">{selectedVariety.growingDays} дней</span>
                                        </div>
                                    )}
                                    {selectedVariety.yieldPotential && (
                                        <div>
                                            <span className="text-gray-500">Потенциал:</span>
                                            <span className="ml-1 font-medium">
                        {selectedVariety.yieldPotential.min}-{selectedVariety.yieldPotential.max} {selectedVariety.yieldPotential.unit}
                      </span>
                                        </div>
                                    )}
                                    {selectedVariety.seedingRate && (
                                        <div className="col-span-2">
                                            <span className="text-gray-500">Норма высева:</span>
                                            <span className="ml-1 font-medium">
                        {selectedVariety.seedingRate.value} {selectedVariety.seedingRate.unit}
                      </span>
                                            {selectedVariety.seedingRate.note && (
                                                <span
                                                    className="ml-1 text-gray-400 text-xs">({selectedVariety.seedingRate.note})</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {showVarietyWarning && (
                            <div
                                className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-2 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0"/>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                    Выбранный сорт не соответствует выбранной культуре. Пожалуйста, выберите корректный
                                    сорт или очистите поле.
                                </p>
                            </div>
                        )}
                    </div>
                )}


                {/* Расчет количества */}
                {selectedCrop && calculateSeedsAmount && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-gray-500"/>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Необходимое количество</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            {calculateSeedsAmount.amount} {calculateSeedsAmount.unit}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {selectedVariety
                                ? `Расчет на основе нормы для сорта "${selectedVariety.name}"`
                                : 'Расчет на основе средней нормы для культуры'
                            }
                        </p>
                    </div>
                )}

                {/* Урожайность (для завершенных) */}
                {(status === 'harvested') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <Droplets className="w-4 h-4"/>
                                Фактическая урожайность (опционально)
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
                {selectedCrop?.seedingRate.type === 'seeds' ? 'ц/га' : 'кг/м²'}
              </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
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