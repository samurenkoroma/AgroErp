// pages/Dashboard.tsx
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    Droplets,
    Flower2,
    MapPin,
    Package,
    Plus,
    Sprout,
    Sun,
    TrendingUp,
    Wind
} from 'lucide-react';
import {useCurrentOrganization} from "@/features/organization/queries/useCurrentOrganization.ts";
import Loading from "@/components/shared/Loading.tsx";

// ==================== TYPES ====================

interface DashboardStats {
    totalArea: number;
    activePlans: number;
    completedPlans: number;
    totalHarvest: number;
    avgYield: number;
    activeTasks: number;
    overdueTasks: number;
    lowStockItems: number;
}

interface ActivePlan {
    id: string;
    name: string;
    crop_name: string;
    variety_name: string;
    bed_name: string;
    progress: number;
    status: 'active' | 'completed' | 'planned';
    planting_date: string;
    expected_harvest: string;
    is_seedling?: boolean;
    seedling_status?: string;
}

interface UpcomingTask {
    id: string;
    plan_id: string;
    title: string;
    description: string;
    due_date: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    plan_name: string;
}

interface WeatherForecast {
    date: string;
    temp_min: number;
    temp_max: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
    precipitation: number;
}

interface LowStockItem {
    id: string;
    name: string;
    quantity: number;
    min_quantity: number;
    unit: string;
    type: string;
}

// ==================== MOCK DATA ====================

const mockStats: DashboardStats = {
    totalArea: 158.0,
    activePlans: 4,
    completedPlans: 2,
    totalHarvest: 6840,
    avgYield: 43.3,
    activeTasks: 12,
    overdueTasks: 2,
    lowStockItems: 3
};

const mockActivePlans: ActivePlan[] = [
    {
        id: 'plan-1',
        name: 'Пшеница озимая 2025',
        crop_name: 'Пшеница озимая',
        variety_name: 'Мироновская 65',
        bed_name: 'Поле Северное',
        progress: 72,
        status: 'active',
        planting_date: '2024-09-15',
        expected_harvest: '2025-07-20',
        is_seedling: false
    },
    {
        id: 'plan-2',
        name: 'Томаты ранние 2025',
        crop_name: 'Томат',
        variety_name: 'Бычье сердце',
        bed_name: 'Теплица №1 / Грядка 1',
        progress: 25,
        status: 'active',
        planting_date: '2025-04-20',
        expected_harvest: '2025-07-20',
        is_seedling: true,
        seedling_status: 'growing'
    },
    {
        id: 'plan-3',
        name: 'Кукуруза 2025',
        crop_name: 'Кукуруза',
        variety_name: 'Днепровский 247',
        bed_name: 'Поле Восточное',
        progress: 71,
        status: 'active',
        planting_date: '2025-04-25',
        expected_harvest: '2025-09-10',
        is_seedling: false
    },
    {
        id: 'plan-4',
        name: 'Огурцы весенние 2025',
        crop_name: 'Огурец',
        variety_name: 'Герман F1',
        bed_name: 'Теплица №1 / Грядка 2',
        progress: 53,
        status: 'active',
        planting_date: '2025-05-01',
        expected_harvest: '2025-07-15',
        is_seedling: true,
        seedling_status: 'planted'
    }
];

const mockUpcomingTasks: UpcomingTask[] = [
    {
        id: 'task-1',
        plan_id: 'plan-2',
        title: 'Полив томатов',
        description: 'Обильный полив после высадки',
        due_date: '2025-04-20',
        priority: 'high',
        plan_name: 'Томаты ранние 2025'
    },
    {
        id: 'task-2',
        plan_id: 'plan-1',
        title: 'Обработка гербицидами',
        description: 'Защита от сорняков',
        due_date: '2025-04-22',
        priority: 'medium',
        plan_name: 'Пшеница озимая 2025'
    },
    {
        id: 'task-3',
        plan_id: 'plan-3',
        title: 'Подкормка кукурузы',
        description: 'Внесение азотных удобрений',
        due_date: '2025-04-18',
        priority: 'urgent',
        plan_name: 'Кукуруза 2025'
    },
    {
        id: 'task-4',
        plan_id: 'plan-4',
        title: 'Подвязывание огурцов',
        description: 'Установка шпалер',
        due_date: '2025-04-25',
        priority: 'low',
        plan_name: 'Огурцы весенние 2025'
    }
];

const mockWeatherForecast: WeatherForecast[] = [
    {date: '2025-04-20', temp_min: 12, temp_max: 22, condition: 'sunny', precipitation: 0},
    {date: '2025-04-21', temp_min: 10, temp_max: 20, condition: 'cloudy', precipitation: 5},
    {date: '2025-04-22', temp_min: 8, temp_max: 18, condition: 'rainy', precipitation: 15},
    {date: '2025-04-23', temp_min: 9, temp_max: 19, condition: 'cloudy', precipitation: 2},
    {date: '2025-04-24', temp_min: 11, temp_max: 23, condition: 'sunny', precipitation: 0}
];

const mockLowStockItems: LowStockItem[] = [
    {id: '1', name: 'Кассета 40 ячеек', quantity: 45, min_quantity: 50, unit: 'шт', type: 'cassette'},
    {id: '2', name: 'Торфяные стаканчики 0.3л', quantity: 150, min_quantity: 200, unit: 'шт', type: 'pot'},
    {id: '3', name: 'Кассета 128 ячеек', quantity: 25, min_quantity: 40, unit: 'шт', type: 'cassette'}
];

// ==================== COMPONENTS ====================

const StatCard = ({title, value, unit, icon: Icon, color, trend, onClick}: any) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
                <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`}/>
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </div>
            )}
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
            <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
);

const PriorityBadge = ({priority}: { priority: string }) => {
    const config = {
        urgent: {bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Срочно'},
        high: {
            bg: 'bg-orange-100 dark:bg-orange-900/30',
            text: 'text-orange-700 dark:text-orange-400',
            label: 'Высокий'
        },
        medium: {
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            text: 'text-yellow-700 dark:text-yellow-400',
            label: 'Средний'
        },
        low: {bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Низкий'}
    };
    const style = config[priority as keyof typeof config] || config.medium;
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
    );
};

const WeatherIcon = ({condition}: { condition: WeatherForecast['condition'] }) => {
    switch (condition) {
        case 'sunny':
            return <Sun className="w-8 h-8 text-yellow-500"/>;
        case 'cloudy':
            return <Sun className="w-8 h-8 text-gray-400"/>;
        case 'rainy':
            return <Droplets className="w-8 h-8 text-blue-500"/>;
        case 'snowy':
            return <Wind className="w-8 h-8 text-blue-300"/>;
        default:
            return <Sun className="w-8 h-8 text-yellow-500"/>;
    }
};

// ==================== MAIN COMPONENT ====================

export const Dashboard = () => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const {organization, isLoading} = useCurrentOrganization()
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getCropIcon = (cropName: string) => {
        const icons: Record<string, string> = {
            'Пшеница озимая': '🌾',
            'Кукуруза': '🌽',
            'Томат': '🍅',
            'Огурец': '🥒',
            'Соя': '🫘'
        };
        return icons[cropName] || '🌱';
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress >= 25) return 'bg-yellow-500';
        return 'bg-gray-500';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru', {day: 'numeric', month: 'short'});
    };

    const isOverdue = (dateStr: string) => {
        return new Date(dateStr) < new Date();
    };

    if (isLoading) return (<Loading text="Загрузка данных..."/>);
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="px-8 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {organization?.name}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Обзор сельскохозяйственной деятельности
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                {currentTime.toLocaleDateString('ru', {day: 'numeric', month: 'long', year: 'numeric'})}
                            </p>
                            <p className="text-xs text-gray-400">
                                Сезон 2025
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
                    <StatCard
                        title="Общая площадь"
                        value={mockStats.totalArea}
                        unit="га"
                        icon={MapPin}
                        color="green"
                        onClick={() => navigate('/farm')}
                    />
                    <StatCard
                        title="Активные посевы"
                        value={mockStats.activePlans}
                        unit=""
                        icon={Sprout}
                        color="green"
                        onClick={() => navigate('/planning')}
                    />
                    <StatCard
                        title="Завершено"
                        value={mockStats.completedPlans}
                        unit=""
                        icon={CheckCircle}
                        color="blue"
                    />
                    <StatCard
                        title="Собрано урожая"
                        value={(mockStats.totalHarvest / 1000).toFixed(1)}
                        unit="т"
                        icon={Package}
                        color="amber"
                    />
                    <StatCard
                        title="Средняя урожайность"
                        value={mockStats.avgYield}
                        unit="ц/га"
                        icon={TrendingUp}
                        color="purple"
                    />
                    <StatCard
                        title="Активных задач"
                        value={mockStats.activeTasks}
                        unit=""
                        icon={Clock}
                        color="blue"
                    />
                    <StatCard
                        title="Просрочено"
                        value={mockStats.overdueTasks}
                        unit=""
                        icon={AlertCircle}
                        color="red"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Active Crops */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Active Crops Section */}
                        <div
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div
                                className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sprout className="w-5 h-5 text-green-600"/>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Активные
                                        посевы</h2>
                                </div>
                                <button
                                    onClick={() => navigate('/planning')}
                                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                                >
                                    Все посевы
                                    <ArrowRight className="w-4 h-4"/>
                                </button>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                {mockActivePlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        onClick={() => navigate(`/plan/${plan.id}`)}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{getCropIcon(plan.crop_name)}</span>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">{plan.crop_name}</h3>
                                                    <p className="text-xs text-gray-500">{plan.variety_name} • {plan.bed_name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{plan.progress}%</p>
                                                <p className="text-xs text-gray-400">прогресс</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div
                                                className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${getProgressColor(plan.progress)}`}
                                                    style={{width: `${plan.progress}%`}}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Посадка: {formatDate(plan.planting_date)}</span>
                                                <span>Сбор: {formatDate(plan.expected_harvest)}</span>
                                            </div>
                                        </div>
                                        {plan.is_seedling && (
                                            <div className="mt-2">
                        <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs">
                          <Flower2 className="w-3 h-3"/>
                          Рассада
                        </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weather Forecast */}
                        <div
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <Sun className="w-5 h-5 text-amber-500"/>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Прогноз
                                        погоды</h2>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-5 gap-3">
                                    {mockWeatherForecast.map((day, idx) => (
                                        <div key={idx} className="text-center">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {new Date(day.date).toLocaleDateString('ru', {weekday: 'short'})}
                                            </p>
                                            <div className="my-2 flex justify-center">
                                                <WeatherIcon condition={day.condition}/>
                                            </div>
                                            <p className="text-sm font-semibold">
                                                {Math.round(day.temp_max)}°/{Math.round(day.temp_min)}°
                                            </p>
                                            {day.precipitation > 0 && (
                                                <p className="text-xs text-blue-500">{day.precipitation} мм</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Tasks Section */}
                        <div
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div
                                className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-500"/>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Задачи</h2>
                                </div>
                                <span
                                    className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  {mockUpcomingTasks.length}
                </span>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-80 overflow-y-auto">
                                {mockUpcomingTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => navigate(`/plan/${task.plan_id}`)}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">{task.plan_name}</p>
                                            </div>
                                            <PriorityBadge priority={task.priority}/>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{task.description}</p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="w-3 h-3 text-gray-400"/>
                                            <span
                                                className={isOverdue(task.due_date) ? 'text-red-500' : 'text-gray-500'}>
                        {isOverdue(task.due_date) ? 'Просрочено: ' : 'До: '}
                                                {formatDate(task.due_date)}
                      </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div
                                className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                <button className="w-full text-center text-sm text-green-600 hover:text-green-700">
                                    Все задачи
                                </button>
                            </div>
                        </div>

                        {/* Inventory Alert */}
                        <div
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-500"/>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Заканчивается</h2>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                {mockLowStockItems.map((item) => (
                                    <div key={item.id} className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                                                <p className="text-xs text-gray-500">{item.type === 'cassette' ? 'Кассета' : 'Стаканчик'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-yellow-600">{item.quantity} / {item.min_quantity}</p>
                                                <p className="text-xs text-gray-500">мин. {item.min_quantity} {item.unit}</p>
                                            </div>
                                        </div>
                                        <div
                                            className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-500 rounded-full"
                                                style={{width: `${(item.quantity / item.min_quantity) * 100}%`}}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div
                                className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                <button
                                    onClick={() => navigate('/inventory')}
                                    className="w-full text-center text-sm text-green-600 hover:text-green-700"
                                >
                                    Перейти в инвентарь
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-5 text-white">
                            <h3 className="font-semibold mb-2">Быстрые действия</h3>
                            <p className="text-sm text-green-100 mb-4">Создайте новый план посева</p>
                            <button
                                onClick={() => navigate('/planning')}
                                className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4"/>
                                Новый посев
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;