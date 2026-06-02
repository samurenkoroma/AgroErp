// pages/planning/CropPlanDetails.tsx
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    Calendar, CalendarDays,
    CheckCircle,
    Clock,
    Droplets,
    Flag,
    Flower2, Hourglass,
    Image,
    Leaf,
    MessageCircle,
    MoreVertical,
    Package,
    Play, Ruler,
    SkipForward,
    Sprout,
    Sun,
    Thermometer,
    TrendingUp,
    User,
    Wind
} from 'lucide-react';
import {statusLib} from "@/utils/status.ts";
import {mockCropPlan, mockPhenology, mockStatistics, mockTasks} from "@/data/mock-data.ts";

const CropPlanDetails = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'stages' | 'statistics'>('overview');

    const cropPlan = mockCropPlan;
    const phenology = mockPhenology;
    const statistics = mockStatistics;
    const tasks = mockTasks;

    // Расчет статуса рассады
    const getSeedlingStatus = () => {
        if (!cropPlan.seedlingInfo?.isSeedling) return null;

        const today = new Date();
        const sowingDate = cropPlan.seedlingInfo.sowingDate ? new Date(cropPlan.seedlingInfo.sowingDate) : null;
        const plantingDate = cropPlan.planting_date ? new Date(cropPlan.planting_date) : null;
        const expectedPlantingDate = cropPlan.seedlingInfo.expectedPlantingDate ? new Date(cropPlan.seedlingInfo.expectedPlantingDate) : null;

        if (!sowingDate) return { status: 'not_sown', message: 'Дата посева не указана' };

        const daysSinceSowing = Math.floor((today.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
        const optimalAgeMin = cropPlan.seedlingInfo.optimalAgeMin || 35;
        const optimalAgeMax = cropPlan.seedlingInfo.optimalAgeMax || 45;

        if (plantingDate && today >= plantingDate) {
            return {
                status: 'planted',
                message: 'Рассада высажена в грунт',
                subMessage: `Высадка произведена ${plantingDate.toLocaleDateString('ru')}`,
                color: 'green'
            };
        }

        if (expectedPlantingDate && today >= expectedPlantingDate) {
            return {
                status: 'ready_to_plant',
                message: 'Время высаживать рассаду!',
                subMessage: `Плановая дата высадки: ${expectedPlantingDate.toLocaleDateString('ru')}`,
                color: 'green'
            };
        }

        if (daysSinceSowing < optimalAgeMin) {
            const daysToGo = optimalAgeMin - daysSinceSowing;
            return {
                status: 'growing',
                message: `Рассада растет (${daysSinceSowing} дн.)`,
                subMessage: `Оптимальный возраст: ${optimalAgeMin}-${optimalAgeMax} дней`,
                progress: (daysSinceSowing / optimalAgeMax) * 100,
                daysToGo,
                color: 'blue'
            };
        }

        if (daysSinceSowing >= optimalAgeMin && daysSinceSowing <= optimalAgeMax) {
            return {
                status: 'ready',
                message: `Рассада готова к высадке! (${daysSinceSowing} дн.)`,
                subMessage: 'Оптимальный возраст достигнут, можно высаживать',
                progress: 100,
                color: 'green'
            };
        }

        return {
            status: 'overdue',
            message: `Рассада переросла (${daysSinceSowing} дн.)`,
            subMessage: 'Рекомендуется срочная высадка',
            progress: 100,
            color: 'red'
        };
    };

    const seedlingStatus = getSeedlingStatus();



    const getStageStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'in_progress': return <Play className="w-5 h-5 text-blue-500" />;
            case 'skipped': return <SkipForward className="w-5 h-5 text-gray-400" />;
            default: return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getPriorityBadge = (priority: string) => {
        const config = {
            urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Срочно' },
            high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Высокий' },
            medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Средний' },
            low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Низкий' }
        };
        return config[priority as keyof typeof config] || config.low;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/farm')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {cropPlan.name}
                                    </h1>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusLib.getColor(cropPlan.status)}`}>
                    {cropPlan.status_text}
                  </span>
                                    {cropPlan.seedlingInfo?.isSeedling && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium flex items-center gap-1">
                      <Flower2 className="w-3 h-3" />
                      Рассадный метод
                    </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {cropPlan.crop_name} • {cropPlan.variety_name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Редактировать
                            </button>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Завершить этап
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                         Seedling Block (если рассадный метод)
                        {cropPlan.seedlingInfo?.isSeedling && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-5 border-b border-gray-200 dark:border-gray-800">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Flower2 className="w-5 h-5 text-green-600" />
                                        Информация о рассаде
                                    </h2>
                                </div>

                                <div className="p-5 space-y-5">
                                    {/* Календарь рассады */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                                            <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Посев семян</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {cropPlan.seedlingInfo.sowingDate
                                                    ? new Date(cropPlan.seedlingInfo.sowingDate).toLocaleDateString('ru')
                                                    : 'Не указана'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                                            <Hourglass className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Возраст рассады</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {cropPlan.seedlingInfo.sowingDate
                                                    ? `${Math.floor((new Date().getTime() - new Date(cropPlan.seedlingInfo.sowingDate).getTime()) / (1000 * 60 * 60 * 24))} дн.`
                                                    : '—'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Оптимум: {cropPlan.seedlingInfo.optimalAgeMin}-{cropPlan.seedlingInfo.optimalAgeMax} дн.
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                                            <CalendarDays className="w-5 h-5 text-green-500 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">План высадки</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {cropPlan.seedlingInfo.expectedPlantingDate
                                                    ? new Date(cropPlan.seedlingInfo.expectedPlantingDate).toLocaleDateString('ru')
                                                    : 'Не указана'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Статус рассады */}
                                    {seedlingStatus && (
                                        <div className={`p-4 rounded-lg border ${
                                            seedlingStatus.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                                                seedlingStatus.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                                                    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                        }`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-full ${
                                                    seedlingStatus.color === 'green' ? 'bg-green-100 dark:bg-green-800' :
                                                        seedlingStatus.color === 'blue' ? 'bg-blue-100 dark:bg-blue-800' :
                                                            'bg-red-100 dark:bg-red-800'
                                                }`}>
                                                    {seedlingStatus.status === 'ready' || seedlingStatus.status === 'ready_to_plant' ?
                                                        <CheckCircle className="w-5 h-5 text-green-600" /> :
                                                        seedlingStatus.status === 'growing' ?
                                                            <Sprout className="w-5 h-5 text-blue-600" /> :
                                                            <AlertCircle className="w-5 h-5 text-red-600" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{seedlingStatus.message}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{seedlingStatus.subMessage}</p>
                                                    {seedlingStatus.daysToGo && seedlingStatus.daysToGo > 0 && (
                                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                                                            До готовности: {seedlingStatus.daysToGo} дней
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Прогресс роста рассады */}
                                            {seedlingStatus.progress && seedlingStatus.progress < 100 && (
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Готовность к высадке</span>
                                                        <span>{Math.round(seedlingStatus.progress)}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500 rounded-full transition-all"
                                                            style={{ width: `${seedlingStatus.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Характеристики рассады */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {cropPlan.seedlingInfo.seedlingHeight && (
                                            <div className="flex items-center gap-2">
                                                <Ruler className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Высота рассады</p>
                                                    <p className="text-sm font-medium">{cropPlan.seedlingInfo.seedlingHeight} см</p>
                                                </div>
                                            </div>
                                        )}
                                        {cropPlan.seedlingInfo.leafCount && (
                                            <div className="flex items-center gap-2">
                                                <Leaf className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Листьев</p>
                                                    <p className="text-sm font-medium">{cropPlan.seedlingInfo.leafCount} шт</p>
                                                </div>
                                            </div>
                                        )}
                                        {cropPlan.seedlingInfo.containerType && (
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Контейнер</p>
                                                    <p className="text-sm font-medium">{cropPlan.seedlingInfo.containerType}</p>
                                                </div>
                                            </div>
                                        )}
                                        {cropPlan.seedlingInfo.containerSize && (
                                            <div className="flex items-center gap-2">
                                                <Ruler className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Размер</p>
                                                    <p className="text-sm font-medium">{cropPlan.seedlingInfo.containerSize}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Закалка рассады */}
                                    {cropPlan.seedlingInfo.hardeningDays && cropPlan.seedlingInfo.hardeningDays > 0 && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                            <h4 className="font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
                                                <Sun className="w-4 h-4" />
                                                Закалка рассады
                                            </h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                                Рекомендуется закаливать рассаду в течение {cropPlan.seedlingInfo.hardeningDays} дней перед высадкой.
                                            </p>
                                            {cropPlan.seedlingInfo.hardeningStartDate && (
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                                    Начало закалки: {new Date(cropPlan.seedlingInfo.hardeningStartDate).toLocaleDateString('ru')}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Рекомендуемые стадии для высадки */}
                                    {cropPlan.seedlingInfo.recommendedStages && cropPlan.seedlingInfo.recommendedStages.length > 0 && (
                                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                                            <h4 className="font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-2">
                                                <Flag className="w-4 h-4" />
                                                Рекомендуемые стадии для высадки
                                            </h4>
                                            <div className="space-y-2">
                                                {cropPlan.seedlingInfo.recommendedStages.map((stage, idx) => (
                                                    <div key={idx} className="text-sm text-amber-700 dark:text-amber-400">
                                                        <span className="font-mono">{stage.bbchCode}</span> - {stage.name}
                                                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">{stage.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Заметки */}
                                    {cropPlan.seedlingInfo.notes && (
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{cropPlan.seedlingInfo.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                            <div className="border-b border-gray-200 dark:border-gray-800 px-6">
                                <div className="flex gap-6">
                                    {[
                                        { id: 'overview', label: 'Обзор', icon: <Activity className="w-4 h-4" /> },
                                        { id: 'tasks', label: 'Задачи', icon: <CheckCircle className="w-4 h-4" />, badge: tasks.length },
                                        { id: 'stages', label: 'Этапы', icon: <Flag className="w-4 h-4" /> },
                                        { id: 'statistics', label: 'Статистика', icon: <BarChart3 className="w-4 h-4" /> }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`
                        flex items-center gap-2 px-2 py-3 border-b-2 transition-all
                        ${activeTab === tab.id
                                                ? 'border-green-500 text-green-600 dark:text-green-400'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                            }
                      `}
                                        >
                                            {tab.icon}
                                            {tab.label}
                                            {tab.badge !== undefined && (
                                                <span className="ml-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                          {tab.badge}
                        </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Phenology Card */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <Leaf className="w-5 h-5" />
                                                        Текущая фаза: {phenology.currentPhaseName}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {phenology.currentPhaseCode} • {phenology.progressPercent}% к следующей фазе
                                                    </p>
                                                </div>
                                            </div>

                                            {/* GDD Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Накопленная GDD</span>
                                                    <span>{phenology.accumulatedGDD} / {phenology.requiredGDDForNext} °C·дн</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full transition-all"
                                                        style={{ width: `${phenology.progressPercent}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Recommended Actions */}
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Рекомендуемые действия:</p>
                                                {phenology.recommendedActions.map((action, idx) => {
                                                    const priorityBadge = getPriorityBadge(action.priority);
                                                    return (
                                                        <div key={idx} className="flex items-center gap-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityBadge.bg} ${priorityBadge.text}`}>
                                {priorityBadge.label}
                              </span>
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">{action.title}</span>
                                                            <span className="text-xs text-gray-500 ml-auto">{action.description}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Current Stage Info */}
                                        {cropPlan.current_stage && (
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Play className="w-5 h-5 text-blue-500" />
                                                    Текущий этап
                                                </h3>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{cropPlan.current_stage.name}</p>
                                                        <p className="text-sm text-gray-500 mt-1">{cropPlan.current_stage.description}</p>
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            BBCH {cropPlan.current_stage.bbch_start} - {cropPlan.current_stage.bbch_end}
                                                        </p>
                                                    </div>
                                                    <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                                                        Завершить этап
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Quick Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Дата посева/высадки
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {cropPlan.planting_date ? new Date(cropPlan.planting_date).toLocaleDateString('ru') : 'Не указана'}
                                                </p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                                    <TrendingUp className="w-4 h-4" />
                                                    Прогресс
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {cropPlan.progress}%
                                                </p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                                    <Package className="w-4 h-4" />
                                                    Урожай
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {cropPlan.harvest_kg} / {cropPlan.expected_yield} кг
                                                </p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                                    <User className="w-4 h-4" />
                                                    Ответственный
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {cropPlan.assigned_name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tasks Tab */}
                                {activeTab === 'tasks' && (
                                    <div className="space-y-3">
                                        {tasks.map(task => {
                                            const priorityBadge = getPriorityBadge(task.priority);
                                            return (
                                                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300" />
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityBadge.bg} ${priorityBadge.text}`}>
                                    {priorityBadge.label}
                                  </span>
                                                                    {task.is_overdue && (
                                                                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                                      Просрочена
                                    </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                                                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    До {new Date(task.due_date).toLocaleDateString('ru')}
                                  </span>
                                                                    <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                                                        {task.estimated_duration} мин
                                  </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                            <MoreVertical className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {tasks.length === 0 && (
                                            <div className="text-center py-12">
                                                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-500">Нет активных задач</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Stages Tab */}
                                {activeTab === 'stages' && (
                                    <div className="relative">
                                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                                        <div className="space-y-6 relative">
                                            {cropPlan.stages.map((stage) => (
                                                <div key={stage.id} className="relative flex gap-4">
                                                    <div className="relative z-10">
                                                        <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                                            {getStageStatusIcon(stage.status)}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 dark:text-white">{stage.name}</h3>
                                                                <p className="text-sm text-gray-500">{stage.description}</p>
                                                            </div>
                                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                                                stage.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                    stage.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                        'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                            }`}>
                                {stage.status_text}
                              </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                                            <span>BBCH {stage.bbch_start} - {stage.bbch_end}</span>
                                                            {stage.start_date && (
                                                                <span>Начало: {new Date(stage.start_date).toLocaleDateString('ru')}</span>
                                                            )}
                                                            {stage.end_date && (
                                                                <span>Завершение: {new Date(stage.end_date).toLocaleDateString('ru')}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Statistics Tab */}
                                {activeTab === 'statistics' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.progress}%</p>
                                                <p className="text-xs text-gray-500">Общий прогресс</p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.days_since_planting}</p>
                                                <p className="text-xs text-gray-500">Дней с посадки</p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.days_to_harvest}</p>
                                                <p className="text-xs text-gray-500">Дней до сбора</p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.completed_tasks}/{statistics.total_tasks}</p>
                                                <p className="text-xs text-gray-500">Выполнено задач</p>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Прогресс по этапам</h3>
                                            <div className="space-y-3">
                                                {cropPlan.stages.map(stage => (
                                                    <div key={stage.id}>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-700 dark:text-gray-300">{stage.name}</span>
                                                            <span className="text-gray-500">
                                {stage.status === 'completed' ? 'Завершен' :
                                    stage.status === 'in_progress' ? 'В процессе' : 'Ожидает'}
                              </span>
                                                        </div>
                                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${
                                                                    stage.status === 'completed' ? 'bg-green-500 w-full' :
                                                                        stage.status === 'in_progress' ? 'bg-blue-500 w-1/2' : 'bg-gray-400 w-0'
                                                                }`}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
                                            <h3 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-3">
                                                <AlertCircle className="w-5 h-5" />
                                                Рекомендации
                                            </h3>
                                            <ul className="space-y-2">
                                                {statistics.recommendations.map((rec, idx) => (
                                                    <li key={idx} className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                                                        <span className="text-blue-500">•</span>
                                                        {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Weather Widget */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Thermometer className="w-5 h-5" />
                                Погода на участке
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sun className="w-8 h-8 text-yellow-500" />
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">22°C</p>
                                            <p className="text-xs text-gray-500">Ощущается 24°C</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Солнечно</p>
                                        <p className="text-xs text-gray-500">Влажность 55%</p>
                                    </div>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-center">
                                        <Wind className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-500">Ветер</p>
                                        <p className="text-sm font-medium">2 м/с</p>
                                    </div>
                                    <div className="text-center">
                                        <Droplets className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-500">Осадки</p>
                                        <p className="text-sm font-medium">10%</p>
                                    </div>
                                    <div className="text-center">
                                        <Sun className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-500">УФ индекс</p>
                                        <p className="text-sm font-medium">5</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Plan Info */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Информация о плане</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Грядка</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{cropPlan.bed_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Сорт</span>
                                    <span className="text-gray-900 dark:text-white">{cropPlan.variety_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Высажено растений</span>
                                    <span className="text-gray-900 dark:text-white">{cropPlan.seeds_planted} шт</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Плановая урожайность</span>
                                    <span className="text-gray-900 dark:text-white">{cropPlan.expected_yield} кг</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Создан</span>
                                    <span className="text-gray-900 dark:text-white">{new Date(cropPlan.created_at).toLocaleDateString('ru')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions for Seedling */}
                        {cropPlan.seedlingInfo?.isSeedling && seedlingStatus?.status === 'ready' && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-5">
                                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                                    <Sprout className="w-5 h-5" />
                                    Рассада готова к высадке!
                                </h3>
                                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Запланировать высадку
                                </button>
                            </div>
                        )}

                        {cropPlan.seedlingInfo?.isSeedling && seedlingStatus?.status === 'ready_to_plant' && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-5">
                                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Пора высаживать!
                                </h3>
                                <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                                    Настало оптимальное время для высадки рассады в грунт.
                                </p>
                                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                                    <Play className="w-4 h-4" />
                                    Начать высадку
                                </button>
                            </div>
                        )}

                        {cropPlan.seedlingInfo?.isSeedling && seedlingStatus?.status === 'overdue' && (
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-5">
                                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Рассада перерастает!
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                                    Рекомендуется срочно высадить рассаду в грунт, чтобы избежать потери качества.
                                </p>
                                <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Срочно высадить
                                </button>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Быстрые действия</h3>
                            <div className="space-y-2">
                                <button className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                    <Image className="w-4 h-4" />
                                    Добавить фото
                                </button>
                                <button className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    Оставить комментарий
                                </button>
                                <button className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
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

export default CropPlanDetails;