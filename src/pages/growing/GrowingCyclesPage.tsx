// src/pages/growing/GrowingCyclesPage.tsx
import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {MoreVertical, Plus, Search} from 'lucide-react';
import {Modal} from '@/components/common/Modal';
import {CycleMethod, CycleStatus, GrowingCycle} from "@/entities/production";
import {mockCycles} from "@/data/growing-cycle/mock-data.ts";
import {useCycles} from "@/features/production/growing_cycle/queries.ts";

const statusConfig: Record<CycleStatus, { label: string; color: string }> = {
    planned: { label: 'Запланирован', color: 'bg-gray-100 text-gray-700' },
    active: { label: 'Активен', color: 'bg-green-100 text-green-700' },
    paused: { label: 'Приостановлен', color: 'bg-yellow-100 text-yellow-700' },
    harvesting: { label: 'Сбор урожая', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Завершен', color: 'bg-green-100 text-green-700' },
    failed: { label: 'Неудача', color: 'bg-red-100 text-red-700' },
    archived: { label: 'Архив', color: 'bg-gray-100 text-gray-700' }
};

const methodConfig: Record<CycleMethod, string> = {
    seedling: 'Рассадный',
    direct: 'Прямой посев',
    hydroponic: 'Гидропоника'
};

const GrowingCyclesPage = () => {
    const navigate = useNavigate();
    const {data: cycles, isLoading, error} = useCycles();
    // const [cycles, setCycles] = useState<GrowingCycle[]>(mockCycles);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        cropId: '',
        varietyId: '',
        method: 'seedling' as CycleMethod,
        expectedHarvestAt: ''
    });

    const filteredCycles = useMemo(() => {
        let filtered = cycles || [];
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.cropName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(c => c.status === statusFilter);
        }
        return filtered;
    }, [cycles, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        if (!cycles){
            return [];
        }

        return {
            total: cycles.length,
            active: cycles.filter(c => c.status === 'active').length,
            planned: cycles.filter(c => c.status === 'planned').length,
            harvesting: cycles.filter(c => c.status === 'harvesting').length
        };
    }, [cycles]);

    const handleCreateCycle = () => {
        const newCycle: GrowingCycle = {
            id: `cycle-${Date.now()}`,
            name: formData.name,
            code: formData.code,
            cropId: formData.cropId,
            cropName: 'Томат',
            method: formData.method,
            status: 'planned',
            expectedHarvestAt: formData.expectedHarvestAt ? new Date(formData.expectedHarvestAt).toISOString() : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setCycles(prev => [newCycle, ...prev]);
        setIsCreateModalOpen(false);
        setFormData({ name: '', code: '', cropId: '', varietyId: '', method: 'seedling', expectedHarvestAt: '' });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Циклы выращивания</h1>
                            <p className="text-sm text-gray-500 mt-1">Управление всеми циклами выращивания культур</p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Создать цикл
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        <p className="text-xs text-gray-500">Всего циклов</p>
                    </div>
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
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск по названию или коду..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        >
                            <option value="all">Все статусы</option>
                            <option value="planned">Запланированные</option>
                            <option value="active">Активные</option>
                            <option value="harvesting">Сбор урожая</option>
                            <option value="completed">Завершенные</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Код</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Название</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Культура</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Сорт</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Статус</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Плановый сбор</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500"></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {filteredCycles.map((cycle) => {
                                const status = statusConfig[cycle.status];
                                return (
                                    <tr
                                        key={cycle.id}
                                        onClick={() => navigate(`/growing-domain/${cycle.id}`)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{cycle.code}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{cycle.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cycle.cropName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{cycle.varietyName || '—'}</td>
                                        <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(cycle.expectedHarvestAt)}</td>
                                        <td className="px-4 py-3">
                                            <button className="p-1 hover:bg-gray-100 rounded-lg">
                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredCycles.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                        <p className="text-gray-500">Циклы не найдены</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Создание цикла" size="md">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Код *</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Культура *</label>
                        <select
                            value={formData.cropId}
                            onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        >
                            <option value="">Выберите культуру</option>
                            <option value="crop-1">Томат</option>
                            <option value="crop-2">Огурец</option>
                            <option value="crop-3">Перец сладкий</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Метод</label>
                        <select
                            value={formData.method}
                            onChange={(e) => setFormData({ ...formData, method: e.target.value as CycleMethod })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        >
                            <option value="seedling">Рассадный</option>
                            <option value="direct">Прямой посев</option>
                            <option value="hydroponic">Гидропоника</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Плановый сбор</label>
                        <input
                            type="date"
                            value={formData.expectedHarvestAt}
                            onChange={(e) => setFormData({ ...formData, expectedHarvestAt: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg"
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg">
                        Отмена
                    </button>
                    <button onClick={handleCreateCycle} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">
                        Создать
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default GrowingCyclesPage;