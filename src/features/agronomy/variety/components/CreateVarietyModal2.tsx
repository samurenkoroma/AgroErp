// src/features/catalog/components/CreateVarietyModal.tsx
import {useState} from 'react';
import {Clock, Info, Package, Plus, Ruler, Save, Trash2, X} from 'lucide-react';
import {Modal} from '@/components/common/Modal';
import {Crop} from "@/entities/agronomy/crop/model.ts";

interface CreateVarietyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
    crop: Crop;
    preselectedCropId?: string;
}

// ==================== MAIN COMPONENT ====================

export const CreateVarietyModal = ({
                                       isOpen,
                                       onClose,
                                       onSuccess,
                                       crop,
                                   }: CreateVarietyModalProps) => {
    // ===== Основные поля =====
    const [name, setName] = useState('');
    const [breeder, setBreeder] = useState('');

    // ===== Maturity (созревание) =====
    const [daysToHarvest, setDaysToHarvest] = useState<number | undefined>();
    const [gddToHarvest, setGddToHarvest] = useState<number | undefined>();

    // ===== Spacing (схема посадки) =====
    const [plantDistance, setPlantDistance] = useState<number | undefined>();
    const [rowDistance, setRowDistance] = useState<number | undefined>();
    const [plantsPerSquareMeter, setPlantsPerSquareMeter] = useState<number | undefined>();
    const [recommendedDensity, setRecommendedDensity] = useState<number | undefined>();

    // ===== Characteristics =====
    const [characteristics, setCharacteristics] = useState<Array<{ key: string; value: string }>>([]);

    // ===== UI States =====
    const [newCharKey, setNewCharKey] = useState('');
    const [newCharValue, setNewCharValue] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ===== Добавление характеристики =====
    const addCharacteristic = () => {
        if (newCharKey && newCharValue) {
            setCharacteristics([...characteristics, {key: newCharKey, value: newCharValue}]);
            setNewCharKey('');
            setNewCharValue('');
        }
    };

    const removeCharacteristic = (index: number) => {
        setCharacteristics(characteristics.filter((_, i) => i !== index));
    };

    // ===== Валидация =====
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = 'Введите название сорта';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ===== Сохранение =====
    const handleSubmit = () => {
        if (!validate()) return;

        const varietyData = {
            cropId: crop.id,
            name,
            breeder: breeder || undefined,
            daysToMaturity: daysToHarvest,
            // profile: {
            //     maturity: {
            //         daysToHarvest: daysToHarvest || undefined,
            //         gddToHarvest: gddToHarvest || undefined
            //     },
            //     spacing: {
            //         plantDistanceCM: plantDistance || undefined,
            //         rowDistanceCM: rowDistance || undefined,
            //         plantsPerSquareMeter: plantsPerSquareMeter || undefined,
            //         recommendedDensity: recommendedDensity || undefined
            //     }
            // },
            // characteristics: characteristics.reduce((acc, {key, value}) => {
            //     acc[key] = value;
            //     return acc;
            // }, {} as Record<string, string>)
        };

        onSuccess(varietyData);
        resetForm();
        onClose();
    };

    // ===== Сброс формы =====
    const resetForm = () => {
        setName('');
        setBreeder('');
        setDaysToHarvest(undefined);
        setGddToHarvest(undefined);
        setPlantDistance(undefined);
        setRowDistance(undefined);
        setPlantsPerSquareMeter(undefined);
        setRecommendedDensity(undefined);
        setCharacteristics([]);
        setErrors({});
    };

    // ===== Быстрая вставка характеристик для популярных культур =====
    const quickAddCharacteristics = () => {
        const presets: Record<string, Array<{ key: string; value: string }>> = {
            'crop-1': [ // Томат
                {key: 'Цвет плода', value: 'Красный'},
                {key: 'Масса плода', value: '200-300 г'},
                {key: 'Тип роста', value: 'Индетерминантный'},
                {key: 'Назначение', value: 'Универсальный'}
            ],
            'crop-2': [ // Огурец
                {key: 'Тип опыления', value: 'Партенокарпический'},
                {key: 'Длина плода', value: '10-12 см'},
                {key: 'Масса плода', value: '90-100 г'},
                {key: 'Шипы', value: 'Белошипый'}
            ],
            'crop-3': [ // Перец
                {key: 'Цвет плода', value: 'Красный'},
                {key: 'Масса плода', value: '150-200 г'},
                {key: 'Толщина стенки', value: '5-7 мм'},
                {key: 'Острота', value: 'Сладкий'}
            ]
        };

        const preset = presets[crop.id];
        if (preset) {
            setCharacteristics(preset);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Добавление сорта для ${crop.name}`} size="md">
            <div className="space-y-5 max-h-[85vh] flex flex-col">
                {/* Основная информация */}
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Название сорта *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Бычье сердце"
                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg ${
                                errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Селекционер
                    </label>
                    <input
                        type="text"
                        value={breeder}
                        onChange={(e) => setBreeder(e.target.value)}
                        placeholder="ООО Агро"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                    />
                </div>

                {/* Maturity Profile */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-500"/>
                        <h3 className="font-medium text-gray-900 dark:text-white">Созревание</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Дней до сбора
                            </label>
                            <input
                                type="number"
                                value={daysToHarvest || ''}
                                onChange={(e) => setDaysToHarvest(parseInt(e.target.value) || undefined)}
                                placeholder="90"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                GDD до сбора
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={gddToHarvest || ''}
                                onChange={(e) => setGddToHarvest(parseFloat(e.target.value) || undefined)}
                                placeholder="1100"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Spacing */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Ruler className="w-4 h-4 text-green-500"/>
                        <h3 className="font-medium text-gray-900 dark:text-white">Схема посадки</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Расстояние между растениями (см)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={plantDistance || ''}
                                onChange={(e) => setPlantDistance(parseFloat(e.target.value) || undefined)}
                                placeholder="30"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Расстояние между рядами (см)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={rowDistance || ''}
                                onChange={(e) => setRowDistance(parseFloat(e.target.value) || undefined)}
                                placeholder="60"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Растений на м²
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={plantsPerSquareMeter || ''}
                                onChange={(e) => setPlantsPerSquareMeter(parseFloat(e.target.value) || undefined)}
                                placeholder="4"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Рекомендуемая плотность
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={recommendedDensity || ''}
                                onChange={(e) => setRecommendedDensity(parseFloat(e.target.value) || undefined)}
                                placeholder="5"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Characteristics */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-500"/>
                            <h3 className="font-medium text-gray-900 dark:text-white">Характеристики</h3>
                        </div>
                        {crop.id && (
                            <button
                                onClick={quickAddCharacteristics}
                                className="text-xs text-green-600 hover:text-green-700"
                            >
                                + Быстрое заполнение
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newCharKey}
                            onChange={(e) => setNewCharKey(e.target.value)}
                            placeholder="Характеристика"
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm"
                        />
                        <input
                            type="text"
                            value={newCharValue}
                            onChange={(e) => setNewCharValue(e.target.value)}
                            placeholder="Значение"
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm"
                        />
                        <button
                            onClick={addCharacteristic}
                            disabled={!newCharKey || !newCharValue}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4"/>
                        </button>
                    </div>

                    {characteristics.length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {characteristics.map((char, idx) => (
                                <div key={idx}
                                     className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {char.key}: <span className="font-normal text-gray-600 dark:text-gray-400">{char.value}</span>
                  </span>
                                    <button
                                        onClick={() => removeCharacteristic(idx)}
                                        className="p-0.5 hover:bg-red-100 rounded transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Подсказка */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5"/>
                        <div>
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                Сокращенная модель сорта
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                Укажите основные характеристики сорта. Детальные агрономические параметры будут
                                добавлены позже.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4"/>
                        Добавить сорт
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateVarietyModal;