// pages/planning/CropPlanDetails.tsx
import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    Calendar,
    CalendarDays,
    CheckCircle,
    Clock,
    Droplets,
    Flag,
    Flower2,
    Hourglass,
    Image,
    Leaf,
    MessageCircle,
    MoreVertical,
    Package,
    Play,
    Ruler,
    SkipForward,
    Sprout,
    Sun,
    Thermometer,
    TrendingUp,
    User, Wind
} from 'lucide-react';

// ==================== TYPES ====================

interface StageDTO {
    id: string;
    name: string;
    type: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    status_text: string;
    order: number;
    bbch_start: number;
    bbch_end: number;
    is_applicable: boolean;
    start_date: string | null;
    end_date: string | null;
}

interface TaskDTO {
    id: string;
    plan_id: string;
    bed_id: string;
    type: string;
    type_text: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    status_text: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    priority_text: string;
    priority_color: string;
    title: string;
    description: string;
    instructions: string;
    scheduled_date: string;
    due_date: string;
    is_overdue: boolean;
    estimated_duration: number;
    actual_duration: number;
    latitude: number;
    longitude: number;
    photos: PhotoDTO[];
    comments: CommentDTO[];
    completed_at: string | null;
    completed_by: string | null;
}

interface PhotoDTO {
    id: string;
    url: string;
    thumbnail: string;
    taken_at: string;
    notes: string;
}

interface CommentDTO {
    id: string;
    user_id: string;
    user_name: string;
    text: string;
    created_at: string;
}

interface RecommendedAction {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_days: number;
}

interface CurrentPhenologyResponse {
    plan_id: string;
    plan_name: string;
    variety_id: string;
    variety_name: string;
    accumulated_gdd: number;
    required_gdd_for_next: number;
    current_phase_code: string;
    current_phase_name: string;
    progress_percent: number;
    estimated_days_to_next_phase: number;
    estimated_harvest_date: string;
    deviation_days: number;
    deviation_reason: string;
    is_critical: boolean;
    recommended_actions: RecommendedAction[];
    available_stages: StageDTO[];
}

interface PlanStatisticsResponse {
    plan_id: string;
    plan_name: string;
    variety_name: string;
    status: string;
    progress: number;
    completed_stages: number;
    total_stages: number;
    pending_stages: number;
    in_progress_stages: number;
    skipped_stages: number;
    days_since_planting: number;
    days_remaining: number;
    days_to_harvest: number;
    expected_yield: number;
    actual_yield: number;
    yield_efficiency: number;
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    overdue_tasks: number;
    avg_task_completion_days: number;
    deviation_days: number;
    recommendations: string[];
}

interface SeedlingInfo {
    isSeedling: boolean;
    sowingDate?: string;
    expectedPlantingDate?: string;
    actualPlantingDate?: string;
    seedlingAgeDays?: number;
    optimalAgeMin?: number;
    optimalAgeMax?: number;
    seedlingHeight?: number;
    leafCount?: number;
    hardeningDays?: number;
    hardeningStartDate?: string;
    hardeningEndDate?: string;
    containerType?: string;
    containerSize?: string;
    notes?: string;
    recommendedStages?: {
        bbchCode: string;
        name: string;
        description: string;
    }[];
}

interface CropPlanDTO {
    id: string;
    bed_id: string;
    name: string;
    variety_id: string;
    variety_name: string;
    crop_name: string;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    status_text: string;
    season_start: string;
    season_end: string;
    planting_date: string;
    sowing_date?: string;
    seeds_planted: number;
    expected_yield: number;
    harvest_kg: number;
    progress: number;
    stages: StageDTO[];
    current_stage: StageDTO | null;
    assigned_to: string;
    assigned_name: string;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
    seedlingInfo?: SeedlingInfo;
}

// ==================== MOCK DATA ====================

const mockCropPlan: CropPlanDTO = {
    id: 'plan-tomato-1',
    bed_id: 'greenhouse-1',
    name: 'Томаты ранние 2025',
    variety_id: 'var-tomato-1',
    variety_name: 'Бычье сердце',
    crop_name: 'Томат',
    status: 'active',
    status_text: 'Активный',
    season_start: '2025-03-01T00:00:00Z',
    season_end: '2025-07-31T00:00:00Z',
    planting_date: '2025-04-20T00:00:00Z',
    sowing_date: '2025-03-01T00:00:00Z',
    seeds_planted: 1000,
    expected_yield: 2000,
    harvest_kg: 450,
    progress: 45,
    stages: [
        {
            id: 'stage-1',
            name: 'Посев семян на рассаду',
            type: 'sowing',
            description: 'Посев семян в кассеты',
            status: 'completed',
            status_text: 'Завершен',
            order: 1,
            bbch_start: 0,
            bbch_end: 9,
            is_applicable: true,
            start_date: '2025-03-01T00:00:00Z',
            end_date: '2025-03-01T00:00:00Z'
        },
        {
            id: 'stage-2',
            name: 'Выращивание рассады',
            type: 'seedling',
            description: 'Уход за рассадой, полив, подкормка',
            status: 'completed',
            status_text: 'Завершен',
            order: 2,
            bbch_start: 10,
            bbch_end: 19,
            is_applicable: true,
            start_date: '2025-03-02T00:00:00Z',
            end_date: '2025-04-19T00:00:00Z'
        },
        {
            id: 'stage-3',
            name: 'Закалка рассады',
            type: 'hardening',
            description: 'Адаптация к внешним условиям',
            status: 'completed',
            status_text: 'Завершен',
            order: 3,
            bbch_start: 19,
            bbch_end: 19,
            is_applicable: true,
            start_date: '2025-04-13T00:00:00Z',
            end_date: '2025-04-19T00:00:00Z'
        },
        {
            id: 'stage-4',
            name: 'Высадка в грунт',
            type: 'planting',
            description: 'Высадка рассады на постоянное место',
            status: 'in_progress',
            status_text: 'В процессе',
            order: 4,
            bbch_start: 20,
            bbch_end: 29,
            is_applicable: true,
            start_date: '2025-04-20T00:00:00Z',
            end_date: null
        },
        {
            id: 'stage-5',
            name: 'Вегетативный рост',
            type: 'vegetative',
            description: 'Рост и развитие растений',
            status: 'pending',
            status_text: 'Ожидает',
            order: 5,
            bbch_start: 30,
            bbch_end: 49,
            is_applicable: true,
            start_date: null,
            end_date: null
        },
        {
            id: 'stage-6',
            name: 'Цветение',
            type: 'flowering',
            description: 'Формирование цветочных кистей',
            status: 'pending',
            status_text: 'Ожидает',
            order: 6,
            bbch_start: 50,
            bbch_end: 69,
            is_applicable: true,
            start_date: null,
            end_date: null
        },
        {
            id: 'stage-7',
            name: 'Плодоношение',
            type: 'fruiting',
            description: 'Формирование и созревание плодов',
            status: 'pending',
            status_text: 'Ожидает',
            order: 7,
            bbch_start: 70,
            bbch_end: 89,
            is_applicable: true,
            start_date: null,
            end_date: null
        },
        {
            id: 'stage-8',
            name: 'Сбор урожая',
            type: 'harvest',
            description: 'Сбор плодов',
            status: 'pending',
            status_text: 'Ожидает',
            order: 8,
            bbch_start: 90,
            bbch_end: 99,
            is_applicable: true,
            start_date: null,
            end_date: null
        }
    ],
    current_stage: {
        id: 'stage-4',
        name: 'Высадка в грунт',
        type: 'planting',
        description: 'Высадка рассады на постоянное место',
        status: 'in_progress',
        status_text: 'В процессе',
        order: 4,
        bbch_start: 20,
        bbch_end: 29,
        is_applicable: true,
        start_date: '2025-04-20T00:00:00Z',
        end_date: null
    },
    assigned_to: 'user-1',
    assigned_name: 'Иван Иванов',
    created_at: '2025-02-15T10:00:00Z',
    started_at: '2025-03-01T00:00:00Z',
    completed_at: null,
    seedlingInfo: {
        isSeedling: true,
        sowingDate: '2025-03-01T00:00:00Z',
        expectedPlantingDate: '2025-04-20T00:00:00Z',
        optimalAgeMin: 45,
        optimalAgeMax: 55,
        seedlingHeight: 20,
        leafCount: 6,
        hardeningDays: 7,
        hardeningStartDate: '2025-04-13T00:00:00Z',
        hardeningEndDate: '2025-04-19T00:00:00Z',
        containerType: 'Кассета',
        containerSize: '40 ячеек',
        notes: 'Требуется хорошее освещение для предотвращения вытягивания. Рекомендуется досвечивание фитолампами 14-16 часов в сутки.',
        recommendedStages: [
            {
                bbchCode: 'BBCH-19',
                name: '9 и более листьев',
                description: 'Рассада сформировала 6-8 настоящих листьев, высота 15-20 см'
            }
        ]
    }
};

const mockPhenology: CurrentPhenologyResponse = {
    plan_id: 'plan-tomato-1',
    plan_name: 'Томаты ранние 2025',
    variety_id: 'var-tomato-1',
    variety_name: 'Бычье сердце',
    accumulated_gdd: 450,
    required_gdd_for_next: 600,
    current_phase_code: 'BBCH-20',
    current_phase_name: 'Высадка',
    progress_percent: 75,
    estimated_days_to_next_phase: 5,
    estimated_harvest_date: '2025-07-15',
    deviation_days: 0,
    deviation_reason: '',
    is_critical: false,
    recommended_actions: [
        {
            title: 'Полив после высадки',
            description: 'Обильный полив для лучшей приживаемости',
            priority: 'high',
            due_days: 0
        },
        {
            title: 'Притенение',
            description: 'Притенить растения на 3-5 дней',
            priority: 'medium',
            due_days: 0
        }
    ],
    available_stages: mockCropPlan.stages
};

const mockStatistics: PlanStatisticsResponse = {
    plan_id: 'plan-tomato-1',
    plan_name: 'Томаты ранние 2025',
    variety_name: 'Бычье сердце',
    status: 'active',
    progress: 45,
    completed_stages: 3,
    total_stages: 8,
    pending_stages: 4,
    in_progress_stages: 1,
    skipped_stages: 0,
    days_since_planting: 0,
    days_remaining: 85,
    days_to_harvest: 85,
    expected_yield: 2000,
    actual_yield: 0,
    yield_efficiency: 0,
    total_tasks: 24,
    completed_tasks: 11,
    pending_tasks: 13,
    overdue_tasks: 0,
    avg_task_completion_days: 2.5,
    deviation_days: 0,
    recommendations: [
        'Контролировать влажность почвы после высадки',
        'Провести профилактическую обработку от фитофторы'
    ]
};

const mockTasks: TaskDTO[] = [
    {
        id: 'task-1',
        plan_id: 'plan-tomato-1',
        bed_id: 'greenhouse-1',
        type: 'irrigation',
        type_text: 'Полив',
        status: 'pending',
        status_text: 'Ожидает',
        priority: 'high',
        priority_text: 'Высокий',
        priority_color: '#FF9800',
        title: 'Полив после высадки',
        description: 'Обильный полив для лучшей приживаемости рассады',
        instructions: 'Поливать под корень, 0.5-1 литр на растение',
        scheduled_date: '2025-04-20T08:00:00Z',
        due_date: '2025-04-20T18:00:00Z',
        is_overdue: false,
        estimated_duration: 60,
        actual_duration: 0,
        latitude: 55.7558,
        longitude: 37.6173,
        photos: [],
        comments: [],
        completed_at: null,
        completed_by: null
    },
    {
        id: 'task-2',
        plan_id: 'plan-tomato-1',
        bed_id: 'greenhouse-1',
        type: 'protection',
        type_text: 'Защита',
        status: 'pending',
        status_text: 'Ожидает',
        priority: 'medium',
        priority_text: 'Средний',
        priority_color: '#2196F3',
        title: 'Профилактическая обработка',
        description: 'Обработка от фитофторы и других болезней',
        instructions: 'Опрыскать растения препаратом "Ридомил Голд"',
        scheduled_date: '2025-04-25T10:00:00Z',
        due_date: '2025-04-27T18:00:00Z',
        is_overdue: false,
        estimated_duration: 45,
        actual_duration: 0,
        latitude: 55.7558,
        longitude: 37.6173,
        photos: [],
        comments: [],
        completed_at: null,
        completed_by: null
    }
];

// ==================== COMPONENT ====================

const CropPlanDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
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

    // Цвета для статусов
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cropPlan.status)}`}>
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

            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Seedling Block (если рассадный метод) */}
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
                                                        Текущая фаза: {phenology.current_phase_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {phenology.current_phase_code} • {phenology.progress_percent}% к следующей фазе
                                                    </p>
                                                </div>
                                            </div>

                                            {/* GDD Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Накопленная GDD</span>
                                                    <span>{phenology.accumulated_gdd} / {phenology.required_gdd_for_next} °C·дн</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full transition-all"
                                                        style={{ width: `${phenology.progress_percent}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Recommended Actions */}
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Рекомендуемые действия:</p>
                                                {phenology.recommended_actions.map((action, idx) => {
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