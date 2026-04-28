// components/modals/CreateCropPlanModal.tsx
import { useState, useMemo, useEffect } from 'react';
import {
    Sprout,
    Calendar,
    Package,
    Thermometer,
    AlertCircle,
    Check,
    X,
    Save,
    Leaf,
    MapPin,
    AlertTriangle,
    Search,
    ChevronDown,
    ChevronRight,
    Info,
    Flower2,
    Ruler,
    Clock,
    Droplets,
    Sun,
    CalendarDays,
    Hourglass,
    Layers
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';

// ==================== TYPES ====================

export interface CreateCropPlanCommand {
    bed_id: string;
    name: string;
    variety_id: string;
    season_start: string;
    season_end: string;
    planting_date: string;
    sowing_date?: string;
    is_seedling?: boolean;
    seedling_info?: {
        sowing_date: string;
        expected_planting_date: string;
        optimal_age_min: number;
        optimal_age_max: number;
        seedling_height?: number;
        leaf_count?: number;
        hardening_days?: number;
        container_type?: string;
        container_size?: string;
        notes?: string;
    };
    latitude: number;
    longitude: number;
    assigned_to: string;
    assigned_name: string;
}

export interface VarietyDTO {
    id: string;
    name: string;
    species_key: string;
    species_name: string;
    days_to_maturity: number;
    yield_potential: number;
    plant_height: number;
    recommended_seasons: string[];
    growing_types: string[];
    characteristics: Record<string, string>;
    description: string;
    is_seedling_recommended?: boolean;
    seedling_age_days?: number;
}

export interface CropDTO {
    id: string;
    name: string;
    category: string;
    icon: string;
    color: string;
    suitableFor: {
        greenhouse: boolean;
        openGround: boolean;
        garden: boolean;
    };
}

interface CreateCropPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (command: CreateCropPlanCommand) => void;
    bedId: string;
    bedName: string;
    objectType: 'field' | 'greenhouse' | 'plot';
    area: number;
    areaUnit: 'ha' | 'm2';
    latitude: number;
    longitude: number;
    availableCrops: CropDTO[];
    availableVarieties: VarietyDTO[];
    currentUserId: string;
    currentUserName: string;
}

// ==================== MOCK DATA FOR VARIETIES ====================

const mockVarieties: VarietyDTO[] = [
    // Пшеница (прямой посев)
    {
        id: 'var-wheat-1',
        name: 'Мироновская 65',
        species_key: 'wheat',
        species_name: 'Пшеница озимая',
        days_to_maturity: 270,
        yield_potential: 55,
        plant_height: 1.2,
        recommended_seasons: ['autumn'],
        growing_types: ['open_ground'],
        characteristics: {
            'Зимостойкость': 'Высокая',
            'Устойчивость к болезням': 'Высокая'
        },
        description: 'Высокоурожайный сорт озимой пшеницы.',
        is_seedling_recommended: false
    },
    // Томаты (рассадный метод)
    {
        id: 'var-tomato-1',
        name: 'Бычье сердце',
        species_key: 'tomato',
        species_name: 'Томат',
        days_to_maturity: 120,
        yield_potential: 12,
        plant_height: 1.5,
        recommended_seasons: ['spring', 'summer'],
        growing_types: ['greenhouse', 'open_ground'],
        characteristics: {
            'Размер плода': 'Крупный (300-500г)',
            'Вкус': 'Сладкий'
        },
        description: 'Крупноплодный сорт томата с отличными вкусовыми качествами.',
        is_seedling_recommended: true,
        seedling_age_days: 50
    },
    {
        id: 'var-tomato-2',
        name: 'Черри красный',
        species_key: 'tomato',
        species_name: 'Томат',
        days_to_maturity: 90,
        yield_potential: 8,
        plant_height: 1.8,
        recommended_seasons: ['spring', 'summer', 'autumn'],
        growing_types: ['greenhouse'],
        characteristics: {
            'Размер плода': 'Мелкий (15-20г)',
            'Цвет': 'Красный',
            'Вкус': 'Сладкий'
        },
        description: 'Черри-томат для теплиц. Обильное плодоношение.',
        is_seedling_recommended: true,
        seedling_age_days: 45
    },
    // Огурцы (можно и рассадой, и прямым посевом)
    {
        id: 'var-cucumber-1',
        name: 'Герман F1',
        species_key: 'cucumber',
        species_name: 'Огурец',
        days_to_maturity: 45,
        yield_potential: 16,
        plant_height: 2.0,
        recommended_seasons: ['spring', 'summer'],
        growing_types: ['greenhouse'],
        characteristics: {
            'Тип': 'Партенокарпический',
            'Размер плода': 'Корнишоны (8-10см)'
        },
        description: 'Партенокарпический гибрид огурца для теплиц.',
        is_seedling_recommended: true,
        seedling_age_days: 25
    }
];

// ==================== MAIN COMPONENT ====================

const CreateCropPlanModal = ({
                                 isOpen,
                                 onClose,
                                 onSave,
                                 bedId,
                                 bedName,
                                 objectType,
                                 area,
                                 areaUnit,
                                 latitude,
                                 longitude,
                                 availableCrops,
                                 availableVarieties = mockVarieties,
                                 currentUserId,
                                 currentUserName
                             }: CreateCropPlanModalProps) => {
    // Основные состояния
    const [selectedCropId, setSelectedCropId] = useState<string>('');
    const [selectedVarietyId, setSelectedVarietyId] = useState<string>('');
    const [plantingDate, setPlantingDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [seasonYear, setSeasonYear] = useState<number>(new Date().getFullYear());
    const [planName, setPlanName] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSeedling, setIsSeedling] = useState<boolean>(false);
    const [showVarietyInfo, setShowVarietyInfo] = useState(false);

    // Состояния для рассады
    const [sowingDate, setSowingDate] = useState<string>('');
    const [seedlingAgeMin, setSeedlingAgeMin] = useState<number>(35);
    const [seedlingAgeMax, setSeedlingAgeMax] = useState<number>(45);
    const [seedlingHeight, setSeedlingHeight] = useState<number>(15);
    const [leafCount, setLeafCount] = useState<number>(5);
    const [hardeningDays, setHardeningDays] = useState<number>(7);
    const [containerType, setContainerType] = useState<string>('Кассета');
    const [containerSize, setContainerSize] = useState<string>('40 ячеек');
    const [seedlingNotes, setSeedlingNotes] = useState<string>('');

    // Получаем выбранную культуру и сорт
    const selectedCrop = useMemo(() => {
        return availableCrops.find(c => c.id === selectedCropId);
    }, [selectedCropId, availableCrops]);

    const selectedVariety = useMemo(() => {
        if (!selectedVarietyId) return null;
        return availableVarieties.find(v => v.id === selectedVarietyId);
    }, [selectedVarietyId, availableVarieties]);

    // Доступные сорта для выбранной культуры
    const varietiesForCrop = useMemo(() => {
        if (!selectedCrop) return [];
        return availableVarieties.filter(v => v.species_name === selectedCrop.name);
    }, [selectedCrop, availableVarieties]);

    // Фильтрация сортов по поиску
    const filteredVarieties = useMemo(() => {
        if (!searchTerm) return varietiesForCrop;
        return varietiesForCrop.filter(v =>
            v.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [varietiesForCrop, searchTerm]);

    // Автоматический выбор метода выращивания на основе сорта
    useEffect(() => {
        if (selectedVariety) {
            if (selectedVariety.is_seedling_recommended) {
                setIsSeedling(true);
                // Устанавливаем рекомендуемый возраст рассады
                if (selectedVariety.seedling_age_days) {
                    setSeedlingAgeMin(selectedVariety.seedling_age_days - 5);
                    setSeedlingAgeMax(selectedVariety.seedling_age_days + 5);
                }
            } else {
                setIsSeedling(false);
            }
        }
    }, [selectedVariety]);

    // Автоматический расчет даты посева на основе даты высадки
    useEffect(() => {
        if (isSeedling && plantingDate && seedlingAgeMax) {
            const sowing = new Date(plantingDate);
            sowing.setDate(sowing.getDate() - seedlingAgeMax);
            setSowingDate(sowing.toISOString().split('T')[0]);
        }
    }, [isSeedling, plantingDate, seedlingAgeMax]);

    // Автогенерация имени плана
    useEffect(() => {
        if (selectedVariety && !planName) {
            const date = new Date(plantingDate);
            const season = date.getFullYear();
            const method = isSeedling ? '(рассада)' : '(прямой посев)';
            setPlanName(`${selectedVariety.species_name} - ${selectedVariety.name} ${method} (${season})`);
        }
    }, [selectedVariety, plantingDate, planName, isSeedling]);

    // Сброс формы
    const resetForm = () => {
        setSelectedCropId('');
        setSelectedVarietyId('');
        setPlantingDate(new Date().toISOString().split('T')[0]);
        setSeasonYear(new Date().getFullYear());
        setPlanName('');
        setSearchTerm('');
        setShowVarietyInfo(false);
        setIsSeedling(false);
        setSowingDate('');
        setSeedlingAgeMin(35);
        setSeedlingAgeMax(45);
        setSeedlingHeight(15);
        setLeafCount(5);
        setHardeningDays(7);
        setContainerType('Кассета');
        setContainerSize('40 ячеек');
        setSeedlingNotes('');
    };

    // Обработка сохранения
    const handleSave = () => {
        if (!selectedVariety || !plantingDate) return;

        // Расчет дат сезона
        const startDate = new Date(plantingDate);
        const endDate = new Date(plantingDate);
        endDate.setDate(endDate.getDate() + selectedVariety.days_to_maturity);

        const command: CreateCropPlanCommand = {
            bed_id: bedId,
            name: planName || `${selectedVariety.species_name} - ${selectedVariety.name}`,
            variety_id: selectedVariety.id,
            season_start: new Date(seasonYear, 0, 1).toISOString(),
            season_end: new Date(seasonYear, 11, 31).toISOString(),
            planting_date: plantingDate,
            is_seedling: isSeedling,
            latitude: latitude,
            longitude: longitude,
            assigned_to: currentUserId,
            assigned_name: currentUserName
        };

        // Добавляем информацию о рассаде если нужно
        if (isSeedling) {
            command.sowing_date = sowingDate;
            command.seedling_info = {
                sowing_date: sowingDate,
                expected_planting_date: plantingDate,
                optimal_age_min: seedlingAgeMin,
                optimal_age_max: seedlingAgeMax,
                seedling_height: seedlingHeight,
                leaf_count: leafCount,
                hardening_days: hardeningDays,
                container_type: containerType,
                container_size: containerSize,
                notes: seedlingNotes
            };
        }

        onSave(command);
        resetForm();
        onClose();
    };

    // Получение иконки для типа объекта
    const getObjectIcon = () => {
        switch (objectType) {
            case 'field': return '🌾';
            case 'greenhouse': return '🌱';
            case 'plot': return '📍';
            default: return '📌';
        }
    };

    // Доступные годы для сезона
    const availableYears = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return [currentYear - 1, currentYear, currentYear + 1];
    }, []);

    // Форматирование площади
    const formattedArea = `${area} ${areaUnit === 'ha' ? 'га' : 'м²'}`;

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                resetForm();
                onClose();
            }}
            title="Создание плана посева"
            size="lg"
        >
            <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
                {/* Информация о месте посадки */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-blue-900 dark:text-blue-300">
                                Место посадки
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                {getObjectIcon()} {bedName} • {formattedArea}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Выбор культуры */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Культура *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {availableCrops.map(crop => (
                            <button
                                key={crop.id}
                                onClick={() => {
                                    setSelectedCropId(crop.id);
                                    setSelectedVarietyId('');
                                    setSearchTerm('');
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
                                        <Check className="w-4 h-4 text-green-500 ml-auto" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Выбор сорта */}
                {selectedCrop && varietiesForCrop.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Сорт *
                        </label>

                        {/* Поиск по сортам */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск сорта..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                            />
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {filteredVarieties.map(variety => (
                                <button
                                    key={variety.id}
                                    onClick={() => {
                                        setSelectedVarietyId(variety.id);
                                        setShowVarietyInfo(true);
                                    }}
                                    className={`
                    w-full p-3 rounded-lg border transition-all text-left
                    ${selectedVarietyId === variety.id
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                    }
                  `}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {variety.name}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                            {variety.days_to_maturity} дней
                        </span>
                                                <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                                                    {variety.yield_potential} {variety.species_name === 'Томат' ? 'кг/м²' : 'ц/га'}
                        </span>
                                                {variety.is_seedling_recommended && (
                                                    <span className="flex items-center gap-1 text-purple-500">
                            <Flower2 className="w-3 h-3" />
                            Рассадный
                          </span>
                                                )}
                                            </div>
                                        </div>
                                        {selectedVarietyId === variety.id && (
                                            <Check className="w-4 h-4 text-green-500" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {filteredVarieties.length === 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                Сорта не найдены
                            </div>
                        )}
                    </div>
                )}

                {/* Информация о выбранном сорте */}
                {selectedVariety && showVarietyInfo && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-green-900 dark:text-green-300">
                                {selectedVariety.name}
                            </h4>
                            <button
                                onClick={() => setShowVarietyInfo(false)}
                                className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-green-800 dark:text-green-300 mb-3">
                            {selectedVariety.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-500">Срок созревания:</span>
                                <span className="ml-1 font-medium">{selectedVariety.days_to_maturity} дней</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Высота:</span>
                                <span className="ml-1 font-medium">{selectedVariety.plant_height} м</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Урожайность:</span>
                                <span className="ml-1 font-medium">
                  {selectedVariety.yield_potential} {selectedVariety.species_name === 'Томат' ? 'кг/м²' : 'ц/га'}
                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Сезоны:</span>
                                <span className="ml-1 font-medium capitalize">
                  {selectedVariety.recommended_seasons.join(', ')}
                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Метод выращивания (только если сорт поддерживает оба варианта) */}
                {selectedVariety && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Метод выращивания
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsSeedling(false)}
                                className={`
                  flex-1 p-3 rounded-lg border transition-all
                  ${!isSeedling
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                }
                `}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Sprout className="w-4 h-4" />
                                    <span className="font-medium">Прямой посев</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Сразу в грунт</p>
                            </button>
                            <button
                                onClick={() => setIsSeedling(true)}
                                className={`
                  flex-1 p-3 rounded-lg border transition-all
                  ${isSeedling
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                }
                `}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Flower2 className="w-4 h-4" />
                                    <span className="font-medium">Рассадный метод</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Через рассаду</p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Название плана */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Название плана
                    </label>
                    <input
                        type="text"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        placeholder="Введите название..."
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    />
                </div>

                {/* Дата посадки / высадки рассады */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isSeedling ? 'Дата высадки рассады *' : 'Дата посева *'}
                    </label>
                    <input
                        type="date"
                        value={plantingDate}
                        onChange={(e) => setPlantingDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    />
                </div>

                {/* Секция рассады */}
                {isSeedling && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 space-y-4">
                        <h3 className="font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                            <Flower2 className="w-4 h-4" />
                            Параметры рассады
                        </h3>

                        {/* Дата посева семян (авторасчет) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Рекомендуемая дата посева семян
                            </label>
                            <input
                                type="date"
                                value={sowingDate}
                                readOnly
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Рассчитано исходя из оптимального возраста рассады {seedlingAgeMin}-{seedlingAgeMax} дней
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Мин. возраст рассады (дни)
                                </label>
                                <input
                                    type="number"
                                    value={seedlingAgeMin}
                                    onChange={(e) => setSeedlingAgeMin(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Макс. возраст рассады (дни)
                                </label>
                                <input
                                    type="number"
                                    value={seedlingAgeMax}
                                    onChange={(e) => setSeedlingAgeMax(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Высота рассады (см)
                                </label>
                                <input
                                    type="number"
                                    value={seedlingHeight}
                                    onChange={(e) => setSeedlingHeight(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Кол-во листьев
                                </label>
                                <input
                                    type="number"
                                    value={leafCount}
                                    onChange={(e) => setLeafCount(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Дней закалки
                                </label>
                                <input
                                    type="number"
                                    value={hardeningDays}
                                    onChange={(e) => setHardeningDays(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Тип контейнера
                                </label>
                                <input
                                    type="text"
                                    value={containerType}
                                    onChange={(e) => setContainerType(e.target.value)}
                                    placeholder="Кассета, стаканчик..."
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Заметки по рассаде
                            </label>
                            <textarea
                                value={seedlingNotes}
                                onChange={(e) => setSeedlingNotes(e.target.value)}
                                rows={2}
                                placeholder="Особенности выращивания рассады, требования к освещению, температуре..."
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* Сезон */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Сезон (год)
                    </label>
                    <select
                        value={seasonYear}
                        onChange={(e) => setSeasonYear(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>
                                {year} год {year === new Date().getFullYear() ? '(текущий)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Информация о расчетах */}
                {selectedVariety && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Информация о расчетах
              </span>
                        </div>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Срок созревания:</span>
                                <span className="font-medium">{selectedVariety.days_to_maturity} дней</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Плановая урожайность:</span>
                                <span className="font-medium">
                  {selectedVariety.yield_potential} {selectedVariety.species_name === 'Томат' ? 'кг/м²' : 'ц/га'}
                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Примерный сбор урожая:</span>
                                <span className="font-medium text-green-600">
                  {new Date(plantingDate).toLocaleDateString('ru')} →
                                    {new Date(new Date(plantingDate).setDate(new Date(plantingDate).getDate() + selectedVariety.days_to_maturity)).toLocaleDateString('ru')}
                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Предупреждение о севообороте */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                            Рекомендация по севообороту
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                            Перед созданием плана рекомендуется проверить историю посадок на этой грядке.
                            Соблюдение севооборота помогает предотвратить истощение почвы и накопление болезней.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => {
                        resetForm();
                        onClose();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    <X className="w-4 h-4" />
                    Отмена
                </button>
                <button
                    onClick={handleSave}
                    disabled={!selectedVariety || !plantingDate || (isSeedling && !sowingDate)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    Создать план
                </button>
            </div>
        </Modal>
    );
};

export default CreateCropPlanModal;