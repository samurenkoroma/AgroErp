// pages/planning/SeasonDashboardPage.tsx
import {useMemo, useState} from 'react';
import {
    Activity,
    AlertCircle,
    Apple,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    CloudRain,
    Database,
    Download,
    Droplet,
    FlaskConical,
    Package,
    Share2,
    Sprout,
    Target,
    Tractor,
    TrendingDown,
    TrendingUp,
    X
} from 'lucide-react';

// ==================== TYPES ====================

interface PlantingLocation {
    id: string;
    name: string;
    type: 'field' | 'greenhouse' | 'plot';
    area: number;
    varietyId: string;
    varietyName: string;
    cropName: string;
    plantedDate: string;
    harvestDate?: string;
    actualYield: number;
    expectedYield: number;
    yieldEfficiency: number;
    resources: {
        waterUsed: number; // м³
        fertilizerUsed: { name: string; amount: number; unit: string }[];
        fuelUsed: number; // л
        laborHours: number; // чел-часов
        seedsUsed: number; // кг или шт
    };
    deviations: {
        type: string;
        description: string;
        impact: 'low' | 'medium' | 'high';
    }[];
}

interface SeasonDashboard {
    id: string;
    name: string;
    year: number;
    type: 'past' | 'current' | 'planned';
    startDate: string;
    endDate: string;
    status: 'draft' | 'active' | 'completed' | 'archived';

    // Общая статистика
    statistics: {
        totalPlans: number;
        completedPlans: number;
        activePlans: number;
        totalArea: number;
        totalHarvest: number;
        avgYield: number;
        yieldChange?: number;
        totalRevenue: number;
        totalCosts: number;
        profit: number;
        profitMargin: number;
    };

    // Агрономические показатели (общие)
    agronomy: {
        totalWaterUsed: number;
        totalWaterApplied: number;
        waterEfficiency: number;
        totalFertilizerUsed: number; // кг
        totalFuelUsed: number; // л
        totalLaborHours: number;
        avgYieldPerHa: number;
    };

    // Погода
    weather: {
        avgTemp: number;
        maxTemp: number;
        minTemp: number;
        totalPrecipitation: number;
        sunnyDays: number;
        rainyDays: number;
        avgHumidity: number;
        tempDeviation: number;
        precipDeviation: number;
    };

    // Детали по местам посадки
    plantingLocations: PlantingLocation[];

    // Ключевые выводы
    insights: {
        title: string;
        description: string;
        type: 'success' | 'warning' | 'info' | 'error';
        recommendation?: string;
    }[];

    goals?: {
        target: string;
        achieved: number;
        targetValue: number;
        unit: string;
    }[];
}

// ==================== MOCK DATA ====================

const mockSeasonDashboard: SeasonDashboard = {
    id: 'season-2025',
    name: 'Сезон 2025',
    year: 2025,
    type: 'current',
    startDate: '2025-03-01T00:00:00Z',
    endDate: '2025-11-30T00:00:00Z',
    status: 'active',

    statistics: {
        totalPlans: 28,
        completedPlans: 15,
        activePlans: 13,
        totalArea: 158.0,
        totalHarvest: 6840,
        avgYield: 43.3,
        yieldChange: -5.2,
        totalRevenue: 0,
        totalCosts: 5200000,
        profit: -5200000,
        profitMargin: 0
    },

    agronomy: {
        totalWaterUsed: 284400,
        totalWaterApplied: 316000,
        waterEfficiency: 24.1,
        totalFertilizerUsed: 45200,
        totalFuelUsed: 18750,
        totalLaborHours: 3420,
        avgYieldPerHa: 43.3
    },

    weather: {
        avgTemp: 15.2,
        maxTemp: 34.5,
        minTemp: -2.0,
        totalPrecipitation: 320,
        sunnyDays: 142,
        rainyDays: 68,
        avgHumidity: 65,
        tempDeviation: 0.7,
        precipDeviation: -130
    },

    plantingLocations: [
        {
            id: 'field-north',
            name: 'Поле Северное',
            type: 'field',
            area: 50,
            varietyId: 'var-wheat-1',
            varietyName: 'Мироновская 65',
            cropName: 'Пшеница озимая',
            plantedDate: '2024-09-15',
            harvestDate: '2025-07-20',
            actualYield: 3100,
            expectedYield: 4250,
            yieldEfficiency: 72.9,
            resources: {
                waterUsed: 75000,
                fertilizerUsed: [
                    { name: 'Аммиачная селитра', amount: 12500, unit: 'кг' },
                    { name: 'Калийные удобрения', amount: 5000, unit: 'кг' },
                    { name: 'Фосфорные удобрения', amount: 4000, unit: 'кг' }
                ],
                fuelUsed: 4850,
                laborHours: 890,
                seedsUsed: 9000
            },
            deviations: [
                { type: 'temperature', description: 'Майские заморозки', impact: 'medium' },
                { type: 'water', description: 'Недостаток осадков в июне', impact: 'high' }
            ]
        },
        {
            id: 'field-east',
            name: 'Поле Восточное',
            type: 'field',
            area: 75,
            varietyId: 'var-corn-1',
            varietyName: 'Днепровский 247',
            cropName: 'Кукуруза',
            plantedDate: '2025-04-25',
            harvestDate: '',
            actualYield: 3750,
            expectedYield: 5250,
            yieldEfficiency: 71.4,
            resources: {
                waterUsed: 135000,
                fertilizerUsed: [
                    { name: 'Аммиачная селитра', amount: 18750, unit: 'кг' },
                    { name: 'Калийные удобрения', amount: 7500, unit: 'кг' },
                    { name: 'Фосфорные удобрения', amount: 6000, unit: 'кг' }
                ],
                fuelUsed: 8200,
                laborHours: 1560,
                seedsUsed: 5250
            },
            deviations: [
                { type: 'water', description: 'Засуха в период цветения', impact: 'high' }
            ]
        },
        {
            id: 'greenhouse-1',
            name: 'Теплица №1 / Грядка 1',
            type: 'greenhouse',
            area: 0.25,
            varietyId: 'var-tomato-1',
            varietyName: 'Бычье сердце',
            cropName: 'Томат',
            plantedDate: '2025-03-15',
            harvestDate: '2025-07-10',
            actualYield: 1200,
            expectedYield: 1750,
            yieldEfficiency: 68.6,
            resources: {
                waterUsed: 37500,
                fertilizerUsed: [
                    { name: 'Комплексное удобрение', amount: 1250, unit: 'кг' },
                    { name: 'Кальциевая селитра', amount: 500, unit: 'кг' }
                ],
                fuelUsed: 1200,
                laborHours: 450,
                seedsUsed: 1000
            },
            deviations: []
        },
        {
            id: 'plot-1',
            name: 'Участок Приусадебный / Грядка 1',
            type: 'plot',
            area: 0.04,
            varietyId: 'var-cucumber-1',
            varietyName: 'Герман F1',
            cropName: 'Огурец',
            plantedDate: '2025-05-01',
            harvestDate: '2025-08-15',
            actualYield: 320,
            expectedYield: 400,
            yieldEfficiency: 80.0,
            resources: {
                waterUsed: 12000,
                fertilizerUsed: [
                    { name: 'Органические удобрения', amount: 200, unit: 'кг' }
                ],
                fuelUsed: 150,
                laborHours: 280,
                seedsUsed: 75
            },
            deviations: []
        }
    ],

    insights: [
        {
            title: 'Недобор урожая пшеницы',
            description: 'Из-за майских заморозков и недостатка осадков в июне урожайность пшеницы ниже плановой на 27%',
            type: 'warning',
            recommendation: 'Рекомендуется использовать морозостойкие сорта и увеличить полив в засушливые периоды'
        },
        {
            title: 'Эффективность полива',
            description: 'Эффективность использования воды составляет 24.1 кг/м³, что на 15% ниже оптимального',
            type: 'info',
            recommendation: 'Переход на капельное орошение может повысить эффективность на 30-40%'
        },
        {
            title: 'Тепловой стресс кукурузы',
            description: 'В период цветения кукурузы было 8 дней с температурой выше 32°C',
            type: 'error',
            recommendation: 'Рекомендуется сместить сроки посева на 10-14 дней раньше'
        }
    ],

    goals: [
        { target: 'Урожайность пшеницы', achieved: 62, targetValue: 85, unit: 'ц/га' },
        { target: 'Урожайность кукурузы', achieved: 50, targetValue: 75, unit: 'ц/га' },
        { target: 'Эффективность полива', achieved: 24.1, targetValue: 35, unit: 'кг/м³' }
    ]
};

// ==================== COMPONENTS ====================

const MetricCard = ({ title, value, unit, icon: Icon, color, subValue, trend }: any) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
                <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
            <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
        {subValue && <p className="text-xs text-gray-400 mt-2">{subValue}</p>}
    </div>
);

const LocationDetailModal = ({ location, onClose }: { location: PlantingLocation; onClose: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-xl">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{location.name}</h2>
                        <p className="text-sm text-gray-500">{location.cropName} • {location.varietyName}</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Основные показатели */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500">Площадь</p>
                            <p className="text-xl font-bold">{location.area.toFixed(2)} {location.type === 'field' ? 'га' : 'м²'}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500">Урожай</p>
                            <p className="text-xl font-bold">{location.actualYield > 0 ? (location.actualYield / location.area).toFixed(0) : '—'} <span className="text-sm">ц/га</span></p>
                            <p className="text-xs text-gray-400">план: {(location.expectedYield / location.area).toFixed(0)} ц/га</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500">Выполнение</p>
                            <p className="text-xl font-bold text-green-600">{location.yieldEfficiency.toFixed(0)}%</p>
                        </div>
                    </div>

                    {/* Ресурсы */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-500" />
                            Затраченные ресурсы
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Droplet className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium">Вода</span>
                                </div>
                                <p className="text-lg font-bold">{(location.resources.waterUsed / 1000).toFixed(1)} тыс. м³</p>
                                <p className="text-xs text-gray-500">Эффективность: {(location.actualYield / location.resources.waterUsed * 1000).toFixed(1)} кг/м³</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <FlaskConical className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-medium">Удобрения</span>
                                </div>
                                <div className="space-y-1">
                                    {location.resources.fertilizerUsed.map((fert, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span>{fert.name}</span>
                                            <span className="font-medium">{fert.amount.toLocaleString()} {fert.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Tractor className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm font-medium">Топливо</span>
                                </div>
                                <p className="text-lg font-bold">{location.resources.fuelUsed.toLocaleString()} л</p>
                                <p className="text-xs text-gray-500">на {location.area.toFixed(1)} {location.type === 'field' ? 'га' : 'м²'}</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm font-medium">Трудозатраты</span>
                                </div>
                                <p className="text-lg font-bold">{location.resources.laborHours.toLocaleString()} чел-ч</p>
                                <p className="text-xs text-gray-500">≈ {Math.round(location.resources.laborHours / 8)} чел-дней</p>
                            </div>
                        </div>
                    </div>

                    {/* Отклонения */}
                    {location.deviations.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                Зафиксированные проблемы
                            </h3>
                            <div className="space-y-2">
                                {location.deviations.map((dev, idx) => (
                                    <div key={idx} className={`p-3 rounded-lg border ${
                                        dev.impact === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200' :
                                            dev.impact === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200' :
                                                'bg-blue-50 dark:bg-blue-900/20 border-blue-200'
                                    }`}>
                                        <p className="text-sm font-medium">{dev.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">Влияние: {dev.impact === 'high' ? 'Высокое' : dev.impact === 'medium' ? 'Среднее' : 'Низкое'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

const SeasonDashboardPage = () => {
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const season = mockSeasonDashboard;

    const selectedLocation = useMemo(() => {
        return season.plantingLocations.find(l => l.id === selectedLocationId);
    }, [selectedLocationId, season.plantingLocations]);

    // Группировка по культурам для компактного отображения
    const groupedByCrop = useMemo(() => {
        const groups: Record<string, PlantingLocation[]> = {};
        season.plantingLocations.forEach(loc => {
            if (!groups[loc.cropName]) groups[loc.cropName] = [];
            groups[loc.cropName].push(loc);
        });
        return groups;
    }, [season.plantingLocations]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0">
                <div className="max-w-[1600px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-green-600" />
                                    Дашборд сезона
                                </h1>
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                  {season.status === 'active' ? 'Активный' : season.status === 'completed' ? 'Завершен' : 'Черновик'}
                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {season.name} • {new Date(season.startDate).toLocaleDateString('ru')} — {new Date(season.endDate).toLocaleDateString('ru')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Экспорт
                            </button>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                                <Share2 className="w-4 h-4" />
                                Поделиться
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
                {/* Row 1: Ключевые метрики */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <MetricCard title="Всего планов" value={season.statistics.totalPlans} unit="" icon={BarChart3} color="blue" />
                    <MetricCard title="Завершено" value={season.statistics.completedPlans} unit={`/ ${season.statistics.totalPlans}`} icon={CheckCircle} color="green" />
                    <MetricCard title="Площадь" value={season.statistics.totalArea.toFixed(0)} unit="га" icon={Sprout} color="green" />
                    <MetricCard title="Урожай" value={(season.statistics.totalHarvest / 1000).toFixed(1)} unit="т" icon={Apple} color="amber" trend={season.statistics.yieldChange} />
                    <MetricCard title="Выручка" value={season.statistics.totalRevenue > 0 ? `${(season.statistics.totalRevenue / 1000000).toFixed(1)}` : '—'} unit="млн ₽" icon={TrendingUp} color="green" />
                    <MetricCard title="Рентабельность" value={season.statistics.profitMargin > 0 ? season.statistics.profitMargin.toFixed(1) : '—'} unit="%" icon={Activity} color="purple" />
                </div>

                {/* Row 2: Агрономические показатели */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5 text-green-600" />
                            Агрономические показатели
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <Droplet className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                                <p className="text-xl font-bold">{(season.agronomy.totalWaterUsed / 1000).toFixed(0)}</p>
                                <p className="text-xs text-gray-500">тыс. м³ воды</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <FlaskConical className="w-5 h-5 text-green-500 mx-auto mb-2" />
                                <p className="text-xl font-bold">{(season.agronomy.totalFertilizerUsed / 1000).toFixed(0)}</p>
                                <p className="text-xs text-gray-500">т удобрений</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <Tractor className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                                <p className="text-xl font-bold">{season.agronomy.totalFuelUsed.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">л топлива</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <Clock className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                                <p className="text-xl font-bold">{season.agronomy.totalLaborHours.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">чел-часов</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-2" />
                                <p className="text-xl font-bold">{season.agronomy.avgYieldPerHa.toFixed(0)}</p>
                                <p className="text-xs text-gray-500">ц/га ср.урожай</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <CloudRain className="w-5 h-5 text-blue-500" />
                            Погодные условия
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Ср. температура</span>
                                <span className="font-semibold">{season.weather.avgTemp}°C {season.weather.tempDeviation >= 0 ? '↑' : '↓'} {Math.abs(season.weather.tempDeviation)}°</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Осадки</span>
                                <span className="font-semibold">{season.weather.totalPrecipitation} мм {season.weather.precipDeviation >= 0 ? '↑' : '↓'} {Math.abs(season.weather.precipDeviation)} мм</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Солнечные дни</span>
                                <span className="font-semibold">{season.weather.sunnyDays}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Дождливые дни</span>
                                <span className="font-semibold">{season.weather.rainyDays}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 3: Выполнение по культурам и местам посадки */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sprout className="w-5 h-5 text-green-600" />
                            Выполнение по культурам и местам посадки
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {Object.entries(groupedByCrop).map(([cropName, locations]) => {
                            const totalArea = locations.reduce((sum, l) => sum + l.area, 0);
                            const totalYield = locations.reduce((sum, l) => sum + l.actualYield, 0);
                            const avgEfficiency = locations.reduce((sum, l) => sum + l.yieldEfficiency, 0) / locations.length;

                            return (
                                <div key={cropName} className="p-6">
                                    <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cropName}</h3>
                                            <p className="text-sm text-gray-500">{locations.length} участков, {totalArea.toFixed(1)} га</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Средняя урожайность</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {totalYield > 0 ? (totalYield / totalArea).toFixed(0) : '—'}
                                                    <span className="text-sm font-normal text-gray-500"> ц/га</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Выполнение</p>
                                                <p className="text-xl font-bold text-green-600">{avgEfficiency.toFixed(0)}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Список мест посадки */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                                        {locations.map((location) => (
                                            <div
                                                key={location.id}
                                                onClick={() => setSelectedLocationId(location.id)}
                                                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-all border border-transparent hover:border-green-300"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {location.type === 'field' ? '🌾' : location.type === 'greenhouse' ? '🌱' : '📍'}
                            </span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{location.name}</span>
                                                    </div>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        location.yieldEfficiency >= 80 ? 'bg-green-100 text-green-700' :
                                                            location.yieldEfficiency >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                    }`}>
                            {location.yieldEfficiency}%
                          </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{location.varietyName}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Droplet className="w-3 h-3" />
                              {(location.resources.waterUsed / 1000).toFixed(0)} м³
                          </span>
                                                    <span className="flex items-center gap-1">
                            <FlaskConical className="w-3 h-3" />
                                                        {location.resources.fertilizerUsed.reduce((sum, f) => sum + f.amount, 0).toFixed(0)} кг
                          </span>
                                                    <span className="flex items-center gap-1">
                            <Tractor className="w-3 h-3" />
                                                        {location.resources.fuelUsed.toFixed(0)} л
                          </span>
                                                </div>
                                                {location.harvestDate && (
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        Сбор: {new Date(location.harvestDate).toLocaleDateString('ru')}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Row 4: Инсайты и цели */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Инсайты */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-500" />
                            Ключевые выводы и рекомендации
                        </h2>
                        <div className="space-y-4">
                            {season.insights.map((insight, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border ${
                                    insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200' :
                                        insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200' :
                                            insight.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200' :
                                                'bg-blue-50 dark:bg-blue-900/20 border-blue-200'
                                }`}>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
                                    {insight.recommendation && (
                                        <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                                <span className="font-medium">Рекомендация:</span> {insight.recommendation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Цели */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-500" />
                            Выполнение целей
                        </h2>
                        <div className="space-y-4">
                            {season.goals?.map((goal, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">{goal.target}</span>
                                        <span className="font-medium">{goal.achieved} / {goal.targetValue} {goal.unit}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                (goal.achieved / goal.targetValue) >= 0.9 ? 'bg-green-500' :
                                                    (goal.achieved / goal.targetValue) >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${(goal.achieved / goal.targetValue) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Общая эффективность */}
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Общая эффективность сезона</span>
                                <span className="text-2xl font-bold text-green-600">
                  {((season.statistics.completedPlans / season.statistics.totalPlans) * 100).toFixed(0)}%
                </span>
                            </div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                                    style={{ width: `${(season.statistics.completedPlans / season.statistics.totalPlans) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модалка деталей места посадки */}
            {selectedLocation && (
                <LocationDetailModal
                    location={selectedLocation}
                    onClose={() => setSelectedLocationId(null)}
                />
            )}
        </div>
    );
};

export default SeasonDashboardPage;