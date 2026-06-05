import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Apple,
    Archive,
    Calendar,
    CheckCircle,
    Edit,
    Flower2,
    Leaf,
    MoreVertical,
    Package,
    Pause,
    Play,
    Plus,
    Search,
    Sprout,
    XCircle
} from 'lucide-react';
import {Modal} from '@/components/common/Modal';
import {CycleModal} from "@/features/production/growing_cycle/components/CycleModal.tsx";
import {useCycles} from "@/features/production/growing_cycle/queries.ts";
import {useProductionUnits} from "@/features/spatial/production-unit/queries.ts";
import Loading from "@/components/shared/Loading.tsx";
import Error from "@/components/shared/Error.tsx";

// ==================== TYPES ====================

type CycleStage =
    | 'planning'
    | 'germination'
    | 'seedling'
    | 'vegetative'
    | 'flowering'
    | 'fruiting'
    | 'harvesting'
    | 'completed';

type CycleStatus =
    | 'planned'
    | 'active'
    | 'paused'
    | 'harvesting'
    | 'completed'
    | 'failed'
    | 'archived';

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
    cropName?: string;
    varietyName?: string;
    area?: number;
    areaUnit?: string;
    progress?: number;
}

interface Crop {
    id: string;
    name: string;
    category: string;
    icon: string;
    color: string;
}

interface Variety {
    id: string;
    name: string;
    cropId: string;
    daysToMaturity: number;
}

// ==================== MOCK DATA ====================

const mockCrops: Crop[] = [
    { id: 'crop-1', name: 'Томат', category: 'Овощные', icon: '🍅', color: '#ef4444' },
    { id: 'crop-2', name: 'Огурец', category: 'Овощные', icon: '🥒', color: '#22c55e' },
    { id: 'crop-3', name: 'Перец сладкий', category: 'Овощные', icon: '🫑', color: '#f97316' },
    { id: 'crop-4', name: 'Баклажан', category: 'Овощные', icon: '🍆', color: '#8b5cf6' },
    { id: 'crop-5', name: 'Салат', category: 'Зеленные', icon: '🥬', color: '#22c55e' },
    { id: 'crop-6', name: 'Базилик', category: 'Пряные', icon: '🌿', color: '#22c55e' },
    { id: 'crop-7', name: 'Клубника', category: 'Ягодные', icon: '🍓', color: '#ef4444' }
];

const mockVarieties: Variety[] = [
    { id: 'var-1', name: 'Бычье сердце', cropId: 'crop-1', daysToMaturity: 120 },
    { id: 'var-2', name: 'Черри красный', cropId: 'crop-1', daysToMaturity: 90 },
    { id: 'var-3', name: 'Герман F1', cropId: 'crop-2', daysToMaturity: 45 },
    { id: 'var-4', name: 'Калифорнийское чудо', cropId: 'crop-3', daysToMaturity: 100 },
    { id: 'var-5', name: 'Алмаз', cropId: 'crop-4', daysToMaturity: 120 }
];

const mockGrowingCycles: GrowingCycle[] = [
    {
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
        varietyName: 'Бычье сердце',
        area: 0.5,
        areaUnit: 'ha',
        progress: 35
    },
    {
        id: 'cycle-2',
        farmId: 'farm-1',
        cropId: 'crop-2',
        varietyId: 'var-3',
        name: 'Огурцы ранние 2025',
        code: 'O-2025-01',
        method: 'seedling',
        status: 'active',
        stage: 'flowering',
        startedAt: '2025-04-01T00:00:00Z',
        expectedHarvestAt: '2025-06-15T00:00:00Z',
        createdAt: '2025-03-01T10:00:00Z',
        updatedAt: '2025-05-01T10:00:00Z',
        cropName: 'Огурец',
        varietyName: 'Герман F1',
        area: 0.3,
        areaUnit: 'ha',
        progress: 60
    },
    {
        id: 'cycle-3',
        farmId: 'farm-1',
        cropId: 'crop-3',
        name: 'Перец сладкий 2025',
        code: 'P-2025-01',
        method: 'seedling',
        status: 'planned',
        stage: 'planning',
        expectedHarvestAt: '2025-08-25T00:00:00Z',
        createdAt: '2025-04-10T10:00:00Z',
        updatedAt: '2025-04-10T10:00:00Z',
        cropName: 'Перец сладкий',
        varietyName: 'Калифорнийское чудо',
        area: 0.2,
        areaUnit: 'ha',
        progress: 0
    },
    {
        id: 'cycle-4',
        farmId: 'farm-1',
        cropId: 'crop-7',
        name: 'Клубника ремонтантная',
        code: 'K-2025-01',
        method: 'seedling',
        status: 'harvesting',
        stage: 'harvesting',
        startedAt: '2025-03-01T00:00:00Z',
        expectedHarvestAt: '2025-10-15T00:00:00Z',
        createdAt: '2025-02-01T10:00:00Z',
        updatedAt: '2025-05-01T10:00:00Z',
        cropName: 'Клубника',
        area: 0.15,
        areaUnit: 'ha',
        progress: 85
    },
    {
        id: 'cycle-5',
        farmId: 'farm-1',
        cropId: 'crop-1',
        varietyId: 'var-2',
        name: 'Томаты черри 2024',
        code: 'T-2024-02',
        method: 'seedling',
        status: 'completed',
        stage: 'completed',
        startedAt: '2024-03-01T00:00:00Z',
        completedAt: '2024-08-15T00:00:00Z',
        expectedHarvestAt: '2024-07-15T00:00:00Z',
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-08-15T10:00:00Z',
        cropName: 'Томат',
        varietyName: 'Черри красный',
        area: 0.4,
        areaUnit: 'ha',
        progress: 100
    }
];

// ==================== STAGE CONFIGURATION ====================

const stageConfig: Record<CycleStage, { label: string; icon: JSX.Element; color: string; order: number }> = {
    planning: { label: 'Планирование', icon: <Calendar className="w-4 h-4" />, color: 'bg-gray-100 text-gray-600', order: 0 },
    germination: { label: 'Прорастание', icon: <Sprout className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600', order: 1 },
    seedling: { label: 'Рассада', icon: <Leaf className="w-4 h-4" />, color: 'bg-green-100 text-green-600', order: 2 },
    vegetative: { label: 'Вегетация', icon: <Flower2 className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-600', order: 3 },
    flowering: { label: 'Цветение', icon: <Flower2 className="w-4 h-4" />, color: 'bg-purple-100 text-purple-600', order: 4 },
    fruiting: { label: 'Плодоношение', icon: <Apple className="w-4 h-4" />, color: 'bg-orange-100 text-orange-600', order: 5 },
    harvesting: { label: 'Сбор урожая', icon: <Package className="w-4 h-4" />, color: 'bg-amber-100 text-amber-600', order: 6 },
    completed: { label: 'Завершен', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-600', order: 7 }
};

const statusConfig: Record<CycleStatus, { label: string; icon: JSX.Element; color: string }> = {
    planned: { label: 'Запланирован', icon: <Calendar className="w-3 h-3" />, color: 'bg-gray-100 text-gray-600' },
    active: { label: 'Активен', icon: <Play className="w-3 h-3" />, color: 'bg-green-100 text-green-600' },
    paused: { label: 'Приостановлен', icon: <Pause className="w-3 h-3" />, color: 'bg-yellow-100 text-yellow-600' },
    harvesting: { label: 'Сбор урожая', icon: <Package className="w-3 h-3" />, color: 'bg-blue-100 text-blue-600' },
    completed: { label: 'Завершен', icon: <CheckCircle className="w-3 h-3" />, color: 'bg-green-100 text-green-600' },
    failed: { label: 'Неудача', icon: <XCircle className="w-3 h-3" />, color: 'bg-red-100 text-red-600' },
    archived: { label: 'Архив', icon: <Archive className="w-3 h-3" />, color: 'bg-gray-100 text-gray-600' }
};

// ==================== COMPONENTS ====================

const StageBadge = ({ stage }: { stage: CycleStage }) => {
    const config = stageConfig[stage];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
            {config.label}
    </span>
    );
};

const StatusBadge = ({ status }: { status: CycleStatus }) => {
    const config = statusConfig[status];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
            {config.label}
    </span>
    );
};

// Стадия прогресса
const StageProgress = ({ currentStage }: { currentStage: CycleStage }) => {
    const stages = Object.entries(stageConfig).sort((a, b) => a[1].order - b[1].order);
    const currentIndex = stageConfig[currentStage].order;

    return (
        <div className="flex items-center justify-between">
            {stages.map(([key, config], idx) => {
                const isCompleted = idx <= currentIndex;
                const isCurrent = idx === currentIndex;

                return (
                    <div key={key} className="flex flex-col items-center flex-1">
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm
              ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}
              ${isCurrent ? 'ring-2 ring-green-500 ring-offset-2' : ''}
            `}>
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> : config.icon}
                        </div>
                        <span className="text-xs text-gray-500 mt-1 hidden md:block">{config.label}</span>
                        {idx < stages.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// Карточка цикла
const CycleCard = ({ cycle, onClick }: { cycle: GrowingCycle; onClick: () => void }) => {
    const getCropIcon = (cropName: string) => {
        const icons: Record<string, string> = {
            'Томат': '🍅',
            'Огурец': '🥒',
            'Перец сладкий': '🫑',
            'Баклажан': '🍆',
            'Салат': '🥬',
            'Базилик': '🌿',
            'Клубника': '🍓'
        };
        return icons[cropName] || '🌱';
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru');
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress >= 25) return 'bg-yellow-500';
        return 'bg-gray-500';
    };

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCropIcon(cycle.cropName || '')}</span>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{cycle.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500 font-mono">{cycle.code}</span>
                            <StatusBadge status={cycle.status} />
                            <StageBadge stage={cycle.stage} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Прогресс</span>
                    <span className="font-medium">{cycle.progress || 0}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${getProgressColor(cycle.progress || 0)}`}
                        style={{ width: `${cycle.progress || 0}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Старт: {formatDate(cycle.startedAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    <span>Уборка: {formatDate(cycle.expectedHarvestAt)}</span>
                </div>
            </div>

            {cycle.varietyName && (
                <p className="text-xs text-gray-400 mt-2">
                    Сорт: {cycle.varietyName}
                </p>
            )}
        </div>
    );
};


// Модалка подтверждения
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full">
                <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                </div>
                <div className="p-5">
                    <p className="text-gray-600 dark:text-gray-400">{message}</p>
                </div>
                <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                        Отмена
                    </button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Подтвердить
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

const GrowingCyclesPagev2 = () => {
    const navigate = useNavigate();
    const {data: cycles, isLoading, error} = useCycles();
    // const [cycles, setCycles] = useState<GrowingCycle[]>(mockGrowingCycles);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCycle, setEditingCycle] = useState<GrowingCycle | null>(null);
    const [deletingCycle, setDeletingCycle] = useState<GrowingCycle | null>(null);

    const filteredCycles = useMemo(() => {
        let filtered = cycles || [];

        if (searchTerm) {
            filtered = filtered.filter(cycle =>
                cycle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cycle.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cycle.cropName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(cycle => cycle.status === statusFilter);
        }

        return filtered;
    }, [cycles, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        if (!cycles){
            return [];
        }
        const active = cycles.filter(c => c.status === 'active').length;
        const planned = cycles.filter(c => c.status === 'planned').length;
        const completed = cycles.filter(c => c.status === 'completed').length;
        const harvesting = cycles.filter(c => c.status === 'harvesting').length;
        const totalArea = cycles.reduce((sum, c) => sum + (c.area || 0), 0);

        return { active, planned, completed, harvesting, totalArea };
    }, [cycles]);

    const handleCreateCycle = (data: any) => {
        // const newCycle: GrowingCycle = {
        //     id: `cycle-${Date.now()}`,
        //     farmId: 'farm-1',
        //     cropId: data.cropId,
        //     varietyId: data.varietyId || undefined,
        //     name: data.name,
        //     code: `${data.cropId === 'crop-1' ? 'T' : data.cropId === 'crop-2' ? 'O' : 'C'}-${new Date().getFullYear()}-${Math.floor(Math.random() * 100)}`,
        //     method: data.method,
        //     status: 'planned',
        //     stage: 'planning',
        //     expectedHarvestAt: data.expectedHarvestAt ? new Date(data.expectedHarvestAt).toISOString() : undefined,
        //     createdAt: new Date().toISOString(),
        //     updatedAt: new Date().toISOString(),
        //     cropName: mockCrops.find(c => c.id === data.cropId)?.name,
        //     varietyName: mockVarieties.find(v => v.id === data.varietyId)?.name,
        //     area: data.area,
        //     areaUnit: data.areaUnit,
        //     progress: 0
        // };
        // setCycles(prev => [newCycle, ...prev]);
        setIsModalOpen(false);
    };

    const handleUpdateCycle = (data: any) => {
        if (!editingCycle) return;

        // setCycles(prev => prev.map(cycle =>
        //     cycle.id === editingCycle.id
        //         ? {
        //             ...cycle,
        //             name: data.name,
        //             cropId: data.cropId,
        //             varietyId: data.varietyId,
        //             method: data.method,
        //             expectedHarvestAt: data.expectedHarvestAt ? new Date(data.expectedHarvestAt).toISOString() : undefined,
        //             area: data.area,
        //             areaUnit: data.areaUnit,
        //             cropName: mockCrops.find(c => c.id === data.cropId)?.name,
        //             varietyName: mockVarieties.find(v => v.id === data.varietyId)?.name,
        //             updatedAt: new Date().toISOString()
        //         }
        //         : cycle
        // ));
        // setEditingCycle(null);
        setIsModalOpen(false);
    };

    const handleDeleteCycle = () => {
        if (!deletingCycle) return;
        // setCycles(prev => prev.filter(c => c.id !== deletingCycle.id));
        setDeletingCycle(null);
    };

    const handleCycleClick = (cycleId: string) => {
        navigate(`/growing/${cycleId}`);
    };

    if (isLoading) return (<Loading text="Загрузка посевов..."/>);
    if (error || !cycles) return (<Error text="Посевы не найдена"/>);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Sprout className="w-6 h-6 text-green-600" />
                                Циклы выращивания
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Управление всеми циклами выращивания культур
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingCycle(null);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Новый цикл
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        <p className="text-xs text-gray-500">Активных</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.harvesting}</p>
                        <p className="text-xs text-gray-500">Сбор урожая</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.planned}</p>
                        <p className="text-xs text-gray-500">Запланировано</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
                        <p className="text-xs text-gray-500">Завершено</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-2xl font-bold text-amber-600">{stats.totalArea.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Всего га</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск по названию или коду..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                            <option value="all">Все статусы</option>
                            <option value="planned">Запланированные</option>
                            <option value="active">Активные</option>
                            <option value="harvesting">Сбор урожая</option>
                            <option value="completed">Завершенные</option>
                        </select>
                    </div>
                </div>

                {/* Cycles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCycles.map((cycle) => (
                        <CycleCard
                            key={cycle.id}
                            cycle={cycle}
                            onClick={() => handleCycleClick(cycle.id)}
                        />
                    ))}
                </div>

                {filteredCycles.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                        <Sprout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            Нет циклов выращивания
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Попробуйте изменить параметры поиска'
                                : 'Создайте свой первый цикл выращивания'}
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Создать цикл
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            { isModalOpen && (<CycleModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCycle(null);
                }}
                onSave={editingCycle ? handleUpdateCycle : handleCreateCycle}
                initialData={editingCycle || undefined}
            />)}

            <ConfirmModal
                isOpen={!!deletingCycle}
                onClose={() => setDeletingCycle(null)}
                onConfirm={handleDeleteCycle}
                title="Удаление цикла"
                message={`Вы уверены, что хотите удалить цикл "${deletingCycle?.name}"? Это действие нельзя отменить.`}
            />
        </div>
    );
};

export default GrowingCyclesPagev2;