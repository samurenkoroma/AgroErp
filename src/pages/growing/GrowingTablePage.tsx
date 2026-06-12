// src/pages/growing/GrowingTablePage.tsx
import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AlertCircle, Download, MapPin, Play, Search, Settings, Sprout, TrendingUp} from 'lucide-react';
import {GrowingListItem} from "@/entities/production/growing-cycle";
import {GrowingRow} from "@/features/production/growing_cycle/components/GrowingRow.tsx";
import {useCycles} from "@/features/production/growing_cycle";

// ==================== MOCK DATA ====================


// ==================== STATS CARD ====================

const StatsCard = ({ title, value, unit, icon: Icon, color }: {
    title: string;
    value: string | number;
    unit?: string;
    icon: any;
    color: string
}) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{title}</span>
            <div className={`p-1.5 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
                <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
            </div>
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
    </div>
);

// ==================== MAIN COMPONENT ====================

const GrowingTablePage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [stageFilter, setStageFilter] = useState<string>('all');
    const {data: cycles = []} = useCycles();

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleRowClick = (item: GrowingListItem) => {
        navigate(`/growing/${item.id}`);
    };

    const filteredData = useMemo(() => {
        return cycles.filter(item => {
            const matchesSearch = item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.varietyName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            const matchesStage = stageFilter === 'all' || item.stage === stageFilter;
            return matchesSearch && matchesStatus && matchesStage;
        });
    }, [searchTerm, statusFilter, stageFilter, cycles]);

    const stats = useMemo(() => {
        const totalArea = cycles.reduce((sum, i) => sum + i.allocatedArea, 0);
        const activeCount = cycles.filter(i => i.status === 'active').length;
        const warningCount = cycles.filter(i => i.status === 'warning').length;
        const avgProgress = Math.round(cycles.reduce((sum, i) => sum + i.progress, 0) / cycles.length);

        return { totalArea, activeCount, warningCount, avgProgress };
    }, []);

    // Уникальные стадии для фильтра
    const stages = useMemo(() => {
        const uniqueStages = new Set(cycles.map(i => i.stage));
        return ['all', ...Array.from(uniqueStages)];
    }, []);

    const getStageLabelForFilter = (stage: string) => {
        const labels: Record<string, string> = {
            all: 'Все стадии',
            planning: 'Планирование',
            germination: 'Прорастание',
            seedling: 'Рассада',
            vegetative: 'Вегетация',
            flowering: 'Цветение',
            fruiting: 'Плодоношение',
            harvesting: 'Сбор урожая',
            completed: 'Завершен'
        };
        return labels[stage] || stage;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Sprout className="w-6 h-6 text-green-600" />
                                Текущие посевы
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Мониторинг всех активных циклов выращивания
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Download className="w-5 h-5 text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Settings className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatsCard
                        title="Общая площадь"
                        value={stats.totalArea.toFixed(0)}
                        unit="га"
                        icon={MapPin}
                        color="green"
                    />
                    <StatsCard
                        title="Активных циклов"
                        value={stats.activeCount}
                        icon={Play}
                        color="blue"
                    />
                    <StatsCard
                        title="Требуют внимания"
                        value={stats.warningCount}
                        icon={AlertCircle}
                        color="yellow"
                    />
                    <StatsCard
                        title="Средний прогресс"
                        value={stats.avgProgress}
                        unit="%"
                        icon={TrendingUp}
                        color="purple"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск по культуре или сорту..."
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
                            <option value="active">Активные</option>
                            <option value="warning">Требуют внимания</option>
                            <option value="planned">Запланированные</option>
                            <option value="completed">Завершенные</option>
                        </select>
                        <select
                            value={stageFilter}
                            onChange={(e) => setStageFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                            {stages.map(stage => (
                                <option key={stage} value={stage}>
                                    {getStageLabelForFilter(stage)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Культура / Сорт</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Площадь</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Стадия развития</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Прогресс</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Сроки</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Статус</th>
                                <th className="w-10"></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {filteredData.map((item) => (
                                <GrowingRow
                                    key={item.id}
                                    item={item}
                                    isExpanded={expandedRows.has(item.id)}
                                    onToggle={() => toggleRow(item.id)}
                                    onRowClick={() => handleRowClick(item)}
                                />
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredData.length === 0 && (
                        <div className="text-center py-12">
                            <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">Нет данных по посевам</p>
                            <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры поиска</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrowingTablePage;