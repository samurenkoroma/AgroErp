import {useState} from 'react';
import {Save} from 'lucide-react';
import {Modal} from '@/components/common/Modal';
import {CreateCropRequest} from "@/entities/agronomy/crop/dto.ts";

interface CreateCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (data: CreateCropRequest) => void;
}

const cropCategories = [
    {value: 'Овощные', label: 'Овощные', icon: '🍅'},
    {value: 'Зерновые', label: 'Зерновые', icon: '🌾'},
    {value: 'Бобовые', label: 'Бобовые', icon: '🫘'},
    {value: 'Технические', label: 'Технические', icon: '🌻'},
    {value: 'Зеленные', label: 'Зеленные', icon: '🥬'},
    {value: 'Пряные', label: 'Пряные', icon: '🌿'},
    {value: 'Ягодные', label: 'Ягодные', icon: '🍓'},
    {value: 'Плодовые', label: 'Плодовые', icon: '🍎'}
];

const cropFamilies = [
    {value: 'solanaceae', label: 'Пасленовые (Solanaceae)', icon: '🍅'},
    {value: 'cucurbitaceae', label: 'Тыквенные (Cucurbitaceae)', icon: '🥒'},
    {value: 'brassicaceae', label: 'Капустные (Brassicaceae)', icon: '🥬'},
    {value: 'apiaceae', label: 'Зонтичные (Apiaceae)', icon: '🥕'},
    {value: 'liliaceae', label: 'Луковые (Liliaceae)', icon: '🧅'},
    {value: 'fabaceae', label: 'Бобовые (Fabaceae)', icon: '🫘'},
    {value: 'poaceae', label: 'Злаковые (Poaceae)', icon: '🌾'},
    {value: 'asteraceae', label: 'Астровые (Asteraceae)', icon: '🌻'},
    {value: 'rosaceae', label: 'Розовые (Rosaceae)', icon: '🍎'},
    {value: 'lamiaceae', label: 'Яснотковые (Lamiaceae)', icon: '🌿'}
];

export const CreateCropModal = ({isOpen, onClose, onSuccess}: CreateCropModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        family: '',
        scientificName: '',
        description: '',
        imageUrl: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const [imagePreview, setImagePreview] = useState<string | null>(null);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Название обязательно';
        if (!formData.category) newErrors.category = 'Выберите категорию';
        if (!formData.family) newErrors.family = 'Выберите семейство';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            // Здесь будет API вызов
            await new Promise(resolve => setTimeout(resolve, 500));
            onSuccess?.(formData);
            resetForm();
            onClose();
        } catch (error) {
            console.error('Failed to create crop:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            family: '',
            scientificName: '',
            description: '',
            imageUrl: ''
        });
        // setImagePreview(null);
        setErrors({});
    };

    // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setImagePreview(reader.result as string);
    //             setFormData(prev => ({...prev, imageUrl: reader.result as string}));
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Добавление культуры" size="lg">
            <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
                {/* Основная информация */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Научное название
                        </label>
                        <input
                            type="text"
                            value={formData.scientificName}
                            onChange={(e) => setFormData({...formData, scientificName: e.target.value})}
                            placeholder="Solanum lycopersicum"
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Название *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Томат"
                                className={`flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg ${
                                    errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                }`}
                            />
                        </div>
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Категория *
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg ${
                                errors.category ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <option value="">Выберите категорию</option>
                            {cropCategories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.icon} {cat.label}
                                </option>
                            ))}
                        </select>
                        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Семейство *
                        </label>
                        <select
                            value={formData.family}
                            onChange={(e) => setFormData({...formData, family: e.target.value})}
                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg ${
                                errors.family ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <option value="">Выберите семейство</option>
                            {cropFamilies.map(fam => (
                                <option key={fam.value} value={fam.value}>
                                    {fam.icon} {fam.label}
                                </option>
                            ))}
                        </select>
                        {errors.family && <p className="text-xs text-red-500 mt-1">{errors.family}</p>}
                    </div>
                </div>

                <div className="grid  gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Описание</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg ${
                                errors.category ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                        />
                    </div>
                </div>

                {/* Изображение */}
                {/*<div>*/}
                {/*    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">*/}
                {/*        Изображение*/}
                {/*    </label>*/}
                {/*    <div className="flex items-start gap-4">*/}
                {/*        <div*/}
                {/*            className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700">*/}
                {/*            {imagePreview ? (*/}
                {/*                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover"/>*/}
                {/*            ) : (*/}
                {/*                <ImageIcon className="w-8 h-8 text-gray-400"/>*/}
                {/*            )}*/}
                {/*        </div>*/}
                {/*        <div className="flex-1">*/}
                {/*            <label className="cursor-pointer">*/}
                {/*                <div*/}
                {/*                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-center hover:bg-gray-200 transition-colors">*/}
                {/*                    <Upload className="w-4 h-4 inline mr-2"/>*/}
                {/*                    Загрузить изображение*/}
                {/*                </div>*/}
                {/*                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden"/>*/}
                {/*            </label>*/}
                {/*            <p className="text-xs text-gray-500 mt-2">Рекомендуемый размер: 400x300px</p>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
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
                    Добавить культуру
                </button>
            </div>
        </Modal>
    );
};