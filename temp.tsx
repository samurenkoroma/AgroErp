// pages/farm/FarmPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { FarmMap } from '@/features/farm';
import { useFarmStore } from '@/features/farm/model/store.ts';
import { Layers, List, MapPin, X, Sprout, Calendar, ChevronRight, Search, Filter, Plus, TrendingUp, Package, CheckCircle, Clock, AlertCircle, Flower2 } from "lucide-react";
import { formatArea } from "@/utils/geometry.ts";
import { useNavigate } from "react-router-dom";
import { Field, Greenhouse, Plot } from "@/entities";

// Импортируем PNG иконки
import fieldIcon from '@/assets/images/icons/field-icon.png';
import greenhouseIcon from '@/assets/images/icons/greenhouse-icon.png';
import plotIcon from '@/assets/images/icons/plot-icon.png';

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

// ==================== CROPS_VIEW_COMPONENT ====================

const CropsGridView = ({ onNavigateToPlan }: { onNavigateToPlan: (planId: string) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'planned'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        const totalHarvest = mockPlans.reduce((sum, p) => sum + p.harvest_kg, 0);
        const avgProgress = mockPlans.reduce((sum, p) => sum + p.progress, 0) / mockPlans.length;

        return { active, completed, planned, totalHarvest, avgProgress };
    }, []);

    // Получение иконки для культуры
    const getCropIcon = (cropName: string) => {
        const icons: Record<string, string> = {
            'Пшеница озимая': '🌾',
            'Пшеница яровая': '🌾',
            'Кукуруза': '🌽',
            'Томат': '🍅',
            'Огурец': '🥒',
            'Соя': '🫘',
            'Картофель': '🥔',
            'Морковь': '🥕',
            'Свекла': '🍠',
            'Лук': '🧅',
            'Чеснок': '🧄',
            'Перец': '🫑',
            'Баклажан': '🍆',
            'Кабачок': '🥒',
            'Тыква': '🎃'
        };
        return icons[cropName] || '🌱';
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">
            {/* Header with stats */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Sprout className="w-5 h-5 text-green-600" />
                        Все посевы
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
                                <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
                                <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
                                <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
                                <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
                                <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
                        <p className="text-xs text-gray-500">Активных</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.completed}</p>
                        <p className="text-xs text-gray-500">Завершено</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                        <p className="text-xl font-bold text-gray-600 dark:text-gray-400">{stats.planned}</p>
                        <p className="text-xs text-gray-500">Запланировано</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center">
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{(stats.totalHarvest / 1000).toFixed(1)}т</p>
                        <p className="text-xs text-gray-500">Собрано</p>
                    </div>
                </div>
            </div>

            {/* Search and filters */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Поиск по культуре, сорту или месту..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-3 py-2 border rounded-lg transition-colors flex items-center gap-1 ${
                            showFilters
                                ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400'
                                : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm">Фильтр</span>
                    </button>
                </div>

                {showFilters && (
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                statusFilter === 'all' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                            }`}
                        >
                            Все
                        </button>
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                statusFilter === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                            }`}
                        >
                            Активные
                        </button>
                        <button
                            onClick={() => setStatusFilter('completed')}
                            className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                statusFilter === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                            }`}
                        >
                            Завершенные
                        </button>
                        <button
                            onClick={() => setStatusFilter('planned')}
                            className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                statusFilter === 'planned' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                            }`}
                        >
                            Запланированные
                        </button>
                    </div>
                )}
            </div>

            {/* Crops content - Grid or List */}
            <div className="flex-1 overflow-y-auto p-6">
                {filteredPlans.length > 0 ? (
                    viewMode === 'grid' ? (
                        // Grid view
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    onClick={() => onNavigateToPlan(plan.id)}
                                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl">{getCropIcon(plan.crop_name)}</span>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{plan.crop_name}</h3>
                                                <p className="text-xs text-gray-500">{plan.variety_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <StatusBadge status={plan.status} />
                                            {plan.is_seedling && <SeedlingBadge status={plan.seedling_status} />}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {plan.bed_name}
                                    </p>

                                    <div className="space-y-2 mb-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Прогресс</span>
                                            <span className="font-medium">{plan.progress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 rounded-full transition-all"
                                                style={{ width: `${plan.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                        {new Date(plan.planting_date).toLocaleDateString('ru')}
                    </span>
                                        <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                                            {plan.harvest_kg} / {plan.expected_yield} кг
                    </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // List view
                        <div className="space-y-2">
                            {filteredPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    onClick={() => onNavigateToPlan(plan.id)}
                                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className="text-2xl">{getCropIcon(plan.crop_name)}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">{plan.crop_name}</h3>
                                                    <span className="text-xs text-gray-500">• {plan.variety_name}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {plan.bed_name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-24">
                                                <div className="flex justify-between text-xs mb-0.5">
                                                    <span className="text-gray-500">{plan.progress}%</span>
                                                </div>
                                                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full"
                                                        style={{ width: `${plan.progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={plan.status} />
                                                {plan.is_seedling && <SeedlingBadge status={plan.seedling_status} />}
                                            </div>

                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center py-12">
                        <Sprout className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            Нет посевов
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm || statusFilter !== 'all' ? 'Попробуйте изменить параметры поиска' : 'Создайте свой первый план посева'}
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
                            <button
                                onClick={() => window.location.href = '/planning'}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Создать план
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

const FarmPage = () => {
    const { currentFarm, loadFarm, selectedObjectId, isLoading } = useFarmStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'objects' | 'crops'>('objects');
    const navigate = useNavigate();

    useEffect(() => {
        loadFarm();
    }, []);

    useEffect(() => {
        if (selectedObjectId) {
            console.log('selectedObjectId', selectedObjectId);
        }
    }, [selectedObjectId]);

    const filteredObjects = useMemo(() => {
        if (!currentFarm) return [];
        return [...currentFarm.fields, ...currentFarm.greenhouses, ...currentFarm.plots];
    }, [currentFarm]);

    const handleNavigateToDetails = (obj: Field | Greenhouse | Plot) => {
        if (obj.type === "field") {
            navigate(`/field/${obj.id}`);
        } else if (obj.type === "greenhouse") {
            navigate(`/greenhouse/${obj.id}`);
        } else if (obj.type === "plot") {
            navigate(`/plot/${obj.id}`);
        }
    };

    const handleNavigateToPlan = (planId: string) => {
        navigate(`/plan/${planId}`);
    };

    // Получение иконки для типа объекта (PNG)
    const getObjectIcon = (type: string): string => {
        switch (type) {
            case 'field': return fieldIcon;
            case 'greenhouse': return greenhouseIcon;
            case 'plot': return plotIcon;
            default: return fieldIcon;
        }
    };

    return (
        <div className="relative h-full w-full overflow-hidden">
            {/* Левая область - Карта или Виджет посевов */}
            <div className="absolute inset-0">
                {activeTab === 'objects' ? (
                    <FarmMap
                        objects={filteredObjects}
                        onObjectClick={handleNavigateToDetails}
                    />
                ) : (
                    <CropsGridView onNavigateToPlan={handleNavigateToPlan} />
                )}
            </div>

            {/* Правая панель с табами */}
            <div
                className={`absolute right-0 top-0 h-full transition-all duration-300 ${isSidebarOpen ? 'w-96' : 'w-0'}`}
            >
                <div className="h-full bg-black/60 dark:bg-black/70 backdrop-blur-md border-l border-white/20 shadow-2xl overflow-hidden flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-white/20">
                        <button
                            onClick={() => setActiveTab('objects')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                activeTab === 'objects'
                                    ? 'text-white border-b-2 border-green-500'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <List className="w-4 h-4" />
                            Объекты
                            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                                {filteredObjects.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('crops')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                activeTab === 'crops'
                                    ? 'text-white border-b-2 border-green-500'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Sprout className="w-4 h-4" />
                            Посевы
                        </button>
                    </div>

                    {/* Закрыть панель */}
                    <div className="p-3 flex justify-end">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-white/70" />
                        </button>
                    </div>

                    {/* Контент вкладки "Объекты" */}
                    {activeTab === 'objects' && (
                        <>
                            {/* Статистика */}
                            {filteredObjects.length > 0 && (
                                <div className="px-4 py-2 border-b border-white/20 bg-white/5">
                                    <div className="flex justify-between text-xs text-gray-300">
                                        <span>Общая площадь:</span>
                                        <span className="font-medium text-white">
                                            {formatArea(currentFarm?.totalArea)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Список объектов */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {isLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                    </div>
                                ) : filteredObjects.length > 0 ? (
                                    filteredObjects.map((obj) => (
                                        <div
                                            key={obj.id}
                                            className="group p-3 rounded-lg transition-all cursor-pointer bg-white/10 hover:bg-white/20"
                                            onClick={() => handleNavigateToDetails(obj)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src={getObjectIcon(obj.type)}
                                                    alt={obj.type}
                                                    className="w-8 h-8 rounded-lg object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className="font-semibold text-white truncate">
                                                            {obj.name}
                                                        </h3>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white/80 shrink-0">
                                                            {obj.status === 'active' ? 'Активен' : obj.status === 'maintenance' ? 'Обслуживание' : obj.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-300 mt-1">
                                                        {obj.type === 'field' ? 'Поле' : obj.type === 'greenhouse' ? 'Теплица' : 'Участок'} •
                                                        {formatArea(obj.area)}
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                        <p className="text-gray-400">Объекты не найдены</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Контент вкладки "Посевы" - краткая статистика и подсказка */}
                    {activeTab === 'crops' && (
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="bg-white/10 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sprout className="w-5 h-5 text-green-400" />
                                    <h3 className="font-semibold text-white">Все посевы</h3>
                                </div>
                                <p className="text-sm text-gray-300">
                                    Здесь отображаются все ваши планы посева.
                                    Нажмите на карточку посева слева для просмотра деталей.
                                </p>
                            </div>

                            <div className="bg-white/10 rounded-lg p-4">
                                <h4 className="font-medium text-white mb-2">Быстрые действия</h4>
                                <button
                                    onClick={() => window.location.href = '/planning'}
                                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Создать новый посев
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Подсказка внизу */}
                    <div className="p-3 border-t border-white/20 bg-white/5">
                        <p className="text-xs text-gray-400 text-center">
                            💡 {activeTab === 'objects'
                            ? 'Нажмите на объект для просмотра деталей'
                            : 'Нажмите на карточку посева слева для просмотра деталей'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Кнопка открытия панели */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute right-4 top-4 w-10 h-10 bg-black/50 backdrop-blur rounded-lg shadow-lg flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                >
                    <Layers className="w-5 h-5 text-white"/>
                </button>
            )}
        </div>
    );
};

export default FarmPage;