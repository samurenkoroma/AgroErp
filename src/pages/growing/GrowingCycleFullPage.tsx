// src/pages/growing/GrowingCycleFullPage.tsx
import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Apple,
    ArrowLeft,
    Building2,
    Calendar,
    Calendar as CalendarIcon,
    CheckCircle,
    Download,
    Edit,
    Flower2,
    Info,
    Leaf,
    Package,
    Plus,
    Ruler,
    Share2,
    Sprout,
    Trash2
} from 'lucide-react';
import {Modal} from '@/components/common/Modal';

// ==================== TYPES ====================

type CycleStage =
    | 'planning' | 'germination' | 'seedling' | 'vegetative'
    | 'flowering' | 'fruiting' | 'harvesting' | 'completed';

type CycleStatus =
    | 'planned' | 'active' | 'paused' | 'harvesting' | 'completed' | 'failed' | 'archived';

type SourceType = 'seed' | 'seedling' | 'cutting' | 'graft';

interface Planting {
    id: string;
    cycleId: string;
    quantity: number;
    sourceType: SourceType;
    plantedAt: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

interface Allocation {
    id: string;
    cycleId: string;
    productionUnitId: string;
    productionUnitName?: string;
    productionUnitType?: string;
    area: number;
    startedAt: string;
    endedAt?: string;
    createdAt: string;
    updatedAt: string;
}

interface GrowingCycle {
    id: string;
    farmId: string;
    cropId: string;
    varietyId?: string;
    protocolId?: string;
    name: string;
    code: string;
    method: string;
    status: CycleStatus;
    stage: CycleStage;
    startedAt?: string;
    completedAt?: string;
    expectedHarvestAt?: string;
    createdAt: string;
    updatedAt: string;
    cropName: string;
    varietyName?: string;
}

interface ProductionUnit {
    id: string;
    name: string;
    type: string;
    area: number;
    areaUnit: 'ha' | 'm2';
    status: string;
}

// ==================== MOCK DATA ====================

const mockCycle: GrowingCycle = {
    id: 'cycle-1',
    farmId: 'farm-1',
    cropId: 'crop-1',
    varietyId: 'var-1',
    name: 'Томаты весенние 2025',
    code: 'T-2025-01',
    method: 'seedling',
    status: 'active',
    stage: 'vegetative',
    startedAt: '2025-04-20T00:00:00Z',
    expectedHarvestAt: '2025-07-20T00:00:00Z',
    createdAt: '2025-03-15T10:00:00Z',
    updatedAt: '2025-05-01T10:00:00Z',
    cropName: 'Томат',
    varietyName: 'Бычье сердце'
};

const mockAllocations: Allocation[] = [
    {
        id: 'alloc-1',
        cycleId: 'cycle-1',
        productionUnitId: 'greenhouse-1',
        productionUnitName: 'Теплица №1',
        productionUnitType: 'GREENHOUSE',
        area: 250,
        startedAt: '2025-04-20T00:00:00Z',
        createdAt: '2025-04-15T10:00:00Z',
        updatedAt: '2025-04-20T10:00:00Z'
    },
    {
        id: 'alloc-2',
        cycleId: 'cycle-1',
        productionUnitId: 'field-1',
        productionUnitName: 'Поле Северное',
        productionUnitType: 'FIELD',
        area: 0.5,
        startedAt: '2025-05-01T00:00:00Z',
        createdAt: '2025-04-25T10:00:00Z',
        updatedAt: '2025-05-01T10:00:00Z'
    }
];

const mockPlantings: Planting[] = [
    {
        id: 'plant-1',
        cycleId: 'cycle-1',
        quantity: 5000,
        sourceType: 'seedling',
        plantedAt: '2025-04-20T00:00:00Z',
        notes: 'Рассада из питомника, сорт Бычье сердце',
        createdAt: '2025-04-18T10:00:00Z',
        updatedAt: '2025-04-20T10:00:00Z'
    },
    {
        id: 'plant-2',
        cycleId: 'cycle-1',
        quantity: 2500,
        sourceType: 'seed',
        plantedAt: '2025-04-25T00:00:00Z',
        notes: 'Прямой посев, сорт Бычье сердце',
        createdAt: '2025-04-22T10:00:00Z',
        updatedAt: '2025-04-25T10:00:00Z'
    }
];

const mockProductionUnits: ProductionUnit[] = [
    { id: 'greenhouse-1', name: 'Теплица №1', type: 'GREENHOUSE', area: 500, areaUnit: 'm2', status: 'active' },
    { id: 'greenhouse-2', name: 'Теплица №2', type: 'GREENHOUSE', area: 800, areaUnit: 'm2', status: 'active' },
    { id: 'field-1', name: 'Поле Северное', type: 'FIELD', area: 50, areaUnit: 'ha', status: 'active' },
    { id: 'field-2', name: 'Поле Восточное', type: 'FIELD', area: 75, areaUnit: 'ha', status: 'active' },
    { id: 'plot-1', name: 'Участок Приусадебный', type: 'PLOT', area: 0.12, areaUnit: 'ha', status: 'active' }
];

// ==================== COMPONENTS ====================

// Вкладка Detail (детали цикла)
const DetailTab = ({ cycle, onUpdate }: { cycle: GrowingCycle; onUpdate: (data: Partial<GrowingCycle>) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: cycle.name,
        status: cycle.status,
        expectedHarvestAt: cycle.expectedHarvestAt?.split('T')[0] || ''
    });

    const statusOptions = [
        { value: 'planned', label: 'Запланирован' },
        { value: 'active', label: 'Активен' },
        { value: 'paused', label: 'Приостановлен' },
        { value: 'harvesting', label: 'Сбор урожая' },
        { value: 'completed', label: 'Завершен' },
        { value: 'failed', label: 'Неудача' }
    ];

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    const stageConfig: Record<CycleStage, { label: string; icon: JSX.Element; color: string; progress: number }> = {
        planning: { label: 'Планирование', icon: <Calendar className="w-4 h-4" />, color: 'bg-gray-500', progress: 0 },
        germination: { label: 'Прорастание', icon: <Sprout className="w-4 h-4" />, color: 'bg-blue-500', progress: 14 },
        seedling: { label: 'Рассада', icon: <Leaf className="w-4 h-4" />, color: 'bg-green-500', progress: 28 },
        vegetative: { label: 'Вегетация', icon: <Flower2 className="w-4 h-4" />, color: 'bg-emerald-500', progress: 42 },
        flowering: { label: 'Цветение', icon: <Flower2 className="w-4 h-4" />, color: 'bg-purple-500', progress: 57 },
        fruiting: { label: 'Плодоношение', icon: <Apple className="w-4 h-4" />, color: 'bg-orange-500', progress: 71 },
        harvesting: { label: 'Сбор урожая', icon: <Package className="w-4 h-4" />, color: 'bg-amber-500', progress: 85 },
        completed: { label: 'Завершен', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-500', progress: 100 }
    };

    const currentStage = stageConfig[cycle.stage];
    const stageIndex = Object.keys(stageConfig).findIndex(key => key === cycle.stage);
    const totalStages = Object.keys(stageConfig).length;
    const stageProgress = ((stageIndex + 1) / totalStages) * 100;

    return (
        <div className="space-y-6">
            {/* Основная информация */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Основная информация</h2>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                            <Edit className="w-4 h-4" />
                            Редактировать
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Название
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Статус
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as CycleStatus })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ожидаемый сбор урожая
                            </label>
                            <input
                                type="date"
                                value={formData.expectedHarvestAt}
                                onChange={(e) => setFormData({ ...formData, expectedHarvestAt: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Сохранить
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Код</p>
                            <p className="font-medium text-gray-900 dark:text-white">{cycle.code}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Культура</p>
                            <p className="font-medium text-gray-900 dark:text-white">{cycle.cropName}</p>
                        </div>
                        {cycle.varietyName && (
                            <div>
                                <p className="text-sm text-gray-500">Сорт</p>
                                <p className="font-medium text-gray-900 dark:text-white">{cycle.varietyName}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500">Метод</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {cycle.method === 'seedling' ? 'Рассадный' : cycle.method === 'direct' ? 'Прямой посев' : 'Гидропоника'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Дата начала</p>
                            <p className="font-medium">{formatDate(cycle.startedAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Плановый сбор</p>
                            <p className="font-medium">{formatDate(cycle.expectedHarvestAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Статус</p>
                            <p className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                {cycle.status === 'active' ? 'Активен' : cycle.status}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Дата создания</p>
                            <p className="font-medium">{formatDate(cycle.createdAt)}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Стадия развития */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Стадия развития</h2>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${currentStage.color.replace('bg', 'bg/10')} dark:bg-opacity-20`}>
                        {currentStage.icon}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Текущая стадия</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{currentStage.label}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Прогресс цикла</span>
                        <span>{Math.round(stageProgress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${stageProgress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Вкладка Allocation (распределение по объектам)
const AllocationTab = ({
                           allocations,
                           productionUnits,
                           onAdd,
                           onRemove,
                           cycleId
                       }: {
    allocations: Allocation[];
    productionUnits: ProductionUnit[];
    onAdd: (data: Partial<Allocation>) => void;
    onRemove: (id: string) => void;
    cycleId: string;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState('');
    const [area, setArea] = useState<number>(0);
    const [startedAt, setStartedAt] = useState(new Date().toISOString().split('T')[0]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru');
    };

    const formatArea = (area: number, unit?: string) => {
        if (area < 0.01) return `${(area * 10000).toFixed(0)} м²`;
        return `${area.toFixed(2)} га`;
    };

    const getUnitTypeIcon = (type: string) => {
        switch (type) {
            case 'FIELD': return '🌾';
            case 'GREENHOUSE': return '🌱';
            case 'PLOT': return '🏡';
            default: return '📍';
        }
    };

    const selectedUnit = productionUnits.find(u => u.id === selectedUnitId);
    const totalAllocatedArea = allocations.reduce((sum, a) => sum + a.area, 0);

    const handleAdd = () => {
        if (!selectedUnitId || area <= 0) return;

        onAdd({
            productionUnitId: selectedUnitId,
            area,
            startedAt: new Date(startedAt).toISOString()
        });

        setIsModalOpen(false);
        setSelectedUnitId('');
        setArea(0);
    };

    return (
        <div className="space-y-6">
            {/* Статистика распределения */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm">Распределено объектов</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{allocations.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Ruler className="w-4 h-4" />
                        <span className="text-sm">Общая площадь</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAllocatedArea.toFixed(2)} га</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-sm">Начало сезона</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {allocations.length > 0 ? formatDate(allocations[0].startedAt) : '—'}
                    </p>
                </div>
            </div>

            {/* Список распределений */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900 dark:text-white">Распределение по объектам</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Добавить
                    </button>
                </div>

                {allocations.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Нет распределенных объектов</p>
                        <p className="text-sm mt-1">Добавьте места выращивания для этого цикла</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {allocations.map((alloc) => {
                            const unit = productionUnits.find(u => u.id === alloc.productionUnitId);
                            return (
                                <div key={alloc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getUnitTypeIcon(alloc.productionUnitType || '')}</span>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{alloc.productionUnitName}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                <span>Площадь: {formatArea(alloc.area)}</span>
                                                <span>Начало: {formatDate(alloc.startedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRemove(alloc.id)}
                                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Модалка добавления */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Добавить объект" size="md">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Объект *
                        </label>
                        <select
                            value={selectedUnitId}
                            onChange={(e) => setSelectedUnitId(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        >
                            <option value="">Выберите объект</option>
                            {productionUnits.map(unit => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.name} ({unit.area} {unit.areaUnit === 'ha' ? 'га' : 'м²'})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Площадь *
                        </label>
                        <input
                            type="number"
                            value={area || ''}
                            onChange={(e) => setArea(parseFloat(e.target.value))}
                            placeholder="Введите площадь"
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Макс. площадь: {selectedUnit ? formatArea(selectedUnit.area, selectedUnit.areaUnit) : '—'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Дата начала
                        </label>
                        <input
                            type="date"
                            value={startedAt}
                            onChange={(e) => setStartedAt(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg">
                        Отмена
                    </button>
                    <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">
                        Добавить
                    </button>
                </div>
            </Modal>
        </div>
    );
};

// Вкладка Planting (посадочный материал)
const PlantingTab = ({
                         plantings,
                         onAdd,
                         onRemove,
                         cycleId
                     }: {
    plantings: Planting[];
    onAdd: (data: Partial<Planting>) => void;
    onRemove: (id: string) => void;
    cycleId: string;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quantity, setQuantity] = useState<number>(0);
    const [sourceType, setSourceType] = useState<SourceType>('seedling');
    const [plantedAt, setPlantedAt] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru');
    };

    const sourceTypeLabels: Record<SourceType, { label: string; icon: string }> = {
        seed: { label: 'Семена', icon: '🌱' },
        seedling: { label: 'Рассада', icon: '🌿' },
        cutting: { label: 'Черенки', icon: '✂️' },
        graft: { label: 'Прививки', icon: '🔗' }
    };

    const totalQuantity = plantings.reduce((sum, p) => sum + p.quantity, 0);

    const handleAdd = () => {
        if (quantity <= 0) return;

        onAdd({
            quantity,
            sourceType,
            plantedAt: new Date(plantedAt).toISOString(),
            notes
        });

        setIsModalOpen(false);
        setQuantity(0);
        setSourceType('seedling');
        setNotes('');
    };

    return (
        <div className="space-y-6">
            {/* Статистика посадочного материала */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Package className="w-4 h-4" />
                        <span className="text-sm">Всего посажено</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalQuantity.toLocaleString()} шт</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-sm">Партий посадки</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{plantings.length}</p>
                </div>
            </div>

            {/* Список посадок */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900 dark:text-white">Партии посадки</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Добавить партию
                    </button>
                </div>

                {plantings.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Нет зарегистрированных посадок</p>
                        <p className="text-sm mt-1">Добавьте информацию о посадочном материале</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {plantings.map((plant) => (
                            <div key={plant.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xl">{sourceTypeLabels[plant.sourceType].icon}</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                        {sourceTypeLabels[plant.sourceType].label}
                      </span>
                                            <span className="text-sm text-gray-500">• {plant.quantity.toLocaleString()} шт</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                          {formatDate(plant.plantedAt)}
                      </span>
                                        </div>
                                        {plant.notes && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{plant.notes}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onRemove(plant.id)}
                                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Модалка добавления */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Добавить посадку" size="md">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Тип материала *
                        </label>
                        <select
                            value={sourceType}
                            onChange={(e) => setSourceType(e.target.value as SourceType)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        >
                            <option value="seed">🌱 Семена</option>
                            <option value="seedling">🌿 Рассада</option>
                            <option value="cutting">✂️ Черенки</option>
                            <option value="graft">🔗 Прививки</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Количество *
                        </label>
                        <input
                            type="number"
                            value={quantity || ''}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            placeholder="Введите количество"
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Дата посадки
                        </label>
                        <input
                            type="date"
                            value={plantedAt}
                            onChange={(e) => setPlantedAt(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Заметки
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Дополнительная информация..."
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg resize-none"
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg">
                        Отмена
                    </button>
                    <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">
                        Добавить
                    </button>
                </div>
            </Modal>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

const GrowingCycleFullPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState<'detail' | 'allocation' | 'planting'>('detail');
    const [cycle, setCycle] = useState<GrowingCycle>(mockCycle);
    const [allocations, setAllocations] = useState<Allocation[]>(mockAllocations);
    const [plantings, setPlantings] = useState<Planting[]>(mockPlantings);
    const [productionUnits] = useState<ProductionUnit[]>(mockProductionUnits);

    const handleUpdateCycle = (data: Partial<GrowingCycle>) => {
        setCycle(prev => ({ ...prev, ...data }));
    };

    const handleAddAllocation = (data: Partial<Allocation>) => {
        const unit = productionUnits.find(u => u.id === data.productionUnitId);
        const newAllocation: Allocation = {
            id: `alloc-${Date.now()}`,
            cycleId: cycle.id,
            productionUnitId: data.productionUnitId!,
            productionUnitName: unit?.name,
            productionUnitType: unit?.type,
            area: data.area!,
            startedAt: data.startedAt!,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setAllocations(prev => [...prev, newAllocation]);
    };

    const handleRemoveAllocation = (id: string) => {
        setAllocations(prev => prev.filter(a => a.id !== id));
    };

    const handleAddPlanting = (data: Partial<Planting>) => {
        const newPlanting: Planting = {
            id: `plant-${Date.now()}`,
            cycleId: cycle.id,
            quantity: data.quantity!,
            sourceType: data.sourceType as SourceType,
            plantedAt: data.plantedAt!,
            notes: data.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setPlantings(prev => [...prev, newPlanting]);
    };

    const handleRemovePlanting = (id: string) => {
        setPlantings(prev => prev.filter(p => p.id !== id));
    };

    const tabs = [
        { id: 'detail', label: 'Детали', icon: <Info className="w-4 h-4" /> },
        { id: 'allocation', label: 'Распределение', icon: <Building2 className="w-4 h-4" />, badge: allocations.length },
        { id: 'planting', label: 'Посадка', icon: <Sprout className="w-4 h-4" />, badge: plantings.length }
    ];

    const getCropIcon = () => {
        const icons: Record<string, string> = {
            'Томат': '🍅',
            'Огурец': '🥒',
            'Перец сладкий': '🫑',
            'Баклажан': '🍆'
        };
        return icons[cycle.cropName] || '🌱';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/growing')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{getCropIcon()}</span>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{cycle.name}</h1>
                                    <p className="text-sm text-gray-500">{cycle.code} • {cycle.cropName} {cycle.varietyName && `• ${cycle.varietyName}`}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Share2 className="w-5 h-5 text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Download className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-6 pt-6">
                <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
              `}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.badge !== undefined && tab.badge > 0 && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
                  {tab.badge}
                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                {activeTab === 'detail' && (
                    <DetailTab cycle={cycle} onUpdate={handleUpdateCycle} />
                )}

                {activeTab === 'allocation' && (
                    <AllocationTab
                        allocations={allocations}
                        productionUnits={productionUnits}
                        onAdd={handleAddAllocation}
                        onRemove={handleRemoveAllocation}
                        cycleId={cycle.id}
                    />
                )}

                {activeTab === 'planting' && (
                    <PlantingTab
                        plantings={plantings}
                        onAdd={handleAddPlanting}
                        onRemove={handleRemovePlanting}
                        cycleId={cycle.id}
                    />
                )}
            </div>
        </div>
    );
};

export default GrowingCycleFullPage;