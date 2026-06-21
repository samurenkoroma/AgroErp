import {useState} from 'react';
import {
    Droplet,
    Info,
    Leaf,
    Package,
    Plus,
    Ruler,
    Save,
    Sprout,
    Sun,
    Thermometer,
    Trash2,
    TrendingUp,
    X
} from 'lucide-react';
import {Modal} from '@/components/common/Modal';

// ==================== TYPES ====================

interface Crop {
    id: string;
    key: string;
    name: string;
    icon: string;
    category: string;
}

interface CreateVarietyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
    crops: Crop[];
    preselectedCropId?: string;
}

// ==================== MOCK CROPS ====================

const mockCrops: Crop[] = [
    {id: 'crop-1', key: 'tomato', name: 'Томат', icon: '🍅', category: 'Овощные'},
    {id: 'crop-2', key: 'cucumber', name: 'Огурец', icon: '🥒', category: 'Овощные'},
    {id: 'crop-3', key: 'pepper', name: 'Перец', icon: '🫑', category: 'Овощные'},
    {id: 'crop-4', key: 'eggplant', name: 'Баклажан', icon: '🍆', category: 'Овощные'},
    {id: 'crop-5', key: 'potato', name: 'Картофель', icon: '🥔', category: 'Овощные'},
    {id: 'crop-6', key: 'carrot', name: 'Морковь', icon: '🥕', category: 'Овощные'},
    {id: 'crop-7', key: 'beet', name: 'Свекла', icon: '🍠', category: 'Овощные'},
    {id: 'crop-8', key: 'wheat', name: 'Пшеница', icon: '🌾', category: 'Зерновые'},
    {id: 'crop-9', key: 'sunflower', name: 'Подсолнечник', icon: '🌻', category: 'Технические'}
];

// ==================== MAIN COMPONENT ====================

interface Light {
    ppfdMin: number
    ppfdOpt: number
    dayLengthMin: number
    dayLengthOpt: number
    photoperiodType: "short_day" | "long_day" | "day_neutral" | ""
    criticalPhases: string[]
}

export const CreateVarietyModal = ({
                                       isOpen,
                                       onClose,
                                       onSuccess,
                                       crops = mockCrops,
                                       preselectedCropId
                                   }: CreateVarietyModalProps) => {
    // ===== Базовые состояния =====
    const [cropId, setCropId] = useState(preselectedCropId || '');
    const [name, setName] = useState('');
    const [breeder, setBreeder] = useState('');
    const [description, setDescription] = useState('');

    // ===== Maturity (созревание) =====
    const [daysToEmergence, setDaysToEmergence] = useState<number | undefined>();
    const [daysToFlowering, setDaysToFlowering] = useState<number | undefined>();
    const [daysToHarvest, setDaysToHarvest] = useState<number | undefined>();
    const [gddToHarvest, setGddToHarvest] = useState<number | undefined>();

    // ===== Growth (рост) =====
    const [minHeight, setMinHeight] = useState<number | undefined>();
    const [maxHeight, setMaxHeight] = useState<number | undefined>();
    const [rootDepth, setRootDepth] = useState<number | undefined>();
    const [canopyDiameter, setCanopyDiameter] = useState<number | undefined>();
    const [determinate, setDeterminate] = useState(false);
    const [supportsPruning, setSupportsPruning] = useState(false);
    const [supportsTrellis, setSupportsTrellis] = useState(false);

    // ===== Spacing (схема посадки) =====
    const [plantDistance, setPlantDistance] = useState<number | undefined>();
    const [rowDistance, setRowDistance] = useState<number | undefined>();
    const [plantsPerSquareMeter, setPlantsPerSquareMeter] = useState<number | undefined>();
    const [recommendedDensity, setRecommendedDensity] = useState<number | undefined>();

    // ===== Tolerance (допуски) =====
    const [tempMin, setTempMin] = useState<number | undefined>();
    const [tempMax, setTempMax] = useState<number | undefined>();
    const [humidityMin, setHumidityMin] = useState<number | undefined>();
    const [humidityMax, setHumidityMax] = useState<number | undefined>();
    const [phMin, setPhMin] = useState<number | undefined>();
    const [phMax, setPhMax] = useState<number | undefined>();
    const [ecMin, setEcMin] = useState<number | undefined>();
    const [ecMax, setEcMax] = useState<number | undefined>();
    const [co2Min, setCo2Min] = useState<number | undefined>();
    const [co2Max, setCo2Max] = useState<number | undefined>();

    // ===== Temperature base/max =====
    const [baseTemp, setBaseTemp] = useState<number | undefined>();
    const [maxTempGrowth, setMaxTempGrowth] = useState<number | undefined>();

    // ===== Phenophase GDD =====
    const [phenophases, setPhenophases] = useState<Array<{
        code: string;
        name: string;
        gddRequired: number;
        description: string;
        isCritical: boolean;
    }>>([]);

    // ===== Water Requirement =====
    const [dailyNeedMin, setDailyNeedMin] = useState<number | undefined>();
    const [dailyNeedOpt, setDailyNeedOpt] = useState<number | undefined>();
    const [criticalPhases, setCriticalPhases] = useState<string[]>([]);

    // ===== Light Requirement =====
    const [light, setLight] = useState<Light>({
        ppfdMin: 0,     // μmol/m²/s (минимальный фотосинтетический поток)
        ppfdOpt: 0,      // μmol/m²/s (оптимальный)
        dayLengthMin: 0,  // часов (минимальный световой день)
        dayLengthOpt: 0, // часов (оптимальный световой день)
        photoperiodType: "long_day",  // "short_day", "long_day", "day_neutral"
        criticalPhases: [], // критические BBCH коды для света
    });

    // ===== Characteristics =====
    const [characteristics, setCharacteristics] = useState<Array<{ key: string; value: string }>>([]);

    // ===== UI States =====
    const [activeTab, setActiveTab] = useState<'basic' | 'growth' | 'spacing' | 'tolerance' | 'phenology' | 'resources'>('basic');
    const [newCharKey, setNewCharKey] = useState('');
    const [newCharValue, setNewCharValue] = useState('');
    const [newPhaseCode, setNewPhaseCode] = useState('');
    const [newPhaseName, setNewPhaseName] = useState('');
    const [newPhaseGDD, setNewPhaseGDD] = useState<number | undefined>();
    const [newPhaseCritical, setNewPhaseCritical] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const selectedCrop = crops.find(c => c.id === cropId);

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

    // ===== Добавление фенофазы =====
    const addPhenophase = () => {
        if (newPhaseCode && newPhaseName && newPhaseGDD) {
            setPhenophases([
                ...phenophases,
                {
                    code: newPhaseCode,
                    name: newPhaseName,
                    gddRequired: newPhaseGDD,
                    description: '',
                    isCritical: newPhaseCritical
                }
            ]);
            setNewPhaseCode('');
            setNewPhaseName('');
            setNewPhaseGDD(undefined);
            setNewPhaseCritical(false);
        }
    };

    const removePhenophase = (index: number) => {
        setPhenophases(phenophases.filter((_, i) => i !== index));
    };

    // ===== Валидация =====
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!cropId) newErrors.cropId = 'Выберите культуру';
        if (!name.trim()) newErrors.name = 'Введите название сорта';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ===== Сохранение =====
    const handleSubmit = () => {
        if (!validate()) return;

        const varietyData = {
            cropId,
            name,
            breeder: breeder || undefined,
            description: description || undefined,
            maturity: {
                daysToEmergence: daysToEmergence || undefined,
                daysToFlowering: daysToFlowering || undefined,
                daysToHarvest: daysToHarvest || undefined,
                gddToHarvest: gddToHarvest || undefined
            },
            growth: {
                minHeightCM: minHeight || undefined,
                maxHeightCM: maxHeight || undefined,
                rootDepthCM: rootDepth || undefined,
                canopyDiameterCM: canopyDiameter || undefined,
                determinate,
                supportsPruning,
                supportsTrellis
            },
            spacing: {
                plantDistanceCM: plantDistance || undefined,
                rowDistanceCM: rowDistance || undefined,
                plantsPerSquareMeter: plantsPerSquareMeter || undefined,
                recommendedDensity: recommendedDensity || undefined
            },
            tolerance: {
                temperatureMin: tempMin || undefined,
                temperatureMax: tempMax || undefined,
                humidityMin: humidityMin || undefined,
                humidityMax: humidityMax || undefined,
                phMin: phMin || undefined,
                phMax: phMax || undefined,
                ecMin: ecMin || undefined,
                ecMax: ecMax || undefined,
                co2Min: co2Min || undefined,
                co2Max: co2Max || undefined
            },
            baseTemperature: baseTemp || 0,
            maxTemperature: maxTempGrowth || 35,
            phenophaseGDD: phenophases,
            waterRequirement: {
                dailyNeedMin: dailyNeedMin || 0,
                dailyNeedOpt: dailyNeedOpt || 0,
                criticalPhases
            },
            lightRequirement: light,
            characteristics: characteristics.reduce((acc, {key, value}) => {
                acc[key] = value;
                return acc;
            }, {} as Record<string, string>),
            metadata: {}
        };

        onSuccess(varietyData);
        resetForm();
        onClose();
    };

    // ===== Сброс формы =====
    const resetForm = () => {
        setCropId(preselectedCropId || '');
        setName('');
        setBreeder('');
        setDescription('');
        setDaysToEmergence(undefined);
        setDaysToFlowering(undefined);
        setDaysToHarvest(undefined);
        setGddToHarvest(undefined);
        setMinHeight(undefined);
        setMaxHeight(undefined);
        setRootDepth(undefined);
        setCanopyDiameter(undefined);
        setDeterminate(false);
        setSupportsPruning(false);
        setSupportsTrellis(false);
        setPlantDistance(undefined);
        setRowDistance(undefined);
        setPlantsPerSquareMeter(undefined);
        setRecommendedDensity(undefined);
        setTempMin(undefined);
        setTempMax(undefined);
        setHumidityMin(undefined);
        setHumidityMax(undefined);
        setPhMin(undefined);
        setPhMax(undefined);
        setEcMin(undefined);
        setEcMax(undefined);
        setCo2Min(undefined);
        setCo2Max(undefined);
        setBaseTemp(undefined);
        setMaxTempGrowth(undefined);
        setPhenophases([]);
        setDailyNeedMin(undefined);
        setDailyNeedOpt(undefined);
        setCriticalPhases([]);
        setLight({
            criticalPhases: [],
            dayLengthMin: 0,
            dayLengthOpt: 0,
            photoperiodType: "",
            ppfdMin: 0,
            ppfdOpt: 0
        });
        setCharacteristics([]);
        setErrors({});
    };

    // ===== Tabs =====
    const tabs = [
        {id: 'basic', label: 'Основное', icon: <Leaf className="w-4 h-4"/>},
        {id: 'growth', label: 'Рост', icon: <Sprout className="w-4 h-4"/>},
        {id: 'spacing', label: 'Посадка', icon: <Ruler className="w-4 h-4"/>},
        {id: 'tolerance', label: 'Допуски', icon: <Thermometer className="w-4 h-4"/>},
        {id: 'phenology', label: 'Фенология', icon: <TrendingUp className="w-4 h-4"/>},
        {id: 'resources', label: 'Ресурсы', icon: <Droplet className="w-4 h-4"/>}
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Добавление сорта" size="full">
            <div className="space-y-5 max-h-[85vh] flex flex-col">
                {/* Заголовок с выбором культуры */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Культура *
                        </label>
                        <select
                            value={cropId}
                            onChange={(e) => setCropId(e.target.value)}
                            disabled={!!preselectedCropId}
                            className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg ${
                                errors.cropId ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <option value="">Выберите культуру</option>
                            {crops.map(crop => (
                                <option key={crop.id} value={crop.id}>
                                    {crop.icon} {crop.name}
                                </option>
                            ))}
                        </select>
                        {errors.cropId && <p className="text-xs text-red-500 mt-1">{errors.cropId}</p>}
                    </div>
                    <div className="flex-1 min-w-[200px]">
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
                    <div className="flex-1 min-w-[150px]">
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
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Описание
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder="Описание сорта..."
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg resize-none"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id
                                ? 'bg-white dark:bg-gray-900 text-green-700 dark:text-green-400 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }
              `}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                    {/* Basic Tab */}
                    {activeTab === 'basic' && (
                        <>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-500 mt-0.5"/>
                                    <div>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                            Основная информация о сорте
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                            Укажите сроки созревания и базовые параметры
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Дней до всходов
                                    </label>
                                    <input
                                        type="number"
                                        value={daysToEmergence || ''}
                                        onChange={(e) => setDaysToEmergence(parseInt(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Дней до цветения
                                    </label>
                                    <input
                                        type="number"
                                        value={daysToFlowering || ''}
                                        onChange={(e) => setDaysToFlowering(parseInt(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Дней до сбора
                                    </label>
                                    <input
                                        type="number"
                                        value={daysToHarvest || ''}
                                        onChange={(e) => setDaysToHarvest(parseInt(e.target.value) || undefined)}
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
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Growth Tab */}
                    {activeTab === 'growth' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Мин. высота (см)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={minHeight || ''}
                                        onChange={(e) => setMinHeight(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Макс. высота (см)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={maxHeight || ''}
                                        onChange={(e) => setMaxHeight(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Глубина корней (см)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={rootDepth || ''}
                                        onChange={(e) => setRootDepth(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Диаметр кроны (см)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={canopyDiameter || ''}
                                        onChange={(e) => setCanopyDiameter(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={determinate}
                                        onChange={(e) => setDeterminate(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-green-600"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Детерминантный</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={supportsPruning}
                                        onChange={(e) => setSupportsPruning(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-green-600"
                                    />
                                    <span
                                        className="text-sm text-gray-700 dark:text-gray-300">Требует пасынкования</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={supportsTrellis}
                                        onChange={(e) => setSupportsTrellis(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-green-600"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Подвязка</span>
                                </label>
                            </div>
                        </>
                    )}

                    {/* Spacing Tab */}
                    {activeTab === 'spacing' && (
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
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                />
                            </div>
                        </div>
                    )}

                    {/* Tolerance Tab */}
                    {activeTab === 'tolerance' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Мин. температура (°C)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={tempMin || ''}
                                        onChange={(e) => setTempMin(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Макс. температура (°C)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={tempMax || ''}
                                        onChange={(e) => setTempMax(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Мин. влажность (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={humidityMin || ''}
                                        onChange={(e) => setHumidityMin(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Макс. влажность (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={humidityMax || ''}
                                        onChange={(e) => setHumidityMax(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Мин. pH
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={phMin || ''}
                                        onChange={(e) => setPhMin(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Макс. pH
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={phMax || ''}
                                        onChange={(e) => setPhMax(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Мин. EC (мСм/см)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={ecMin || ''}
                                        onChange={(e) => setEcMin(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Макс. EC (мСм/см)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={ecMax || ''}
                                        onChange={(e) => setEcMax(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Мин. CO₂ (ppm)
                                    </label>
                                    <input
                                        type="number"
                                        value={co2Min || ''}
                                        onChange={(e) => setCo2Min(parseInt(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Макс. CO₂ (ppm)
                                    </label>
                                    <input
                                        type="number"
                                        value={co2Max || ''}
                                        onChange={(e) => setCo2Max(parseInt(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Базовая температура (°C)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={baseTemp || ''}
                                        onChange={(e) => setBaseTemp(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Макс. температура роста (°C)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={maxTempGrowth || ''}
                                        onChange={(e) => setMaxTempGrowth(parseFloat(e.target.value) || undefined)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Phenology Tab */}
                    {activeTab === 'phenology' && (
                        <>
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-amber-500 mt-0.5"/>
                                    <div>
                                        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                                            BBCH фенофазы
                                        </p>
                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                            Добавьте стадии развития с накопленными GDD
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                <input
                                    type="text"
                                    value={newPhaseCode}
                                    onChange={(e) => setNewPhaseCode(e.target.value)}
                                    placeholder="BBCH-10"
                                    className="px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm"
                                />
                                <input
                                    type="text"
                                    value={newPhaseName}
                                    onChange={(e) => setNewPhaseName(e.target.value)}
                                    placeholder="Всходы"
                                    className="px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm"
                                />
                                <input
                                    type="number"
                                    step="0.1"
                                    value={newPhaseGDD || ''}
                                    onChange={(e) => setNewPhaseGDD(parseFloat(e.target.value) || undefined)}
                                    placeholder="GDD"
                                    className="px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg text-sm"
                                />
                                <div className="flex items-center gap-2">
                                    <label
                                        className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={newPhaseCritical}
                                            onChange={(e) => setNewPhaseCritical(e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-gray-300 text-red-500"
                                        />
                                        Крит.
                                    </label>
                                    <button
                                        onClick={addPhenophase}
                                        disabled={!newPhaseCode || !newPhaseName || !newPhaseGDD}
                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>

                            {phenophases.length > 0 && (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {phenophases.map((phase, idx) => (
                                        <div key={idx}
                                             className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-center gap-3">
                        <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                          {phase.code}
                        </span>
                                                <span className="text-sm font-medium">{phase.name}</span>
                                                <span className="text-xs text-gray-500">{phase.gddRequired} GDD</span>
                                                {phase.isCritical && (
                                                    <span className="text-xs text-red-500">⚠️ Критическая</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removePhenophase(idx)}
                                                className="p-1 hover:bg-red-100 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Resources Tab */}
                    {activeTab === 'resources' && (
                        <>
                            {/* Water */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                    <Droplet className="w-4 h-4"/>
                                    Водопотребление
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Мин. потребность (л/м²/день)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={dailyNeedMin || ''}
                                            onChange={(e) => setDailyNeedMin(parseFloat(e.target.value) || undefined)}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Оптимальная потребность (л/м²/день)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={dailyNeedOpt || ''}
                                            onChange={(e) => setDailyNeedOpt(parseFloat(e.target.value) || undefined)}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Критические фазы (BBCH коды через запятую)
                                    </label>
                                    <input
                                        type="text"
                                        value={criticalPhases.join(', ')}
                                        onChange={(e) => setCriticalPhases(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                        placeholder="BBCH-61, BBCH-71"
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Light */}
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                                    <Sun className="w-4 h-4"/>
                                    Освещение
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Мин. PPFD (μmol/m²/s)
                                        </label>
                                        <input
                                            type="number"
                                            value={light.ppfdMin}
                                            onChange={(e) => setLight({
                                                ...light,
                                                ppfdMin: parseInt(e.target.value) || 0
                                            })}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Оптимальный PPFD (μmol/m²/s)
                                        </label>
                                        <input
                                            type="number"
                                            value={light.ppfdOpt}
                                            onChange={(e) => setLight({
                                                ...light,
                                                ppfdOpt: parseInt(e.target.value) || 0
                                            })}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Мин. световой день (часов)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={light.dayLengthMin}
                                            onChange={(e) => setLight({
                                                ...light,
                                                dayLengthMin: parseFloat(e.target.value) || 0
                                            })}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Оптимальный световой день (часов)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={light.dayLengthOpt}
                                            onChange={(e) => setLight({
                                                ...light,
                                                dayLengthOpt: parseFloat(e.target.value) || 0
                                            })}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Тип фотопериода
                                        </label>
                                        <select
                                            value={light.photoperiodType}
                                            onChange={(e) => setLight({
                                                ...light,
                                                photoperiodType: e.target.value || ""
                                            })}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg"
                                        >
                                            <option value="day_neutral">Нейтральный</option>
                                            <option value="short_day">Короткодневный</option>
                                            <option value="long_day">Длиннодневный</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Критические фазы (BBCH коды через запятую)
                                        </label>
                                        <input
                                            type="text"
                                            value={light.criticalPhases.join(', ')}
                                            onChange={(e) => setLight({
                                                ...light,
                                                criticalPhases: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                            })}
                                            placeholder="BBCH-51, BBCH-61"
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Characteristics */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                    <Package className="w-4 h-4"/>
                                    Характеристики
                                </h4>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newCharKey}
                                        onChange={(e) => setNewCharKey(e.target.value)}
                                        placeholder="Характеристика"
                                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={newCharValue}
                                        onChange={(e) => setNewCharValue(e.target.value)}
                                        placeholder="Значение"
                                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg text-sm"
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
                                                 className="flex items-center justify-between px-2 py-1 bg-white dark:bg-gray-900 rounded border border-gray-200">
                                                <span className="text-sm font-medium">{char.key}: <span
                                                    className="font-normal">{char.value}</span></span>
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
                        </>
                    )}
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
                        disabled={!cropId || !name.trim()}
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