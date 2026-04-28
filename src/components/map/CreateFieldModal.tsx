import { useState } from 'react';
import { X, Save, AlertCircle, Check } from 'lucide-react';
import { PolygonEditor } from './PolygonEditor';

interface CreateFieldModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (fieldData: any) => void;
    isCreating?: boolean;
}

export function CreateFieldModal({ isOpen, onClose, onCreate, isCreating = false }: CreateFieldModalProps) {
    const [fieldName, setFieldName] = useState('');
    const [description, setDescription] = useState('');
    const [soilType, setSoilType] = useState('Чернозем');
    const [geometry, setGeometry] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasGeometry, setHasGeometry] = useState(false);

    const soilTypes = [
        'Чернозем',
        'Суглинок',
        'Песчаный суглинок',
        'Глинистый',
        'Торфяной',
        'Песчаный',
    ];

    const handleGeometrySave = (newGeometry: any) => {
        setGeometry(newGeometry);
        setHasGeometry(true);
        setError(null);
        console.log('Geometry saved:', newGeometry);
    };

    const handleSubmit = async () => {
        if (!fieldName.trim()) {
            setError('Пожалуйста, укажите название поля');
            return;
        }

        if (!geometry) {
            setError('Пожалуйста, нарисуйте полигон на карте');
            return;
        }

        // Рассчитываем площадь в гектарах
        let area = 0;
        try {
            // Простой расчет площади полигона
            const coordinates = geometry.coordinates[0];
            let sum = 0;
            for (let i = 0; i < coordinates.length; i++) {
                const j = (i + 1) % coordinates.length;
                sum += coordinates[i][0] * coordinates[j][1];
                sum -= coordinates[j][0] * coordinates[i][1];
            }
            const areaInSquareMeters = Math.abs(sum) / 2;
            area = areaInSquareMeters / 10000; // перевод в гектары
        } catch (err) {
            console.error('Error calculating area:', err);
        }

        const fieldData = {
            name: fieldName,
            type: 'field',
            geometry: geometry,
            area: Math.round(area * 100) / 100,
            description: description,
            attributes: {
                soilType: soilType,
                soilPH: 7.0,
                organicMatter: '3.5%',
                activeCrops: [],
            },
            status: 'active',
            ownerId: 'current-user-id', // TODO: заменить на реальный ID пользователя
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        onCreate(fieldData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Создание нового поля
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Левая колонка - форма */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Название поля *
                                </label>
                                <input
                                    type="text"
                                    value={fieldName}
                                    onChange={(e) => setFieldName(e.target.value)}
                                    placeholder="Например: Поле Северное"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Тип почвы
                                </label>
                                <select
                                    value={soilType}
                                    onChange={(e) => setSoilType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    {soilTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Описание (опционально)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Дополнительная информация о поле..."
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                />
                            </div>

                            {geometry && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                            Полигон создан
                                        </span>
                                    </div>
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Площадь: ~{Math.round((() => {
                                        try {
                                            const coords = geometry.coordinates[0];
                                            let sum = 0;
                                            for (let i = 0; i < coords.length; i++) {
                                                const j = (i + 1) % coords.length;
                                                sum += coords[i][0] * coords[j][1];
                                                sum -= coords[j][0] * coords[i][1];
                                            }
                                            const area = (Math.abs(sum) / 2) / 10000;
                                            return area;
                                        } catch { return 0; }
                                    })())} га
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Правая колонка - редактор полигонов */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Нарисуйте границы поля на карте *
                            </label>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                <PolygonEditor
                                    geometry={null}
                                    onSave={handleGeometrySave}
                                    isEditing={true}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                💡 Используйте инструменты редактирования для создания границ поля.
                                Нажмите "Новый полигон" чтобы начать рисование.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                        disabled={isCreating}
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isCreating || !fieldName.trim() || !geometry}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isCreating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Создание...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Создать поле
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}