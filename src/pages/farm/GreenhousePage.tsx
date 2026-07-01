// src/pages/farm/GreenhousePage.tsx
import {useState} from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Droplets,
    Factory,
    FileText,
    Layers,
    Plus,
    Ruler,
    Sprout,
    Sun,
    Thermometer,
    Wrench
} from 'lucide-react';
import {SvgSchemeEditor} from "@/components/svg/SvgSchemeEditor";
import Loading from "@/components/shared/Loading";
import Error from "@/components/shared/Error";
import {Button} from "@/components/common/Button";
import {useParams} from "react-router-dom";
import {formatArea} from "@/utils/geometry";
import {useProductionUnit} from "@/features/spatial/production-unit/queries.ts";
import {StartCycleModal, useCycles} from "@/features/production/growing_cycle";
import {getBgColor} from "@/utils";
import {useConfigureProductionUnit} from "@/features/spatial/production-unit/mutations.ts";
import {Element, ProductionUnit} from "@/entities/spatial";

const GreenhousePage = () => {
    const {id} = useParams<{ id: string }>();

    // Используем хуки для ProductionUnit
    const {data: object, isLoading, error, refetch} = useProductionUnit(id!);

    const [activeTab, setActiveTab] = useState('crops');
    const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<ProductionUnit | null>(null);

    const [editSchema, setEditSchema] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const {mutate: configureUnit} = useConfigureProductionUnit()
    const {data: plans} = useCycles();



    if (isLoading) return <Loading text="Загрузка теплицы..."/>;
    if (error || !object) return <Error text="Теплица не найдена"/>;

    const tabs = [
        {id: 'info', label: 'Информация', icon: <FileText className="w-4 h-4"/>},
        {id: 'climate', label: 'Климат', icon: <Thermometer className="w-4 h-4"/>},
        {id: 'crops', label: 'Посевы', icon: <Sprout className="w-4 h-4"/>},
        {id: 'tasks', label: 'Задачи', icon: <Calendar className="w-4 h-4"/>},
    ];

    // Получаем схему из metadata
    const schema = object.schema || [];
    const areaM2 = object.properties?.capacity?.areaM2 || 0;
    const plantCapacity = object.properties?.capacity?.plantCapacity || 0;
    const waterVolume = object.properties?.capacity?.waterVolumeLiters || 0;


    const getTypeName = (type: string) => {
        switch (type) {
            case 'GREENHOUSE':
                return 'Теплица';
            case 'GREENHOUSE_ZONE':
                return 'Зона теплицы';
            default:
                return type;
        }
    };

    const getStatusText = (status: string) => {
        const map: Record<string, string> = {
            active: 'Активен',
            maintenance: 'Обслуживание',
            planned: 'Планируется'
        };
        return map[status] || status;
    };
    let svgWidth = Math.max(object.properties.dimensions!.width!, object.properties.dimensions!.length!);
    let svgHeight = Math.min(object.properties.dimensions!.width!, object.properties.dimensions!.length!);

    if (isLoading) return (<Loading text="Загрузка теплицы..."/>);
    return (
        <div className="relative h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Левая колонка - SVG схема (2/3 ширины) */}
            <div
                className={`h-full transition-all duration-300 ${isSidebarOpen ? 'right-[33.333%]' : 'right-0'} absolute inset-0`}
            >
                <div className="h-full w-full overflow-auto p-4">
                    <div className="p-2 border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <Factory className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {object.code}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {getTypeName(object.type)}
                  </span>
                                    {object.code && (
                                        <span className="text-xs text-gray-400 font-mono">{object.code}</span>
                                    )}
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${getBgColor("status", object.status)}`}
                                    >
                    {getStatusText(object.status)}
                  </span>
                                </div>
                            </div>
                            {/* Кнопки действий */}
                            <div className="border-t border-gray-200 dark:border-gray-800 flex flex-row gap-2">
                                <Button variant="primary" onClick={() => setEditSchema(!editSchema)} fullWidth>
                                    <Wrench className="w-4 h-4"/>
                                    {editSchema ? 'Отменить редактирование' : 'Изменить схему'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg flex flex-col">
                        <div className="flex-1 overflow-auto p-4">
                            <SvgSchemeEditor
                                width={svgWidth}
                                height={svgHeight}
                                type="greenhouse"
                                initialElements={schema}
                                onSave={(elements: Element[]) => {
                                    configureUnit({
                                        id: object?.id,
                                        schema: {beds: elements.filter(e => e.type == 'bed')}
                                    })
                                    setEditSchema(false)
                                }}
                                onCancel ={() => {}}
                                readonly={!editSchema}
                                onBedClick={(element) => {
                                    setSelectedUnit({
                                        ...element
                                    })

                                    if (element.status == 'empty') {
                                        setIsCycleModalOpen(true)
                                    }
                                    else {
                                    console.log("Модалка информация о посадке")
                                    }
                                    refetch()
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Правая боковая панель (1/3 ширины) */}
            <div
                className={`absolute right-0 top-0 h-full transition-all duration-300 ${isSidebarOpen ? 'w-1/3' : 'w-0'}`}
            >
                <div
                    className="h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col">
                    {/* Кнопка закрытия/открытия панели */}
                    <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-l-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isSidebarOpen ? <ChevronRight className="w-4 h-4"/> : <ChevronLeft className="w-4 h-4"/>}
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
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
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
                                        <div
                                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Ruler className="w-4 h-4"/>
                                            Площадь
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatArea(areaM2 / 10000)}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div
                                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Sprout className="w-4 h-4"/>
                                            Посадочных мест
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {plantCapacity}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div
                                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Droplets className="w-4 h-4"/>
                                            Объем воды
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {waterVolume} л
                                        </p>
                                    </div>

                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div
                                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Layers className="w-4 h-4"/>
                                            Грядок
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {schema.length}
                                        </p>
                                    </div>
                                </div>

                                {/* Возможности (Capabilities) */}
                                {object.properties?.capabilities && object.properties.capabilities.length > 0 && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            Возможности
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {object.properties.capabilities.map((cap) => (
                                                <span key={cap}
                                                      className="text-xs px-2 py-1 bg-white dark:bg-gray-700 rounded-full">
                          {cap === 'SOIL' && '🪴 Грунт'}
                                                    {cap === 'IRRIGATION' && '💧 Полив'}
                                                    {cap === 'FERTIGATION' && '🧪 Фертигация'}
                                                    {cap === 'DRAINAGE' && '🚰 Дренаж'}
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

                        {activeTab === 'climate' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div
                                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Thermometer className="w-4 h-4"/>
                                            Текущая температура
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {object.properties?.metadata?.temperature || '22'}°C
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div
                                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Droplets className="w-4 h-4"/>
                                            Влажность
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {object.properties?.metadata?.humidity || '65'}%
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                                    <Sun className="w-8 h-8 text-blue-500 mx-auto mb-2"/>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Оптимальные условия: 20-25°C, влажность 60-70%
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'crops' && plans && (
                            <div className="space-y-3">
                                {/* Кнопка добавления посева */}
                                <button
                                    onClick={()=> {}}
                                    className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-green-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4"/>
                                    Добавить посев
                                </button>

                                {/* Список посевов */}
                                <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                                    {plans.map((plan) => (
                                        <div>{plan.cropName}</div>
                                        // <CropPlanCard
                                        //     key={plan.id}
                                        //     plan={plan}
                                        //     onClick={() => handleNavigateToPlan(plan.id)}
                                        // />
                                    ))}
                                </div>

                                {plans.length === 0 && (
                                    <div className="text-center py-12">
                                        <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
                                        <p className="text-gray-500">Нет посевов</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Нажмите "Добавить посев" чтобы создать план
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div
                                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center text-gray-500 dark:text-gray-400">
                                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                                <p>Список задач появится здесь</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isCycleModalOpen && object && (<StartCycleModal
                unit={selectedUnit}
                isOpen={isCycleModalOpen}
                onClose={() => setIsCycleModalOpen(false)}
            />)}
        </div>
    );
};

export default GreenhousePage;





