import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    AlertCircle,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    Download,
    MapPin,
    MoreVertical,
    Play,
    Search,
    Settings,
    Sprout
} from 'lucide-react';
import {useCycles, useOptionHelpers} from "@/features/production/growing_cycle";
import {getCropIcon} from "@/utils/cropIcons.ts";
import {formatArea} from "@/utils/geometry.ts";
import {statusLib} from "@/utils/status.ts";
import {getStageIcon} from "@/utils/stageIcons.tsx";

// ==================== TYPES ====================

interface GrowingItem {
    id: string;
    cropName: string;
    varietyName: string;
    fieldName: string;
    fieldId: string;
    area: number;
    stage: string;
    stageIcon: string;
    progress: number;
    startDate: string;
    endDate: string;
    status: 'planned' | 'active' | 'warning' | 'completed';
    statusText: string;
    tasksCount?: number;
}

// ==================== MOCK DATA ====================

const mockGrowingData: GrowingItem[] = [
    {
        id: '1',
        cropName: 'Озимая пшеница',
        varietyName: 'Московская 39',
        fieldName: 'Поле №1',
        fieldId: 'field-1',
        area: 145,
        stage: 'Кущение',
        stageIcon: '🌿',
        progress: 45,
        startDate: '2025-09-15',
        endDate: '2026-07-20',
        status: 'active',
        statusText: 'По плану',
        tasksCount: 3
    },
    {
        id: '2',
        cropName: 'Кукуруза',
        varietyName: 'Пионер ПР38Д93',
        fieldName: 'Поле №2',
        fieldId: 'field-2',
        area: 98,
        stage: 'Всходы',
        stageIcon: '🌱',
        progress: 20,
        startDate: '2026-04-15',
        endDate: '2026-09-10',
        status: 'active',
        statusText: 'По плану',
        tasksCount: 5
    },
    {
        id: '3',
        cropName: 'Подсолнечник',
        varietyName: 'НК Неома',
        fieldName: 'Поле №3',
        fieldId: 'field-3',
        area: 76,
        stage: 'Бутонизация',
        stageIcon: '🌸',
        progress: 60,
        startDate: '2026-04-20',
        endDate: '2026-09-05',
        status: 'warning',
        statusText: 'Требует внимания',
        tasksCount: 2
    },
    {
        id: '4',
        cropName: 'Соя',
        varietyName: 'Вилана',
        fieldName: 'Поле №4',
        fieldId: 'field-4',
        area: 123,
        stage: 'Цветение',
        stageIcon: '🌸',
        progress: 50,
        startDate: '2026-05-01',
        endDate: '2026-09-20',
        status: 'active',
        statusText: 'По плану',
        tasksCount: 4
    },
    {
        id: '5',
        cropName: 'Ячмень',
        varietyName: 'Вакула',
        fieldName: 'Поле №5',
        fieldId: 'field-5',
        area: 67,
        stage: 'Колошение',
        stageIcon: '🌾',
        progress: 75,
        startDate: '2026-04-10',
        endDate: '2026-08-15',
        status: 'active',
        statusText: 'По плану',
        tasksCount: 2
    },
    {
        id: '6',
        cropName: 'Рапс',
        varietyName: 'Лидер',
        fieldName: 'Поле №6',
        fieldId: 'field-6',
        area: 52,
        stage: 'Созревание',
        stageIcon: '🌟',
        progress: 85,
        startDate: '2026-03-15',
        endDate: '2026-07-30',
        status: 'completed',
        statusText: 'Завершен',
        tasksCount: 0
    }
];

// ==================== COMPONENTS ====================

const StatusBadge = ({ status, text }: { status: string; text: string }) => {
    const config = {
        planned: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: <Clock className="w-3 h-3" /> },
        active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: <Play className="w-3 h-3" /> },
        warning: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: <AlertCircle className="w-3 h-3" /> },
        completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: <CheckCircle className="w-3 h-3" /> }
    };
    const style = config[status as keyof typeof config] || config.active;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
            {text}
    </span>
    );
};

const ProgressBar = ({ progress }: { progress: number }) => {
    const getColor = () => {
        if (progress >= 75) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress >= 25) return 'bg-yellow-500';
        return 'bg-gray-500';
    };

    return (
        <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${getColor()}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{progress}%</span>
        </div>
    );
};

const GrowingRow = ({ item, isExpanded, onToggle, onRowClick }: {
    item: GrowingItem;
    isExpanded: boolean;
    onToggle: () => void;
    onRowClick: () => void;
}) => {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru', { day: 'numeric', month: 'numeric', year: 'numeric' });
    };
    const {data: helpers} = useOptionHelpers()
    return (
        <>
            <tr
                onClick={onRowClick}
                className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
            >
                {/* Культура / Сорт */}
                <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggle(); }}
                            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{getCropIcon(item.cropName)}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{item.cropName}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-0.5">{item.varietyName}</div>
                        </div>
                    </div>
                </td>

                {/* Поле */}
                <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.fieldName}</span>
                    </div>
                </td>

                {/* Площадь */}
                <td className="px-4 py-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatArea(item.area)}</span>
                </td>

                {/* Стадия развития */}
                <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{getStageIcon(item.stage)}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{helpers?.stages[item.stage]}</span>
                    </div>
                </td>

                {/* Прогресс */}
                <td className="px-4 py-4">
                    <ProgressBar progress={item.progress} />
                </td>

                {/* Сроки */}
                <td className="px-4 py-4">
                    <div className="text-sm">
                        <div className="text-gray-700 dark:text-gray-300">{formatDate(item.startDate)}</div>
                        <div className="text-gray-400 text-xs">до {formatDate(item.endDate)}</div>
                    </div>
                </td>

                {/* Статус */}
                <td className="px-4 py-4">
                    <StatusBadge status={item.status} text={statusLib.getText(item.status)} />
                </td>

                {/* Действия */}
                <td className="px-4 py-4">
                    <button className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                </td>
            </tr>

            {/* Развернутая информация */}
            {isExpanded && (
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td colSpan={8} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">Запланировано задач</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{item.tasksCount || 0}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">Урожайность (план)</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {item.cropName === 'Кукуруза' ? '85' : item.cropName === 'Подсолнечник' ? '28' : '42'} ц/га
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">Текущая GDD</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {Math.floor(680 * item.progress / 100)} / 1100 °C·дн
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">Следующая задача</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.stage === 'Кущение' ? 'Подкормка азотом' :
                                        item.stage === 'Всходы' ? 'Прополка' :
                                            item.stage === 'Бутонизация' ? 'Обработка от вредителей' :
                                                item.stage === 'Цветение' ? 'Полив' : 'Мониторинг'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">до {formatDate(new Date(new Date().setDate(new Date().getDate() + 5)).toISOString())}</p>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// ==================== MAIN COMPONENT ====================

const GrowingTablePage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState<string>('all');
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

    const filteredData = [...mockGrowingData, ...cycles].filter(item => {
        const matchesSearch = item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.varietyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.fieldName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleRowClick = (item: GrowingItem) => {
        navigate(`/growing/${item.id}`);
    };

    const stats = {
        total: mockGrowingData.length,
        totalArea: mockGrowingData.reduce((sum, i) => sum + i.area, 0),
        active: mockGrowingData.filter(i => i.status === 'active').length,
        warning: mockGrowingData.filter(i => i.status === 'warning').length
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
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        <p className="text-sm text-gray-500">Всего культур</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                        <p className="text-2xl font-bold text-green-600">{stats.totalArea.toFixed(0)}</p>
                        <p className="text-sm text-gray-500">Общая площадь, га</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                        <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                        <p className="text-sm text-gray-500">Активных циклов</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                        <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
                        <p className="text-sm text-gray-500">Требуют внимания</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск по культуре, сорту или полю..."
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
                            <option value="active">По плану</option>
                            <option value="warning">Требует внимания</option>
                            <option value="completed">Завершен</option>
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
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Поле</th>
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