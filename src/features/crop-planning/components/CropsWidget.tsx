// features/planning/ui/CropsWidget.tsx
import {useMemo, useState} from 'react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    Filter,
    Flower2,
    MapPin,
    Package,
    Plus,
    Search,
    Sprout,
    TrendingUp
} from 'lucide-react';

// ==================== TYPES ====================

interface CropPlan {
    id: string;
    name: string;
    crop_name: string;
    variety_name: string;
    bed_name: string;
    bed_id: string;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    status_text: string;
    planting_date: string;
    expected_yield: number;
    harvest_kg: number;
    progress: number;
    is_seedling?: boolean;
    seedling_status?: 'sowing' | 'growing' | 'ready' | 'planted' | 'overdue';
}

interface CropsWidgetProps {
    onNavigateToPlan: (planId: string) => void;
}

// ==================== MOCK DATA ====================

const mockPlans: CropPlan[] = [
    {
        id: 'plan-1',
        name: 'Пшеница озимая 2025',
        crop_name: 'Пшеница озимая',
        variety_name: 'Мироновская 65',
        bed_name: 'Поле Северное',
        bed_id: 'field-1',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2024-09-15',
        expected_yield: 4250,
        harvest_kg: 3100,
        progress: 72,
        is_seedling: false
    },
    {
        id: 'plan-2',
        name: 'Томаты ранние 2025',
        crop_name: 'Томат',
        variety_name: 'Бычье сердце',
        bed_name: 'Теплица №1 / Грядка 1',
        bed_id: 'greenhouse-1',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2025-04-20',
        expected_yield: 1750,
        harvest_kg: 450,
        progress: 25,
        is_seedling: true,
        seedling_status: 'growing'
    },
    {
        id: 'plan-3',
        name: 'Кукуруза 2025',
        crop_name: 'Кукуруза',
        variety_name: 'Днепровский 247',
        bed_name: 'Поле Восточное',
        bed_id: 'field-2',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2025-04-25',
        expected_yield: 5250,
        harvest_kg: 3750,
        progress: 71,
        is_seedling: false
    },
    {
        id: 'plan-4',
        name: 'Огурцы весенние 2025',
        crop_name: 'Огурец',
        variety_name: 'Герман F1',
        bed_name: 'Теплица №1 / Грядка 2',
        bed_id: 'greenhouse-1',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2025-05-01',
        expected_yield: 600,
        harvest_kg: 320,
        progress: 53,
        is_seedling: true,
        seedling_status: 'planted'
    },
    {
        id: 'plan-5',
        name: 'Соя 2025',
        crop_name: 'Соя',
        variety_name: 'Аннушка',
        bed_name: 'Поле Западное',
        bed_id: 'field-3',
        status: 'draft',
        status_text: 'Запланирован',
        planting_date: '2025-05-10',
        expected_yield: 2300,
        harvest_kg: 0,
        progress: 0,
        is_seedling: false
    }
];

// ==================== COMPONENTS ====================

const StatusBadge = ({ status }: { status: CropPlan['status'] }) => {
    const config = {
        active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Активен', icon: <CheckCircle className="w-3 h-3" /> },
        completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Завершен', icon: <CheckCircle className="w-3 h-3" /> },
        draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', label: 'Черновик', icon: <Clock className="w-3 h-3" /> },
        cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Отменен', icon: <AlertCircle className="w-3 h-3" /> }
    };
    const style = config[status] || config.draft;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
            {style.label}
    </span>
    );
};

const SeedlingBadge = ({ status }: { status?: string }) => {
    const config: Record<string, { bg: string; text: string; label: string; icon: JSX.Element }> = {
        sowing: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Посев', icon: <Sprout className="w-3 h-3" /> },
        growing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Растет', icon: <Flower2 className="w-3 h-3" /> },
        ready: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Готова', icon: <CheckCircle className="w-3 h-3" /> },
        planted: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Высажена', icon: <MapPin className="w-3 h-3" /> },
        overdue: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Переросла', icon: <AlertCircle className="w-3 h-3" /> }
    };

    if (!status || !config[status]) return null;
    const style = config[status];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
            {style.label}
    </span>
    );
};

export const CropsWidget = ({ onNavigateToPlan }: CropsWidgetProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'planned'>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Фильтрация планов
    const filteredPlans = useMemo(() => {
        let filtered = mockPlans;

        if (searchTerm) {
            filtered = filtered.filter(plan =>
                plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                plan.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                plan.variety_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                plan.bed_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(plan => plan.status === statusFilter);
        }

        return filtered;
    }, [searchTerm, statusFilter]);

    // Статистика
    const stats = useMemo(() => {
        const active = mockPlans.filter(p => p.status === 'active').length;
        const completed = mockPlans.filter(p => p.status === 'completed').length;
        const planned = mockPlans.filter(p => p.status === 'draft').length;
        const totalYield = mockPlans.reduce((sum, p) => sum + p.harvest_kg, 0);
        const avgProgress = mockPlans.reduce((sum, p) => sum + p.progress, 0) / mockPlans.length;

        return { active, completed, planned, totalYield, avgProgress };
    }, []);

    // Получение иконки для культуры
    const getCropIcon = (cropName: string) => {
        const icons: Record<string, string> = {
            'Пшеница озимая': '🌾',
            'Кукуруза': '🌽',
            'Томат': '🍅',
            'Огурец': '🥒',
            'Соя': '🫘',
            'Картофель': '🥔',
            'Морковь': '🥕'
        };
        return icons[cropName] || '🌱';
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Статистика */}
            <div className="p-4 border-b border-white/20 bg-white/5">
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                        <p className="text-xl font-bold text-white">{stats.active}</p>
                        <p className="text-xs text-gray-400">Активных</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-white">{stats.completed}</p>
                        <p className="text-xs text-gray-400">Завершено</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-white">{stats.planned}</p>
                        <p className="text-xs text-gray-400">Запланировано</p>
                    </div>
                </div>

                {/* Прогресс */}
                <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Общий прогресс</span>
                        <span>{Math.round(stats.avgProgress)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${stats.avgProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Поиск и фильтры */}
            <div className="p-3 border-b border-white/20">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Поиск..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-green-500"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-1.5 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <Filter className="w-4 h-4 text-white/70" />
                    </button>
                </div>

                {showFilters && (
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-2 py-1 rounded-md text-xs transition-colors ${
                                statusFilter === 'all' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        >
                            Все
                        </button>
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={`px-2 py-1 rounded-md text-xs transition-colors ${
                                statusFilter === 'active' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        >
                            Активные
                        </button>
                        <button
                            onClick={() => setStatusFilter('completed')}
                            className={`px-2 py-1 rounded-md text-xs transition-colors ${
                                statusFilter === 'completed' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        >
                            Завершенные
                        </button>
                        <button
                            onClick={() => setStatusFilter('planned')}
                            className={`px-2 py-1 rounded-md text-xs transition-colors ${
                                statusFilter === 'planned' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        >
                            Запланированные
                        </button>
                    </div>
                )}
            </div>

            {/* Список посевов */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredPlans.length > 0 ? (
                    filteredPlans.map((plan) => (
                        <div
                            key={plan.id}
                            onClick={() => onNavigateToPlan(plan.id)}
                            className="group p-3 rounded-lg transition-all cursor-pointer bg-white/10 hover:bg-white/20"
                        >
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">{getCropIcon(plan.crop_name)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <h3 className="font-semibold text-white truncate">
                                            {plan.crop_name} • {plan.variety_name}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            {plan.is_seedling && <SeedlingBadge status={plan.seedling_status} />}
                                            <StatusBadge status={plan.status} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-300 mt-1">
                                        {plan.bed_name}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                        {new Date(plan.planting_date).toLocaleDateString('ru')}
                    </span>
                                        {plan.progress > 0 && (
                                            <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                                                {plan.progress}%
                      </span>
                                        )}
                                        {plan.harvest_kg > 0 && (
                                            <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                                                {plan.harvest_kg} / {plan.expected_yield} кг
                      </span>
                                        )}
                                    </div>
                                    {/* Прогресс бар */}
                                    {plan.progress > 0 && (
                                        <div className="mt-2">
                                            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full transition-all"
                                                    style={{ width: `${plan.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors shrink-0 mt-2" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <Sprout className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">Нет посевов</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Перейдите в раздел "Планирование" чтобы создать план
                        </p>
                    </div>
                )}
            </div>

            {/* Кнопка создания нового плана */}
            <div className="p-3 border-t border-white/20 bg-white/5">
                <button
                    onClick={() => window.location.href = '/planning'}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Новый посев
                </button>
            </div>
        </div>
    );
};