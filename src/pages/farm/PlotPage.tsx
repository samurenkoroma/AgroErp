// src/pages/farm/PlotPage.tsx
import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Delete,
    Droplets,
    FileText,
    Flower2,
    Layers,
    MapPin,
    Package, Play,
    Plus,
    Ruler,
    Save,
    Sprout,
    Wrench
} from 'lucide-react';
import {Element, SvgSchemeEditor} from "@/components/svg/SvgSchemeEditor";
import Loading from "@/components/shared/Loading";
import Error from "@/components/shared/Error";
import {statusLib} from "@/utils/status";
import {ProductionUnitType} from "@/entities/spatial";
import {Button} from "@/components/common/Button";
import {formatArea} from "@/utils/geometry";
import {getCropIcon} from "@/utils/cropIcons";
import {useProductionUnit} from "@/features/spatial/production-unit/queries.ts";

// ==================== MOCK DATA FOR CROP PLANS ====================

interface CropPlan {
    id: string;
    name: string;
    crop_name: string;
    variety_name: string;
    bed_name: string;
    bed_id: string;
    status: 'active' | 'completed' | 'planned' | 'draft';
    status_text: string;
    planting_date: string;
    expected_harvest_date: string;
    expected_yield: number;
    actual_yield: number;
    progress: number;
    area: number;
    area_unit: 'ha' | 'm2';
    is_seedling: boolean;
    seedling_status?: 'sowing' | 'growing' | 'ready' | 'planted' | 'overdue';
    created_at: string;
    updated_at: string;
    assigned_to: string;
    assigned_name: string;
    tasks_completed: number;
    tasks_total: number;
    notes?: string;
}

const mockPlans: CropPlan[] = [
    {
        id: 'plan-plot-1',
        name: 'Томаты на участке 2025',
        crop_name: 'Томат',
        variety_name: 'Бычье сердце',
        bed_name: 'Грядка 1',
        bed_id: 'bed-1',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2025-04-20',
        expected_harvest_date: '2025-07-20',
        expected_yield: 120,
        actual_yield: 0,
        progress: 25,
        area: 0.0025,
        area_unit: 'ha',
        is_seedling: true,
        seedling_status: 'growing',
        created_at: '2025-03-15T10:00:00Z',
        updated_at: '2025-04-20T08:00:00Z',
        assigned_to: 'user-1',
        assigned_name: 'Иван Иванов',
        tasks_completed: 3,
        tasks_total: 12,
        notes: 'Рассада крепкая'
    },
    {
        id: 'plan-plot-2',
        name: 'Огурцы 2025',
        crop_name: 'Огурец',
        variety_name: 'Герман F1',
        bed_name: 'Грядка 2',
        bed_id: 'bed-2',
        status: 'active',
        status_text: 'Активный',
        planting_date: '2025-05-01',
        expected_harvest_date: '2025-07-15',
        expected_yield: 80,
        actual_yield: 0,
        progress: 15,
        area: 0.002,
        area_unit: 'ha',
        is_seedling: true,
        seedling_status: 'sowing',
        created_at: '2025-04-01T10:00:00Z',
        updated_at: '2025-05-01T09:00:00Z',
        assigned_to: 'user-1',
        assigned_name: 'Иван Иванов',
        tasks_completed: 1,
        tasks_total: 10,
        notes: 'Семена замочены'
    },
    {
        id: 'plan-plot-3',
        name: 'Перец сладкий 2025',
        crop_name: 'Перец сладкий',
        variety_name: 'Калифорнийское чудо',
        bed_name: 'Грядка 3',
        bed_id: 'bed-3',
        status: 'planned',
        status_text: 'Запланирован',
        planting_date: '2025-05-25',
        expected_harvest_date: '2025-08-25',
        expected_yield: 60,
        actual_yield: 0,
        progress: 0,
        area: 0.002,
        area_unit: 'ha',
        is_seedling: true,
        seedling_status: 'sowing',
        created_at: '2025-04-15T10:00:00Z',
        updated_at: '2025-04-15T10:00:00Z',
        assigned_to: 'user-2',
        assigned_name: 'Петр Петров',
        tasks_completed: 0,
        tasks_total: 8,
        notes: 'План в разработке'
    }
];

// ==================== CROP PLAN CARD COMPONENT ====================

const CropPlanCard = ({ plan, onClick }: { plan: CropPlan; onClick: () => void }) => {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Активен', icon: <Play className="w-3 h-3" /> };
            case 'completed':
                return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Завершен', icon: <CheckCircle className="w-3 h-3" /> };
            case 'planned':
                return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Запланирован', icon: <Calendar className="w-3 h-3" /> };
            default:
                return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', label: 'Черновик', icon: <Clock className="w-3 h-3" /> };
        }
    };

    const getSeedlingBadge = (status?: string) => {
        if (!status) return null;
        const config: Record<string, { label: string; icon: JSX.Element }> = {
            sowing: { label: 'Посев', icon: <Sprout className="w-3 h-3" /> },
            growing: { label: 'Растет', icon: <Flower2 className="w-3 h-3" /> },
            ready: { label: 'Готова', icon: <CheckCircle className="w-3 h-3" /> },
            planted: { label: 'Высажена', icon: <MapPin className="w-3 h-3" /> },
            overdue: { label: 'Переросла', icon: <AlertCircle className="w-3 h-3" /> }
        };
        const style = config[status];
        if (!style) return null;
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                {style.icon}
                {style.label}
            </span>
        );
    };

    const statusBadge = getStatusBadge(plan.status);
    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress >= 25) return 'bg-yellow-500';
        return 'bg-gray-500';
    };

    const formatAreaDisplay = (area: number, unit: string) => {
        if (unit === 'ha') {
            if (area < 0.01) return `${(area * 10000).toFixed(0)} м²`;
            return `${area.toFixed(2)} га`;
        }
        return `${area.toFixed(0)} м²`;
    };

    return (
        <div
            onClick={onClick}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCropIcon(plan.crop_name)}</span>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{plan.crop_name}</h3>
                        <p className="text-xs text-gray-500">{plan.variety_name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {plan.is_seedling && getSeedlingBadge(plan.seedling_status)}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.icon}
                        {statusBadge.label}
                    </span>
                </div>
            </div>

            <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Прогресс</span>
                    <span className="font-medium">{plan.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${getProgressColor(plan.progress)}`}
                        style={{ width: `${plan.progress}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(plan.planting_date).toLocaleDateString('ru')}
                </span>
                <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {formatAreaDisplay(plan.area, plan.area_unit)}
                </span>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

const PlotPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Используем хуки для работы с ProductionUnit
    const { data: object, isLoading, error } = useProductionUnit(id!);
    // const { mutate: updateUnit } = useUpdateProductionUnit();
    // const { mutate: deleteUnit } = useDeleteProductionUnit();

    const [activeTab, setActiveTab] = useState('crops');
    const [editSchema, setEditSchema] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Состояние модалки посева
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBed, setSelectedBed] = useState<{
        id: string;
        name: string;
        type: 'bed' | 'field';
        area: number;
    }>();

    // Используем мок-данные для планов
    const [plans, setPlans] = useState<CropPlan[]>(mockPlans);

    if (isLoading) return <Loading text="Загрузка участка..." />;
    if (error || !object) return <Error text="Участок не найден" />;

    // Получаем схему из metadata
    const schema = object.properties.schema as Element[] || [];

    // Получаем размеры из capacity
    const areaM2 = object.properties.capacity?.areaM2 || 0;
    const plantCapacity = object.properties.capacity?.plantCapacity || 0;
    const waterVolume = object.properties.capacity?.waterVolumeLiters || 0;

    // Расчет SVG размеров
    const svgWidth = object.properties.dimensions?.width || 800;
    const svgHeight = object.properties.dimensions?.height || 600;

    const tabs = [
        { id: 'info', label: 'Информация', icon: <FileText className="w-4 h-4" /> },
        { id: 'crops', label: 'Посевы', icon: <Sprout className="w-4 h-4" /> },
        { id: 'tasks', label: 'Задачи', icon: <Calendar className="w-4 h-4" /> },
    ];

    const handleSaveSvg = (elements: any[]) => {
        // updateUnit({
        //     id: object.id,
        //     data: {
        //         properties: {
        //             ...object.properties,
        //             metadata: {
        //                 ...object.properties.metadata,
        //                 schema: elements
        //             }
        //         }
        //     }
        // });
        setEditSchema(false);
    };

    const handleDelete = () => {
        // deleteUnit(object.id, {
        //     onSuccess: () => navigate('/farm'),
        // });
    };

    const handleNavigateToPlan = (planId: string) => {
        navigate(`/plan/${planId}`);
    };

    const handleAddPlan = () => {
        setIsModalOpen(true);
    };



    const getTypeName = (type: ProductionUnitType) => {
        switch (type) {
            case 'PLOT': return 'Участок';
            case 'FIELD': return 'Поле';
            case 'GREENHOUSE': return 'Теплица';
            case 'CONTAINER': return 'Контейнер';
            default: return 'Объект';
        }
    };

    return (
        <div className="relative h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Левая колонка - SVG схема (2/3 ширины) */}
            <div
                className={`h-full transition-all duration-300 ${isSidebarOpen ? 'right-[33.333%]' : 'right-0'} absolute inset-0`}
            >
                <div className="h-full w-full overflow-auto p-4">
                    <div className="p-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {object.name}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                        {getTypeName(object.type)}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusLib.getColor(object.status)}`}>
                                        {statusLib.getText(object.status)}
                                    </span>
                                    {object.code && (
                                        <span className="text-xs text-gray-400 font-mono">{object.code}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg flex flex-col">
                        <div className="flex-1 overflow-auto p-4">
                            <SvgSchemeEditor
                                width={svgWidth}
                                height={svgHeight}
                                type="plot"
                                initialElements={schema}
                                onSave={handleSaveSvg}
                                readonly={!editSchema}
                                onBedClick={(element) => {
                                    const el = schema.find((elem: Element) => elem.id === element.id);
                                    if (el) {
                                        const area = (el.width * el.height) / 10000;
                                        setSelectedBed({
                                            id: el.id,
                                            name: el.label,
                                            area: area,
                                            type: el.type,
                                        });
                                        setIsModalOpen(true);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Кнопки действий */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex flex-row gap-2">
                        <Button variant="primary" onClick={() => setEditSchema(!editSchema)} fullWidth>
                            <Wrench className="w-4 h-4" />
                            {editSchema ? 'Завершить редактирование' : 'Изменить схему'}
                        </Button>
                        {editSchema && (
                            <Button variant="success" onClick={() => handleSaveSvg(schema)} fullWidth>
                                <Save className="w-4 h-4" />
                                Сохранить схему
                            </Button>
                        )}
                        <Button variant="danger" onClick={handleDelete} fullWidth>
                            <Delete className="w-4 h-4" />
                            Удалить
                        </Button>
                    </div>
                </div>
            </div>

            {/* Правая боковая панель (1/3 ширины) */}
            <div
                className={`absolute right-0 top-0 h-full transition-all duration-300 ${isSidebarOpen ? 'w-1/3' : 'w-0'}`}
            >
                <div className="h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col">
                    {/* Кнопка закрытия/открытия панели */}
                    <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-l-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Табы */}
                    <div className="flex border-b border-gray-200 dark:border-gray-800">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all
                                    ${activeTab === tab.id
                                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }
                                `}
                            >
                                {tab.icon}
                                <span className="hidden lg:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Контент табов */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {activeTab === 'info' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Ruler className="w-4 h-4" />
                                            Площадь
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatArea(areaM2 / 10000)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Sprout className="w-4 h-4" />
                                            Посадочных мест
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {plantCapacity}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Droplets className="w-4 h-4" />
                                            Объем воды
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {waterVolume} л
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Layers className="w-4 h-4" />
                                            Грядок
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {schema.length}
                                        </p>
                                    </div>
                                </div>

                                {/* Возможности (Capabilities) */}
                                {object.properties.capabilities && object.properties.capabilities.length > 0 && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            Возможности
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {object.properties.capabilities.map((cap) => (
                                                <span key={cap} className="text-xs px-2 py-1 bg-white dark:bg-gray-700 rounded-full">
                                                    {cap === 'SOIL' && '🪴 Грунт'}
                                                    {cap === 'IRRIGATION' && '💧 Полив'}
                                                    {cap === 'HYDROPONIC' && '💧 Гидропоника'}
                                                    {cap === 'AEROPONIC' && '💨 Аэропоника'}
                                                    {cap === 'LIGHTING' && '💡 Досветка'}
                                                    {cap === 'CLIMATE_CONTROL' && '🌡️ Климат-контроль'}
                                                    {cap === 'SENSOR_SUPPORT' && '📡 Датчики'}
                                                    {cap === 'AUTOMATION' && '🤖 Автоматизация'}
                                                    {cap}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'crops' && (
                            <div className="space-y-3">
                                {/* Кнопка добавления посева */}
                                <button
                                    onClick={handleAddPlan}
                                    className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-purple-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Добавить посев
                                </button>

                                {/* Список посевов */}
                                <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                                    {plans.map((plan) => (
                                        <CropPlanCard
                                            key={plan.id}
                                            plan={plan}
                                            onClick={() => handleNavigateToPlan(plan.id)}
                                        />
                                    ))}
                                </div>

                                {plans.length === 0 && (
                                    <div className="text-center py-12">
                                        <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">Нет посевов</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Нажмите "Добавить посев" чтобы создать план
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center text-gray-500 dark:text-gray-400">
                                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Список задач появится здесь</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlotPage;