import {useMemo, useState} from 'react';
import {
    Activity,
    AlertCircle,
    Beaker,
    Calendar,
    CheckCircle,
    Circle,
    Clock,
    Droplets,
    FlaskConical,
    LayoutGrid,
    MapPin,
    Play,
    Plus,
    Scissors,
    Search,
    SprayCan,
    Sprout,
    Sun,
    Tractor,
    Trash2,
    User,
    X
} from 'lucide-react';
import {Modal} from '@/components/common/Modal';
import {dateLib} from "@/utils";

// ==================== TYPES ====================

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type OperationType =
    | 'PLOWED' | 'SOWED' | 'TRANSPLANTED' | 'IRRIGATED'
    | 'FERTILIZED' | 'SPRAYED' | 'HARVESTED' | 'PLANT_DISCARDED'
    | 'PH_ADJUSTED' | 'EC_ADJUSTED' | 'RESERVOIR_REFILLED'
    | 'LIGHT_CHANGED' | 'SENSOR_ALERT' | 'LAYOUT_CHANGED';
type TimelineSource = 'TASK' | 'OPERATION' | 'HARVEST' | 'YIELD' | 'TELEMETRY' | 'ALERT' | 'AUTOMATION';

interface Task {
    id: string;
    title: string;
    description?: string;
    operationType?: OperationType;
    farmId: string;
    productionUnitId?: string;
    productionUnitName?: string;
    growingCycleId?: string;
    growingCycleName?: string;
    assignment?: { userId: string; userName?: string };
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

interface OperationEvent {
    id: string;
    type: OperationType;
    farmId: string;
    productionUnitId?: string;
    productionUnitName?: string;
    growingCycleId?: string;
    growingCycleName?: string;
    timestamp: string;
    payload: Record<string, any>;
    performedBy?: string;
    performedByName?: string;
}

interface TimelineItem {
    id: string;
    source: TimelineSource;
    title: string;
    description?: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

// ==================== MOCK DATA ====================

const mockTasks: Task[] = [
    {
        id: 'task-1',
        title: 'Проверить полив секции A',
        description: 'Убедиться что капельницы работают корректно',
        operationType: 'IRRIGATED',
        farmId: 'farm-1',
        productionUnitId: 'greenhouse-1',
        productionUnitName: 'Теплица №1',
        growingCycleId: 'cycle-1',
        growingCycleName: 'Томаты весенние 2025',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: '2026-06-20T10:00:00Z',
        createdAt: '2026-06-15T08:00:00Z',
        updatedAt: '2026-06-15T08:00:00Z'
    },
    {
        id: 'task-2',
        title: 'Внести удобрение NPK',
        description: 'Внесение комплексного удобрения под корень',
        operationType: 'FERTILIZED',
        farmId: 'farm-1',
        productionUnitId: 'greenhouse-1',
        productionUnitName: 'Теплица №1',
        growingCycleId: 'cycle-1',
        growingCycleName: 'Томаты весенние 2025',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: '2026-06-22T10:00:00Z',
        createdAt: '2026-06-16T09:00:00Z',
        updatedAt: '2026-06-16T09:00:00Z'
    },
    {
        id: 'task-3',
        title: 'Обработка от вредителей',
        description: 'Опрыскивание от паутинного клеща',
        operationType: 'SPRAYED',
        farmId: 'farm-1',
        productionUnitId: 'greenhouse-1',
        productionUnitName: 'Теплица №1',
        growingCycleId: 'cycle-1',
        growingCycleName: 'Томаты весенние 2025',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: '2026-06-18T10:00:00Z',
        completedAt: '2026-06-17T15:30:00Z',
        createdAt: '2026-06-14T10:00:00Z',
        updatedAt: '2026-06-17T15:30:00Z'
    }
];

const mockOperations: OperationEvent[] = [
    {
        id: 'op-1',
        type: 'IRRIGATED',
        farmId: 'farm-1',
        productionUnitId: 'greenhouse-1',
        productionUnitName: 'Теплица №1',
        growingCycleId: 'cycle-1',
        growingCycleName: 'Томаты весенние 2025',
        timestamp: '2026-06-17T08:00:00Z',
        payload: {volumeLiters: 120, durationMinutes: 45, method: 'drip'},
        performedByName: 'Иван Иванов'
    },
    {
        id: 'op-2',
        type: 'FERTILIZED',
        farmId: 'farm-1',
        productionUnitId: 'greenhouse-1',
        productionUnitName: 'Теплица №1',
        growingCycleId: 'cycle-1',
        growingCycleName: 'Томаты весенние 2025',
        timestamp: '2026-06-16T10:00:00Z',
        payload: {productName: 'NPK 20-20-20', amountGrams: 500, targetEC: 2.8},
        performedByName: 'Иван Иванов'
    },
    {
        id: 'op-3',
        type: 'PH_ADJUSTED',
        farmId: 'farm-1',
        productionUnitId: 'greenhouse-1',
        productionUnitName: 'Теплица №1',
        growingCycleId: 'cycle-1',
        growingCycleName: 'Томаты весенние 2025',
        timestamp: '2026-06-15T14:00:00Z',
        payload: {before: 7.2, after: 6.1, agent: 'pH Down'},
        performedByName: 'Иван Иванов'
    }
];

const mockTimeline: TimelineItem[] = [
    {id: '1', source: 'TASK', title: 'Создана задача: Обработка от вредителей', timestamp: '2026-06-14T10:00:00Z'},
    {
        id: '2',
        source: 'OPERATION',
        title: 'Зафиксирована операция: Регулировка pH',
        timestamp: '2026-06-15T14:00:00Z',
        metadata: {before: 7.2, after: 6.1}
    },
    {
        id: '3',
        source: 'OPERATION',
        title: 'Зафиксирована операция: Внесение удобрений',
        timestamp: '2026-06-16T10:00:00Z'
    },
    {
        id: '4',
        source: 'OPERATION',
        title: 'Зафиксирована операция: Полив',
        timestamp: '2026-06-17T08:00:00Z',
        metadata: {volumeLiters: 120}
    },
    {id: '5', source: 'TASK', title: 'Завершена задача: Обработка от вредителей', timestamp: '2026-06-17T15:30:00Z'}
];

// ==================== COMPONENTS ====================

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: JSX.Element }> = {
    TODO: {label: 'К выполнению', color: 'bg-gray-100 text-gray-700', icon: <Circle className="w-3 h-3"/>},
    IN_PROGRESS: {label: 'В работе', color: 'bg-blue-100 text-blue-700', icon: <Play className="w-3 h-3"/>},
    DONE: {label: 'Выполнена', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3"/>},
    CANCELLED: {label: 'Отменена', color: 'bg-red-100 text-red-700', icon: <X className="w-3 h-3"/>}
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
    LOW: {label: 'Низкий', color: 'bg-gray-100 text-gray-700'},
    MEDIUM: {label: 'Средний', color: 'bg-yellow-100 text-yellow-700'},
    HIGH: {label: 'Высокий', color: 'bg-orange-100 text-orange-700'},
    CRITICAL: {label: 'Критический', color: 'bg-red-100 text-red-700'}
};

const operationTypeConfig: Record<OperationType, { label: string; icon: JSX.Element; color: string }> = {
    PLOWED: {label: 'Вспашка', icon: <Tractor className="w-4 h-4"/>, color: 'text-amber-600'},
    SOWED: {label: 'Посев', icon: <Sprout className="w-4 h-4"/>, color: 'text-green-600'},
    TRANSPLANTED: {label: 'Пересадка', icon: <Sprout className="w-4 h-4"/>, color: 'text-green-600'},
    IRRIGATED: {label: 'Полив', icon: <Droplets className="w-4 h-4"/>, color: 'text-blue-600'},
    FERTILIZED: {label: 'Удобрение', icon: <FlaskConical className="w-4 h-4"/>, color: 'text-purple-600'},
    SPRAYED: {label: 'Опрыскивание', icon: <SprayCan className="w-4 h-4"/>, color: 'text-orange-600'},
    HARVESTED: {label: 'Сбор урожая', icon: <Scissors className="w-4 h-4"/>, color: 'text-green-600'},
    PLANT_DISCARDED: {label: 'Утилизация', icon: <Trash2 className="w-4 h-4"/>, color: 'text-red-600'},
    PH_ADJUSTED: {label: 'Регулировка pH', icon: <Beaker className="w-4 h-4"/>, color: 'text-blue-600'},
    EC_ADJUSTED: {label: 'Регулировка EC', icon: <Activity className="w-4 h-4"/>, color: 'text-purple-600'},
    RESERVOIR_REFILLED: {label: 'Заправка резервуара', icon: <Droplets className="w-4 h-4"/>, color: 'text-blue-600'},
    LIGHT_CHANGED: {label: 'Изменение освещения', icon: <Sun className="w-4 h-4"/>, color: 'text-amber-600'},
    SENSOR_ALERT: {label: 'Аларм датчика', icon: <AlertCircle className="w-4 h-4"/>, color: 'text-red-600'},
    LAYOUT_CHANGED: {label: 'Изменение планировки', icon: <LayoutGrid className="w-4 h-4"/>, color: 'text-gray-600'}
};

const TaskCard = ({task, onClick}: { task: Task; onClick: () => void }) => {
    const status = statusConfig[task.status];
    const priority = priorityConfig[task.priority];

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-all cursor-pointer"
        >
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                <div className="flex items-center gap-1">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority.color}`}>
            {priority.label}
          </span>
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
            {status.icon}
                        {status.label}
          </span>
                </div>
            </div>
            {task.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-400">
                {task.dueDate && (
                    <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3"/>
            до {dateLib.format(task.dueDate)}
          </span>
                )}
                {task.productionUnitName && (
                    <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3"/>
                        {task.productionUnitName}
          </span>
                )}
            </div>
        </div>
    );
};

const OperationCard = ({operation}: { operation: OperationEvent }) => {
    const config = operationTypeConfig[operation.type];

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${config.color}`}>
                        {config.icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{config.label}</h3>
                            <span className="text-xs text-gray-400">{dateLib.format(operation.timestamp)}</span>
                        </div>
                        {operation.productionUnitName && (
                            <p className="text-sm text-gray-500 mt-1">{operation.productionUnitName}</p>
                        )}
                        {operation.growingCycleName && (
                            <p className="text-xs text-gray-400">{operation.growingCycleName}</p>
                        )}
                    </div>
                </div>
                {operation.performedByName && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
            <User className="w-3 h-3"/>
                        {operation.performedByName}
          </span>
                )}
            </div>
            {Object.keys(operation.payload).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2 text-xs">
                        {Object.entries(operation.payload).map(([key, value]) => (
                            <span key={key} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const TimelineItem = ({item}: { item: TimelineItem }) => {
    const getSourceIcon = (source: TimelineSource) => {
        switch (source) {
            case 'TASK':
                return <CheckCircle className="w-4 h-4 text-green-500"/>;
            case 'OPERATION':
                return <Activity className="w-4 h-4 text-blue-500"/>;
            case 'HARVEST':
                return <Scissors className="w-4 h-4 text-amber-500"/>;
            case 'ALERT':
                return <AlertCircle className="w-4 h-4 text-red-500"/>;
            default:
                return <Clock className="w-4 h-4 text-gray-400"/>;
        }
    };

    return (
        <div className="relative flex gap-4 pb-6">
            <div className="relative z-10">
                <div
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    {getSourceIcon(item.source)}
                </div>
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-gray-400 mt-1">{dateLib.format(item.timestamp)}</p>
                {item.metadata && (
                    <div className="mt-2 text-xs text-gray-500">
                        {Object.entries(item.metadata).map(([k, v]) => (
                            <span key={k} className="mr-2">{k}: {v}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

type TabType = 'tasks' | 'operations' | 'timeline';

const OperationsPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('tasks');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [isCreateOperationModalOpen, setIsCreateOperationModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const filteredTasks = useMemo(() => {
        let filtered = mockTasks;
        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(t => t.status === statusFilter);
        }
        return filtered;
    }, [searchTerm, statusFilter]);

    const stats = {
        total: mockTasks.length,
        todo: mockTasks.filter(t => t.status === 'TODO').length,
        inProgress: mockTasks.filter(t => t.status === 'IN_PROGRESS').length,
        done: mockTasks.filter(t => t.status === 'DONE').length,
        overdue: mockTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length
    };

    const tabs = [
        {id: 'tasks', label: 'Задачи', icon: <CheckCircle className="w-4 h-4"/>, count: stats.total},
        {id: 'operations', label: 'Операции', icon: <Activity className="w-4 h-4"/>, count: mockOperations.length},
        {id: 'timeline', label: 'Таймлайн', icon: <Clock className="w-4 h-4"/>, count: mockTimeline.length}
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Операции</h1>
                            <p className="text-sm text-gray-500 mt-1">Управление задачами, операциями и таймлайном</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {activeTab === 'tasks' && (
                                <button
                                    onClick={() => setIsCreateTaskModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4"/>
                                    Новая задача
                                </button>
                            )}
                            {activeTab === 'operations' && (
                                <button
                                    onClick={() => setIsCreateOperationModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4"/>
                                    Записать операцию
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Stats Cards */}
                {activeTab === 'tasks' && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div
                            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                            <p className="text-xs text-gray-500">Всего задач</p>
                        </div>
                        <div
                            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                            <p className="text-2xl font-bold text-gray-500">{stats.todo}</p>
                            <p className="text-xs text-gray-500">К выполнению</p>
                        </div>
                        <div
                            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                            <p className="text-xs text-gray-500">В работе</p>
                        </div>
                        <div
                            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                            <p className="text-2xl font-bold text-green-600">{stats.done}</p>
                            <p className="text-xs text-gray-500">Выполнено</p>
                        </div>
                        <div
                            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
                            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                            <p className="text-xs text-gray-500">Просрочено</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div
                    className="flex gap-1 mb-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1">
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
                            {tab.icon}
                            {tab.label}
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
                {tab.count}
              </span>
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                            <input
                                type="text"
                                placeholder="Поиск..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                        {activeTab === 'tasks' && (
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                                <option value="all">Все статусы</option>
                                <option value="TODO">К выполнению</option>
                                <option value="IN_PROGRESS">В работе</option>
                                <option value="DONE">Выполненные</option>
                            </select>
                        )}
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'tasks' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTasks.map((task) => (
                            <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)}/>
                        ))}
                    </div>
                )}

                {activeTab === 'operations' && (
                    <div className="space-y-3">
                        {mockOperations.map((operation) => (
                            <OperationCard key={operation.id} operation={operation}/>
                        ))}
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                        <div className="space-y-0">
                            {mockTimeline.map((item, idx) => (
                                <div key={item.id}>
                                    <TimelineItem item={item}/>
                                    {idx < mockTimeline.length - 1 && (
                                        <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700"/>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {filteredTasks.length === 0 && activeTab === 'tasks' && (
                    <div
                        className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                        <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
                        <p className="text-gray-500">Нет задач</p>
                    </div>
                )}
            </div>

            {/* Task Detail Modal */}
            {selectedTask && (
                <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title={selectedTask.title}
                       size="lg">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
              <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[selectedTask.priority].color}`}>
                {priorityConfig[selectedTask.priority].label}
              </span>
                            <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedTask.status].color}`}>
                {statusConfig[selectedTask.status].icon}
                                {statusConfig[selectedTask.status].label}
              </span>
                        </div>
                        {selectedTask.description && (
                            <div>
                                <p className="text-sm text-gray-500">Описание</p>
                                <p className="text-gray-700 dark:text-gray-300">{selectedTask.description}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            {selectedTask.productionUnitName && (
                                <div>
                                    <p className="text-sm text-gray-500">Объект</p>
                                    <p className="font-medium">{selectedTask.productionUnitName}</p>
                                </div>
                            )}
                            {selectedTask.growingCycleName && (
                                <div>
                                    <p className="text-sm text-gray-500">Цикл</p>
                                    <p className="font-medium">{selectedTask.growingCycleName}</p>
                                </div>
                            )}
                            {selectedTask.dueDate && (
                                <div>
                                    <p className="text-sm text-gray-500">Срок выполнения</p>
                                    <p className="font-medium">{dateLib.format(selectedTask.dueDate)}</p>
                                </div>
                            )}
                            {selectedTask.completedAt && (
                                <div>
                                    <p className="text-sm text-gray-500">Выполнена</p>
                                    <p className="font-medium">{dateLib.format(selectedTask.completedAt)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={() => setSelectedTask(null)} className="flex-1 px-4 py-2 border rounded-lg">
                            Закрыть
                        </button>
                        {selectedTask.status !== 'DONE' && selectedTask.status !== 'CANCELLED' && (
                            <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">
                                {selectedTask.status === 'TODO' ? 'Начать выполнение' : 'Завершить'}
                            </button>
                        )}
                    </div>
                </Modal>
            )}

            {/* Create Task Modal */}
            <Modal isOpen={isCreateTaskModalOpen} onClose={() => setIsCreateTaskModalOpen(false)} title="Новая задача"
                   size="md">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Название *</label>
                        <input type="text" className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Описание</label>
                        <textarea rows={3} className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Приоритет</label>
                            <select className="w-full px-3 py-2 bg-gray-50 border rounded-lg">
                                <option value="LOW">Низкий</option>
                                <option value="MEDIUM">Средний</option>
                                <option value="HIGH">Высокий</option>
                                <option value="CRITICAL">Критический</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Срок выполнения</label>
                            <input type="date" className="w-full px-3 py-2 bg-gray-50 border rounded-lg"/>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t">
                    <button onClick={() => setIsCreateTaskModalOpen(false)}
                            className="flex-1 px-4 py-2 border rounded-lg">Отмена
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Создать</button>
                </div>
            </Modal>

            {/* Create Operation Modal */}
            <Modal isOpen={isCreateOperationModalOpen} onClose={() => setIsCreateOperationModalOpen(false)}
                   title="Записать операцию" size="md">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Тип операции *</label>
                        <select className="w-full px-3 py-2 bg-gray-50 border rounded-lg">
                            <option value="IRRIGATED">Полив</option>
                            <option value="FERTILIZED">Удобрение</option>
                            <option value="SPRAYED">Опрыскивание</option>
                            <option value="PH_ADJUSTED">Регулировка pH</option>
                            <option value="EC_ADJUSTED">Регулировка EC</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Объект</label>
                        <select className="w-full px-3 py-2 bg-gray-50 border rounded-lg">
                            <option value="">Выберите объект</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Данные операции</label>
                        <textarea rows={3} placeholder='{"volumeLiters": 120, "durationMinutes": 45}'
                                  className="w-full px-3 py-2 bg-gray-50 border rounded-lg font-mono text-sm"/>
                    </div>
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t">
                    <button onClick={() => setIsCreateOperationModalOpen(false)}
                            className="flex-1 px-4 py-2 border rounded-lg">Отмена
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Записать</button>
                </div>
            </Modal>
        </div>
    );
};

export default OperationsPage;