// src/features/catalog/components/CreateVarietyModal.tsx
import {useMemo, useState} from 'react';
import {AlertCircle, Plus, Save, Trash2} from 'lucide-react';
import {Modal} from '@/components/common/Modal';
import {useCrops} from "@/features/agronomy/crop";

interface CreateVarietyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (data: any) => void;
    preselectedCropId?: string;
}

const growingTypes = [
    {value: 'open_ground', label: 'Открытый грунт', icon: '🌾'},
    {value: 'greenhouse', label: 'Теплица', icon: '🌱'},
    {value: 'hydroponic', label: 'Гидропоника', icon: '💧'}
];

const seasons = [
    {value: 'spring', label: 'Весна', icon: '🌸'},
    {value: 'summer', label: 'Лето', icon: '☀️'},
    {value: 'autumn', label: 'Осень', icon: '🍂'},
    {value: 'winter', label: 'Зима', icon: '❄️'}
];

export const CreateVarietyModal = ({isOpen, onClose, onSuccess, preselectedCropId}: CreateVarietyModalProps) => {
    const {data: crops} = useCrops({});

    const [formData, setFormData] = useState({
        name: '',
        cropId: preselectedCropId || '',
        description: '',
        daysToMaturity: 90,
        yieldPotential: 0,
        plantHeight: 0,
        recommendedSeasons: [] as string[],
        growingTypes: [] as string[],
        characteristics: [] as { key: string; value: string }[],
        imageUrl: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [newCharKey, setNewCharKey] = useState('');
    const [newCharValue, setNewCharValue] = useState('');

    const selectedCrop = useMemo(() => {
        return crops?.find(c => c.id === formData.cropId);
    }, [crops, formData.cropId]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Название обязательно';
        if (!formData.cropId) newErrors.cropId = 'Выберите культуру';
        if (formData.daysToMaturity <= 0) newErrors.daysToMaturity = 'Укажите срок созревания';
        if (formData.plantHeight <= 0) newErrors.plantHeight = 'Укажите высоту растения';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const characteristicsObj = formData.characteristics.reduce((acc, {key, value}) => {
                if (key && value) acc[key] = value;
                return acc;
            }, {} as Record<string, string>);

            const submitData = {
                ...formData,
                characteristics: characteristicsObj
            };

            await new Promise(resolve => setTimeout(resolve, 500));
            onSuccess?.(submitData);
            resetForm();
            onClose();
        } catch (error) {
            console.error('Failed to create variety:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            cropId: preselectedCropId || '',
            description: '',
            daysToMaturity: 90,
            yieldPotential: 0,
            plantHeight: 0,
            recommendedSeasons: [],
            growingTypes: [],
            characteristics: [],
            imageUrl: ''
        });
        setImagePreview(null);
        setErrors({});
        setNewCharKey('');
        setNewCharValue('');
    };

    const toggleSeason = (season: string) => {
        setFormData(prev => ({
            ...prev,
            recommendedSeasons: prev.recommendedSeasons.includes(season)
                ? prev.recommendedSeasons.filter(s => s !== season)
                : [...prev.recommendedSeasons, season]
        }));
    };

    const toggleGrowingType = (type: string) => {
        setFormData(prev => ({
            ...prev,
            growingTypes: prev.growingTypes.includes(type)
                ? prev.growingTypes.filter(t => t !== type)
                : [...prev.growingTypes, type]
        }));
    };

    const addCharacteristic = () => {
        if (newCharKey && newCharValue) {
            setFormData(prev => ({
                ...prev,
                characteristics: [...prev.characteristics, {key: newCharKey, value: newCharValue}]
            }));
            setNewCharKey('');
            setNewCharValue('');
        }
    };

    const removeCharacteristic = (index: number) => {
        setFormData(prev => ({
            ...prev,
            characteristics: prev.characteristics.filter((_, i) => i !== index)
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setFormData(prev => ({...prev, imageUrl: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Добавление сорта" size="lg">
            <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
                {/* Основная информация */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Название сорта *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Бычье сердце"
                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg ${
                                errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Культура *
                        </label>
                        <select
                            value={formData.cropId}
                            onChange={(e) => setFormData({...formData, cropId: e.target.value})}
                            disabled={!!preselectedCropId}
                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg ${
                                errors.cropId ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <option value="">Выберите культуру</option>
                            {crops?.map(crop => (
                                <option key={crop.id} value={crop.id}>{crop.name}</option>
                            ))}
                        </select>
                        {errors.cropId && <p className="text-xs text-red-500 mt-1">{errors.cropId}</p>}
                    </div>
                </div>

                {selectedCrop && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <p className="text-sm text-green-700 dark:text-green-300">
                            Добавление сорта для культуры: {selectedCrop.name}
                        </p>
                    </div>
                )}

                {/* Агрономические параметры */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Срок созревания (дни) *
                        </label>
                        <input
                            type="number"
                            value={formData.daysToMaturity}
                            onChange={(e) => setFormData({...formData, daysToMaturity: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg ${
                                errors.daysToMaturity ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                        />
                        {errors.daysToMaturity && <p className="text-xs text-red-500 mt-1">{errors.daysToMaturity}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Высота растения (м) *
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.plantHeight}
                            onChange={(e) => setFormData({...formData, plantHeight: parseFloat(e.target.value)})}
                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg ${
                                errors.plantHeight ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                        />
                        {errors.plantHeight && <p className="text-xs text-red-500 mt-1">{errors.plantHeight}</p>}
                    </div>
                </div>

                {/* Рекомендуемые сезоны */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Рекомендуемые сезоны
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {seasons.map(season => (
                            <button
                                key={season.value}
                                type="button"
                                onClick={() => toggleSeason(season.value)}
                                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1
                  ${formData.recommendedSeasons.includes(season.value)
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                                }
                `}
                            >
                                {season.icon} {season.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Типы выращивания */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Типы выращивания
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {growingTypes.map(type => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => toggleGrowingType(type.value)}
                                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1
                  ${formData.growingTypes.includes(type.value)
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                                }
                `}
                            >
                                {type.icon} {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Характеристики */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Характеристики
                    </label>
                    <div className="space-y-2">
                        {formData.characteristics.map((char, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={char.key}
                                    readOnly
                                    className="w-1/3 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 rounded-lg text-sm"
                                />
                                <input
                                    type="text"
                                    value={char.value}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 rounded-lg text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeCharacteristic(idx)}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500"/>
                                </button>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newCharKey}
                                onChange={(e) => setNewCharKey(e.target.value)}
                                placeholder="Характеристика (например, Цвет плода)"
                                className="w-1/3 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm"
                            />
                            <input
                                type="text"
                                value={newCharValue}
                                onChange={(e) => setNewCharValue(e.target.value)}
                                placeholder="Значение (например, Красный)"
                                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm"
                            />
                            <button
                                type="button"
                                onClick={addCharacteristic}
                                disabled={!newCharKey || !newCharValue}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Изображение */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Изображение
                    </label>
                    <div className="flex items-start gap-4">
                        <div
                            className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover"/>
                            ) : (
                                <div className="text-center">
                                    <div className="text-3xl">🌱</div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="cursor-pointer">
                                <div
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-center hover:bg-gray-200 transition-colors">
                                    Загрузить изображение
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden"/>
                            </label>
                            <p className="text-xs text-gray-500 mt-2">Рекомендуемый размер: 400x300px</p>
                        </div>
                    </div>
                </div>

                {/* Описание */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Описание
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        placeholder="Описание сорта..."
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg resize-none"
                    />
                </div>

                {/* Предупреждение */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5"/>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            После создания сорта, его характеристики можно будет редактировать в карточке сорта.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => {
                        resetForm();
                        onClose();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    Отмена
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    ) : (
                        <Save className="w-4 h-4"/>
                    )}
                    Добавить сорт
                </button>
            </div>
        </Modal>
    );
};