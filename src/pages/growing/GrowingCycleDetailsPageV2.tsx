// src/pages/growing/GrowingCycleDetailsPageV2.tsx
import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Activity,
    Apple,
    ArrowLeft,
    Calendar,
    CheckCircle,
    ChevronRight,
    Download,
    Edit,
    Flower2,
    Leaf,
    Maximize2,
    Minimize2,
    Package,
    Plus,
    Share2,
    Sprout,
    Sun,
    TrendingUp,
    Users
} from 'lucide-react';
import {GDDProgress} from "@/features/production/ui/GDDProgress.tsx";

// ==================== TYPES ====================

type CycleStage =
    | 'planning' | 'germination' | 'seedling' | 'vegetative'
    | 'flowering' | 'fruiting' | 'harvesting' | 'completed';

type CycleStatus =
    | 'planned' | 'active' | 'paused' | 'harvesting' | 'completed' | 'failed' | 'archived';

interface Task {
    id: string;
    name: string;
    description: string;
    type: 'watering' | 'fertilizing' | 'spraying' | 'pruning' | 'harvesting' | 'other';
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    dueDate: string;
    completedAt?: string;
    assignedTo: string;
    assignedName: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface SensorReading {
    id: string;
    type: 'temperature' | 'humidity' | 'soil_moisture' | 'light' | 'co2';
    value: number;
    unit: string;
    timestamp: string;
    location: string;
    status: 'normal' | 'warning' | 'critical';
}

interface ResourceUsage {
    waterUsed: number;
    waterUnit: string;
    fertilizerUsed: number;
    fertilizerUnit: string;
    energyUsed: number;
    energyUnit: string;
    laborHours: number;
}

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
    cropName: string;
    varietyName?: string;
    area: number;
    areaUnit: string;
    progress: number;
    yield: number;
    expectedYield: number;
    tasks: Task[];
    sensors: SensorReading[];
    resources: ResourceUsage;
    weather?: {
        temperature: number;
        humidity: number;
        precipitation: number;
        forecast: Array<{ date: string; tempMin: number; tempMax: number; condition: string }>;
    };
    notes?: string;
}

// ==================== MOCK DATA ====================
const mockGDDData = {
    currentGDD: 680,
    requiredGDD: 1100,
    currentStage: 'Вегетация',
    nextStage: 'Цветение',
    dailyAccumulation: 12.5,
    forecastGDD: 85
};
const mockGrowingCycle: GrowingCycle = {
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
    progress: 35,
    yield: 0,
    expectedYield: 8500,
    resources: {
        waterUsed: 1250,
        waterUnit: 'm³',
        fertilizerUsed: 450,
        fertilizerUnit: 'кг',
        energyUsed: 3200,
        energyUnit: 'кВт·ч',
        laborHours: 120
    },
    weather: {
        temperature: 23.5,
        humidity: 65,
        precipitation: 0,
        forecast: [
            { date: '2025-05-29', tempMin: 15, tempMax: 24, condition: 'sunny' },
            { date: '2025-05-30', tempMin: 14, tempMax: 22, condition: 'cloudy' },
            { date: '2025-05-31', tempMin: 12, tempMax: 20, condition: 'rainy' },
            { date: '2025-06-01', tempMin: 13, tempMax: 21, condition: 'cloudy' },
            { date: '2025-06-02', tempMin: 16, tempMax: 25, condition: 'sunny' }
        ]
    },
    notes: 'Рассада высажена 20 апреля. Отличная приживаемость.',
    tasks: [
        {
            id: 'task-1',
            name: 'Полив',
            description: 'Регулярный полив под корень',
            type: 'watering',
            status: 'pending',
            dueDate: '2025-05-28T08:00:00Z',
            assignedTo: 'user-1',
            assignedName: 'Иван Иванов',
            priority: 'high'
        },
        {
            id: 'task-2',
            name: 'Подкормка азотом',
            description: 'Внесение азотных удобрений',
            type: 'fertilizing',
            status: 'pending',
            dueDate: '2025-05-30T10:00:00Z',
            assignedTo: 'user-1',
            assignedName: 'Иван Иванов',
            priority: 'medium'
        },
        {
            id: 'task-3',
            name: 'Пасынкование',
            description: 'Удаление боковых побегов',
            type: 'pruning',
            status: 'completed',
            dueDate: '2025-05-25T09:00:00Z',
            completedAt: '2025-05-25T15:30:00Z',
            assignedTo: 'user-2',
            assignedName: 'Петр Петров',
            priority: 'medium'
        }
    ],
    sensors: [
        {
            id: 'sensor-1',
            type: 'temperature',
            value: 23.5,
            unit: '°C',
            timestamp: '2025-05-28T08:00:00Z',
            location: 'Теплица №1',
            status: 'normal'
        },
        {
            id: 'sensor-2',
            type: 'humidity',
            value: 65,
            unit: '%',
            timestamp: '2025-05-28T08:00:00Z',
            location: 'Теплица №1',
            status: 'normal'
        },
        {
            id: 'sensor-3',
            type: 'soil_moisture',
            value: 28,
            unit: '%',
            timestamp: '2025-05-28T08:00:00Z',
            location: 'Поле Северное',
            status: 'warning'
        }
    ]
};

// ==================== STAGE CONFIGURATION ====================

const stageConfig: Record<CycleStage, { label: string; icon: JSX.Element; color: string; progress: number }> = {
    planning: { label: 'Планирование', icon: <Calendar className="w-4 h-4" />, color: 'bg-gray-500', progress: 0 },
    germination: { label: 'Прорастание', icon: <Sprout className="w-4 h-4" />, color: 'bg-blue-500', progress: 12.5 },
    seedling: { label: 'Рассада', icon: <Leaf className="w-4 h-4" />, color: 'bg-green-500', progress: 25 },
    vegetative: { label: 'Вегетация', icon: <Flower2 className="w-4 h-4" />, color: 'bg-emerald-500', progress: 37.5 },
    flowering: { label: 'Цветение', icon: <Flower2 className="w-4 h-4" />, color: 'bg-purple-500', progress: 50 },
    fruiting: { label: 'Плодоношение', icon: <Apple className="w-4 h-4" />, color: 'bg-orange-500', progress: 62.5 },
    harvesting: { label: 'Сбор урожая', icon: <Package className="w-4 h-4" />, color: 'bg-amber-500', progress: 75 },
    completed: { label: 'Завершен', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-500', progress: 100 }
};

// ==================== COMPONENTS ====================

// Круговая диаграмма прогресса
const CircularProgress = ({ value, size = 120, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#22c55e"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-500"
            />
        </svg>
    );
};

// Карточка показателя
const MetricCard = ({ title, value, unit, icon: Icon, color, change }: any) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{title}</span>
            <div className={`p-1.5 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
                <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
            </div>
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
            <span className="text-sm text-gray-500">{unit}</span>
        </div>
        {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </div>
        )}
    </div>
);

// Стадия прогресса (горизонтальная шкала)
const StageTimeline = ({ currentStage }: { currentStage: CycleStage }) => {
    const stages = Object.entries(stageConfig);
    const currentIndex = stages.findIndex(([key]) => key === currentStage);

    return (
        <div className="relative">
            <div className="flex justify-between mb-2">
                {stages.map(([key, config], idx) => (
                    <div key={key} className="flex flex-col items-center flex-1">
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-white text-sm
              ${idx <= currentIndex ? config.color : 'bg-gray-300 dark:bg-gray-700'}
            `}>
                            {idx <= currentIndex ? <CheckCircle className="w-4 h-4" /> : config.icon}
                        </div>
                        <span className="text-xs text-gray-500 mt-1 hidden md:block">{config.label}</span>
                    </div>
                ))}
            </div>
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
                <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
                />
            </div>
        </div>
    );
};

// Timeline задач
const TaskTimeline = ({ tasks }: { tasks: Task[] }) => {
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return (
        <div className="space-y-4">
            {sortedTasks.map((task, idx) => {
                const isCompleted = task.status === 'completed';
                const isOverdue = task.status === 'overdue';

                return (
                    <div key={task.id} className="relative flex gap-4">
                        <div className="relative z-10">
                            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${isCompleted ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-700'}
              `}>
                                {isCompleted ? <CheckCircle className="w-4 h-4 text-white" /> : <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            {idx < sortedTasks.length - 1 && (
                                <div className="absolute top-8 left-4 w-0.5 h-full bg-gray-200 dark:bg-gray-700 -z-10" />
                            )}
                        </div>
                        <div className="flex-1 pb-6">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">{task.name}</h4>
                                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                  }`}>
                    {task.priority === 'urgent' ? 'Срочно' :
                        task.priority === 'high' ? 'Высокий' :
                            task.priority === 'medium' ? 'Средний' : 'Низкий'}
                  </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                task.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                    }`}>
                    {task.status === 'completed' ? 'Выполнена' :
                        task.status === 'in_progress' ? 'В работе' :
                            task.status === 'overdue' ? 'Просрочена' : 'Ожидает'}
                  </span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString('ru')}
                </span>
                                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                                    {task.assignedName}
                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Виджет погоды
const WeatherWidget = ({ weather }: { weather: GrowingCycle['weather'] }) => {
    if (!weather) return null;

    const getWeatherIcon = (condition: string) => {
        switch (condition) {
            case 'sunny': return '☀️';
            case 'cloudy': return '☁️';
            case 'rainy': return '🌧️';
            default: return '☀️';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                Прогноз погоды
            </h3>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-3xl">{getWeatherIcon('sunny')}</span>
                    <div>
                        <p className="text-2xl font-bold">{weather.temperature}°C</p>
                        <p className="text-xs text-gray-500">Ощущается как {weather.temperature}°</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm">Влажность {weather.humidity}%</p>
                    <p className="text-sm">Осадки {weather.precipitation} мм</p>
                </div>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                {weather.forecast?.map((day, idx) => (
                    <div key={idx} className="text-center">
                        <p className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString('ru', { weekday: 'short' })}</p>
                        <p className="text-lg mt-1">{getWeatherIcon(day.condition)}</p>
                        <p className="text-xs font-medium">{day.tempMin}°/{day.tempMax}°</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Главный компонент
const GrowingCycleDetailsPageV2 = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [cycle, setCycle] = useState<GrowingCycle>(mockGrowingCycle);
    const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');
    const [expandedSections, setExpandedSections] = useState({
        overview: false,
        tasks: false,
        resources: true,
        weather: true
    });

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getCropIcon = () => {
        const icons: Record<string, string> = {
            'Томат': '🍅',
            'Огурец': '🥒',
            'Перец сладкий': '🫑',
            'Баклажан': '🍆',
            'Салат': '🥬',
            'Базилик': '🌿',
            'Клубника': '🍓'
        };
        return icons[cycle.cropName] || '🌱';
    };

    const stats = {
        tasksTotal: cycle.tasks.length,
        tasksCompleted: cycle.tasks.filter(t => t.status === 'completed').length,
        sensorsOnline: cycle.sensors.filter(s => s.status !== 'critical').length,
        sensorsTotal: cycle.sensors.length,
        yieldEfficiency: (cycle.yield / cycle.expectedYield) * 100
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

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
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{getCropIcon()}</span>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{cycle.name}</h1>
                                    <p className="text-sm text-gray-500">{cycle.code} • {cycle.cropName} {cycle.varietyName && `• ${cycle.varietyName}`}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode(viewMode === 'detailed' ? 'compact' : 'detailed')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title={viewMode === 'detailed' ? 'Компактный режим' : 'Детальный режим'}
                            >
                                {viewMode === 'detailed' ? <Minimize2 className="w-5 h-5 text-gray-500" /> : <Maximize2 className="w-5 h-5 text-gray-500" />}
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Share2 className="w-5 h-5 text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Download className="w-5 h-5 text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Edit className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Hero Section - Progress Ring */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <CircularProgress value={cycle.progress} size={100} strokeWidth={8} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{cycle.progress}%</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full ${cycle.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    <span className="text-sm font-medium">{cycle.status === 'active' ? 'Активен' : 'Завершен'}</span>
                                </div>
                                <p className="text-sm text-gray-500">Начало: {formatDate(cycle.startedAt)}</p>
                                <p className="text-sm text-gray-500">Плановый сбор: {formatDate(cycle.expectedHarvestAt)}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-500">Прогноз урожая</p>
                            <p className="text-3xl font-bold text-green-600">{cycle.expectedYield} кг</p>
                            <p className="text-xs text-gray-400">с {cycle.area} {cycle.areaUnit === 'ha' ? 'га' : 'м²'}</p>
                        </div>
                    </div>
                </div>

                {/* Stage Timeline */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
                    <StageTimeline currentStage={cycle.stage} />
                </div>

                {/*/!* Stats Grid *!/*/}
                {/*<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">*/}
                {/*    <MetricCard title="Урожайность" value={cycle.yield} unit="кг" icon={Package} color="green" />*/}
                {/*    <MetricCard title="Активных задач" value={stats.tasksTotal - stats.tasksCompleted} unit="" icon={CheckCircle} color="blue" />*/}
                {/*    <MetricCard title="Датчиков онлайн" value={`${stats.sensorsOnline}/${stats.sensorsTotal}`} unit="" icon={Activity} color="purple" />*/}
                {/*    <MetricCard title="Эффективность" value={stats.yieldEfficiency.toFixed(0)} unit="%" icon={TrendingUp} color="amber" />*/}
                {/*</div>*/}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Аккордеон: Обзор */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <button
                                onClick={() => toggleSection('overview')}
                                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Leaf className="w-5 h-5 text-green-600" />
                                    <h2 className="font-semibold text-gray-900 dark:text-white">Обзор цикла</h2>
                                </div>
                                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.overview ? 'rotate-90' : ''}`} />
                            </button>
                            {expandedSections.overview && (
                                <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-800 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Культура</p>
                                            <p className="font-medium">{cycle.cropName}</p>
                                        </div>
                                        {cycle.varietyName && (
                                            <div>
                                                <p className="text-sm text-gray-500">Сорт</p>
                                                <p className="font-medium">{cycle.varietyName}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm text-gray-500">Метод</p>
                                            <p className="font-medium">{cycle.method === 'seedling' ? 'Рассадный' : 'Прямой посев'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Площадь</p>
                                            <p className="font-medium">{cycle.area} {cycle.areaUnit === 'ha' ? 'га' : 'м²'}</p>
                                        </div>
                                    </div>
                                    {cycle.notes && (
                                        <div>
                                            <p className="text-sm text-gray-500">Заметки</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{cycle.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Аккордеон: Задачи */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <button
                                onClick={() => toggleSection('tasks')}
                                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                    <h2 className="font-semibold text-gray-900 dark:text-white">
                                        Задачи
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                      {stats.tasksCompleted}/{stats.tasksTotal} выполнено
                    </span>
                                    </h2>
                                </div>
                                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.tasks ? 'rotate-90' : ''}`} />
                            </button>
                            {expandedSections.tasks && (
                                <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-800">
                                    <TaskTimeline tasks={cycle.tasks} />
                                    <button className="w-full mt-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-green-600 hover:border-green-500 hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Добавить задачу
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Аккордеон: Датчики */}
                        {viewMode === 'detailed' && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-purple-600" />
                                        <h2 className="font-semibold text-gray-900 dark:text-white">Датчики</h2>
                                    </div>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {cycle.sensors.map((sensor) => (
                                        <div key={sensor.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{sensor.type === 'temperature' ? 'Температура' :
                            sensor.type === 'humidity' ? 'Влажность' :
                                sensor.type === 'soil_moisture' ? 'Влажность почвы' : 'Освещенность'}</span>
                                                <span className={`text-lg font-bold ${
                                                    sensor.status === 'normal' ? 'text-green-600' :
                                                        sensor.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                          {sensor.value} {sensor.unit}
                        </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{sensor.location}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        <GDDProgress
                            currentGDD={680}
                            requiredGDD={1100}
                            currentStage="Вегетация"
                            nextStage="Цветение"
                            dailyAccumulation={12.5}
                            forecastGDD={85}
                            size="md"
                            showDetails={true}
                        />
                        {/* Ресурсы */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Package className="w-4 h-4 text-blue-500" />
                                Использованные ресурсы
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Вода</span>
                                    <span className="font-medium">{cycle.resources.waterUsed} {cycle.resources.waterUnit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Удобрения</span>
                                    <span className="font-medium">{cycle.resources.fertilizerUsed} {cycle.resources.fertilizerUnit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Энергия</span>
                                    <span className="font-medium">{cycle.resources.energyUsed} {cycle.resources.energyUnit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Трудозатраты</span>
                                    <span className="font-medium">{cycle.resources.laborHours} чел-ч</span>
                                </div>
                            </div>
                        </div>

                        {/* Погода */}
                        {cycle.weather && <WeatherWidget weather={cycle.weather} />}

                        {/* Быстрые действия */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Быстрые действия</h3>
                            <div className="space-y-2">
                                <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                                    Добавить урожай
                                </button>
                                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                    Добавить задачу
                                </button>
                                <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                    Экспорт отчета
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowingCycleDetailsPageV2;