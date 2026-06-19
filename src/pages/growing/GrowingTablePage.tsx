import {useState} from 'react';
import {Download, MapPin, Settings, Sprout} from 'lucide-react';
import {GrowingRow} from "@/features/production/growing_cycle/components/GrowingRow.tsx";
import {CreateCycleModal, useCycles} from "@/features/production/growing_cycle";
import {usePageActions} from "@/hooks/usePageActions.ts";

// ==================== MOCK DATA ====================




// ==================== MAIN COMPONENT ====================

const GrowingTablePage = () => {
    const [isCreateModal, setIsCreateModal] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const {data: cycles = []} = useCycles();

    usePageActions({
        actions: [
            {
                id: 'add-cycle',
                label: 'Добавить посев ',
                icon: <MapPin className="w-5 h-5"/>,
                onClick: () => setIsCreateModal(true),
                color: 'bg-green-500'
            },

        ],
    });
    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            if (prev.has(id)) {
                return new Set();
            }
            return new Set([id]);
        });
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


                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Культура / Сорт</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Площадь</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Количество</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Сроки</th>
                                <th className="w-10"></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {cycles.map((item) => (
                                <GrowingRow
                                    key={item.cropName}
                                    item={item}
                                    isExpanded={expandedRows.has(item.cropName)}
                                    onToggle={() => toggleRow(item.cropName)}
                                />
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {cycles.length === 0 && (
                        <div className="text-center py-12">
                            <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">Нет данных по посевам</p>
                            <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры поиска</p>
                        </div>
                    )}
                </div>
            </div>
            {
                isCreateModal && <CreateCycleModal isOpen={isCreateModal} onClose={() => setIsCreateModal(false)}/>
            }
        </div>
    );
};

export default GrowingTablePage;