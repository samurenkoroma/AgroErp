import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {MoreVertical, Plus, Search} from 'lucide-react';
import {useCycles} from "@/features/production/growing_cycle/queries.ts";
import {statusLib} from "@/utils/status.ts";
import {dateLib} from "@/utils/date.ts";
import {CreateCycleModal} from "@/features/production/growing_cycle";
import {getCropIcon} from "@/utils/cropIcons.ts";


const GrowingCyclesPage = () => {
    const navigate = useNavigate();
    const {data: cycles} = useCycles();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);

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
                            onClick={() => setIsCycleModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Создать цикл
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">


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
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Культура / Сорт</th>
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
                                return (
                                    <tr
                                        key={cycle.id}
                                        onClick={() => navigate(`/growing/${cycle.id}`)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                                            {getCropIcon(cycle.cropName)}
                                            {cycle.cropName} {cycle.varietyName}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{cycle.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cycle.cropName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{cycle.varietyName || '—'}</td>
                                        <td className="px-4 py-3">
                        <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusLib.getColor(cycle.status)}`}>
                          {statusLib.getText(cycle.status)}
                        </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{dateLib.format(cycle.expectedHarvestAt)}</td>
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
            {isCycleModalOpen && (<CreateCycleModal
                isOpen={isCycleModalOpen}
                onClose={() => setIsCycleModalOpen(false)}
            />)}
        </div>
    );
};

export default GrowingCyclesPage;