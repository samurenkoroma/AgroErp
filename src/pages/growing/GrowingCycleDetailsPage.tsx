// src/pages/growing/GrowingCycleDetailsPage.tsx
import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {ArrowLeft, Edit, Plus, Trash2} from 'lucide-react';
import {Modal} from '@/components/common/Modal';
import {
    mockAllocations,
    mockCycles,
    mockHarvests,
    mockPlantings,
    mockProductionUnits
} from "@/data/growing-cycle/mock-data.ts";
import {Allocation, GrowingCycle, HarvestBatch, Planting} from "@/entities/production";

type TabType = 'general' | 'allocations' | 'plantings' | 'harvests';

const statusConfig: Record<string, { label: string; color: string }> = {
    planned: {label: 'Запланирован', color: 'bg-gray-100 text-gray-700'},
    active: {label: 'Активен', color: 'bg-green-100 text-green-700'},
    paused: {label: 'Приостановлен', color: 'bg-yellow-100 text-yellow-700'},
    harvesting: {label: 'Сбор урожая', color: 'bg-blue-100 text-blue-700'},
    completed: {label: 'Завершен', color: 'bg-green-100 text-green-700'},
    failed: {label: 'Неудача', color: 'bg-red-100 text-red-700'},
    archived: {label: 'Архив', color: 'bg-gray-100 text-gray-700'}
};

const GrowingCycleDetailsPageV2 = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [cycle, setCycle] = useState<GrowingCycle | undefined>(mockCycles.find(c => c.id === id));
    const [allocations, setAllocations] = useState<Allocation[]>(mockAllocations.filter(a => a.cycleId === id));
    const [plantings, setPlantings] = useState<Planting[]>(mockPlantings.filter(p => p.cycleId === id));
    const [harvests, setHarvests] = useState<HarvestBatch[]>(mockHarvests.filter(h => h.cycleId === id));

    // Modal states
    const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
    const [isPlantingModalOpen, setIsPlantingModalOpen] = useState(false);
    const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    if (!cycle) {
        return <div className="p-8 text-center">Цикл не найден</div>;
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru');
    };

    const tabs = [
        {id: 'general', label: 'General'},
        {id: 'allocations', label: 'Allocations', badge: allocations.length},
        {id: 'plantings', label: 'Plantings', badge: plantings.length},
        {id: 'harvests', label: 'Harvests', badge: harvests.length}
    ];

    const status = statusConfig[cycle.status];

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
                                <ArrowLeft className="w-5 h-5"/>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{cycle.name}</h1>
                                <p className="text-sm text-gray-500 font-mono">{cycle.code}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <Edit className="w-5 h-5 text-gray-500"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-6 pt-6">
                <div
                    className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }
              `}
                        >
                            {tab.label}
                            {tab.badge > 0 && (
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
                {/* General Tab */}
                {activeTab === 'general' && (
                    <div
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500">Название</p>
                                <p className="font-medium text-gray-900 dark:text-white">{cycle.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Код</p>
                                <p className="font-medium font-mono">{cycle.code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Культура</p>
                                <p className="font-medium">{cycle.cropName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Сорт</p>
                                <p className="font-medium">{cycle.varietyName || '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Протокол</p>
                                <p className="font-medium">{cycle.protocolName || '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Метод</p>
                                <p className="font-medium">
                                    {cycle.method === 'seedling' ? 'Рассадный' : cycle.method === 'direct' ? 'Прямой посев' : 'Гидропоника'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Статус</p>
                                <span
                                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Плановый сбор</p>
                                <p className="font-medium">{formatDate(cycle.expectedHarvestAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Дата создания</p>
                                <p className="font-medium">{formatDate(cycle.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Последнее обновление</p>
                                <p className="font-medium">{formatDate(cycle.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Allocations Tab */}
                {activeTab === 'allocations' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsAllocationModalOpen(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4"/>
                                Add Allocation
                            </button>
                        </div>
                        <div
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <table className="w-full">
                                <thead
                                    className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Production
                                        Unit
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Area (ha)</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Started At
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Ended At</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500"></th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {allocations.map((alloc) => (
                                    <tr key={alloc.id}>
                                        <td className="px-4 py-3 text-sm">{alloc.productionUnitName}</td>
                                        <td className="px-4 py-3 text-sm">{alloc.area}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(alloc.startedAt)}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(alloc.endedAt)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button className="p-1 hover:bg-gray-100 rounded">
                                                    <Edit className="w-4 h-4 text-gray-500"/>
                                                </button>
                                                <button className="p-1 hover:bg-gray-100 rounded">
                                                    <Trash2 className="w-4 h-4 text-red-500"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Plantings Tab */}
                {activeTab === 'plantings' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsPlantingModalOpen(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4"/>
                                Register Planting
                            </button>
                        </div>
                        <div
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <table className="w-full">
                                <thead
                                    className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Planted At
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Quantity</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Created At
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500"></th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {plantings.map((plant) => (
                                    <tr key={plant.id}>
                                        <td className="px-4 py-3 text-sm">{formatDate(plant.plantedAt)}</td>
                                        <td className="px-4 py-3 text-sm">{plant.quantity.toLocaleString()} шт</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(plant.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button className="p-1 hover:bg-gray-100 rounded">
                                                    <Edit className="w-4 h-4 text-gray-500"/>
                                                </button>
                                                <button className="p-1 hover:bg-gray-100 rounded">
                                                    <Trash2 className="w-4 h-4 text-red-500"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Harvests Tab */}
                {activeTab === 'harvests' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsHarvestModalOpen(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4"/>
                                Register Harvest
                            </button>
                        </div>
                        <div
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <table className="w-full">
                                <thead
                                    className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Harvested At
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Quantity</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Created At
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500"></th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {harvests.map((harvest) => (
                                    <tr key={harvest.id}>
                                        <td className="px-4 py-3 text-sm">{formatDate(harvest.harvestedAt)}</td>
                                        <td className="px-4 py-3 text-sm">{harvest.quantity.toLocaleString()} кг</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(harvest.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button className="p-1 hover:bg-gray-100 rounded">
                                                    <Edit className="w-4 h-4 text-gray-500"/>
                                                </button>
                                                <button className="p-1 hover:bg-gray-100 rounded">
                                                    <Trash2 className="w-4 h-4 text-red-500"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Allocation Modal */}
            <Modal isOpen={isAllocationModalOpen} onClose={() => setIsAllocationModalOpen(false)} title="Add Allocation"
                   size="md">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Production Unit</label>
                        <select className="w-full px-3 py-2 bg-gray-50 border rounded-lg">
                            <option value="">Select unit</option>
                            {mockProductionUnits.map(unit => (
                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Area (ha)</label>
                        <input type="number" step="0.01" className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Started At</label>
                        <input type="date" className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
                    </div>
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t">
                    <button onClick={() => setIsAllocationModalOpen(false)}
                            className="flex-1 px-4 py-2 border rounded-lg">Cancel
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Create</button>
                </div>
            </Modal>

            {/* Planting Modal */}
            <Modal isOpen={isPlantingModalOpen} onClose={() => setIsPlantingModalOpen(false)} title="Register Planting"
                   size="md">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Planted At</label>
                        <input type="date" className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <input type="number" className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
                    </div>
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t">
                    <button onClick={() => setIsPlantingModalOpen(false)}
                            className="flex-1 px-4 py-2 border rounded-lg">Cancel
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Register</button>
                </div>
            </Modal>

            {/* Harvest Modal */}
            <Modal isOpen={isHarvestModalOpen} onClose={() => setIsHarvestModalOpen(false)} title="Register Harvest"
                   size="md">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Harvested At</label>
                        <input type="date" className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <input type="number" step="0.1" className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
                    </div>
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t">
                    <button onClick={() => setIsHarvestModalOpen(false)}
                            className="flex-1 px-4 py-2 border rounded-lg">Cancel
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Register</button>
                </div>
            </Modal>
        </div>
    );
};

export default GrowingCycleDetailsPageV2;