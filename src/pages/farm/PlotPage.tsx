import {useState} from "react";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Delete,
    FileText,
    MapPin,
    Plus,
    Ruler,
    Save,
    Sprout,
    Wrench
} from "lucide-react";
import Loading from "@/components/shared/Loading.tsx";
import Error from "@/components/shared/Error.tsx";
import {useObjectPage} from "@/features/farm/hooks";
import {useDeleteObject, useUpdateObject} from "@/features/farm/mutations";
import {Element, SvgSchemeEditor} from "@/components/svg/SvgSchemeEditor.tsx";
import {statusLib} from "@/utils/status.ts";
import {formatArea} from "@/utils/geometry.ts";
import {Button} from "@/components/common/Button.tsx";
import {Plot} from "@/entities/object";
import {useNavigate} from "react-router-dom";
import {CreateCropPlanModal} from "@/features/crop-planning/components/CreateCropPlanModal.tsx";
import CropPlanCard from "@/features/crop-planning/components/CropPlanCard.tsx";
import {useCrops} from "@/features/catalog/queries/useCrop.ts";
import {useCropPlans} from "@/features/crop-planning/hooks/useCropPlans.ts";

const PlotPage = () => {
    const {object, isLoading, error} = useObjectPage<Plot>();
    const [activeTab, setActiveTab] = useState('crops'); // Меняем на 'crops' по умолчанию
    const [editSchema, setEditSchema] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const {mutate: updateObject} = useUpdateObject()
    const {mutate: deleteObject} = useDeleteObject()
    const navigate = useNavigate();
    const {data: crops} = useCrops();
    const {data: plans} = useCropPlans();
    // Состояние модалки посева
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBed, setSelectedBed] = useState<{
        id: string,
        name: string,
        type: 'bed' | 'field',
        area: number,
    }>();

    if (isLoading) return (<Loading text="Загрузка участка..."/>);
    if (error || !object) return (<Error text="Участок не найдена"/>);

    const tabs = [
        {id: 'info', label: 'Информация', icon: <FileText className="w-4 h-4"/>},
        {id: 'crops', label: 'Посевы', icon: <Sprout className="w-4 h-4"/>},
        {id: 'tasks', label: 'Задачи', icon: <Calendar className="w-4 h-4"/>},
    ];


    const handleSaveSvg = (elements: any[]) => {
        updateObject({
            id: object.id,
            data: {schema: elements},
        });
        setEditSchema(false);
    };

    const handleDelete = () => {
        deleteObject({id: object.id},
            {
                onSuccess: () => navigate(`/farm`),
            });
    };

    const handleNavigateToPlan = (planId: string) => {
        navigate(`/growing/${planId}`);
    };

    let schema: Element[] = [];
    if (object.attributes.metadata?.schema != null) {
        schema = object.attributes.metadata?.schema
    }

    let svgWidth = Math.max(object.attributes.width, object.attributes.length);
    let svgHeight = Math.min(object.attributes.width, object.attributes.length);

    return (
        <div className="relative h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">

            {/* Левая колонка - SVG схема (2/3 ширины) */}
            <div
                className={`h-full transition-all duration-300 ${isSidebarOpen ? 'right-[33.333%]' : 'right-0'} absolute inset-0`}>
                <div className="h-full w-full overflow-auto p-4">
                    <div className="p-2 border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {object.name}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                        Теплица
                                    </span>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${statusLib.getColor(object.status)}`}>
                                        {statusLib.getText(object.status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg flex flex-col">
                        <div className="flex-1 overflow-auto p-4">
                            <SvgSchemeEditor
                                width={svgWidth}
                                height={svgHeight}
                                type={object.type}
                                initialElements={schema}
                                onSave={handleSaveSvg}
                                readonly={!editSchema}
                                onBedClick={(element) => {
                                    const el = object.attributes.metadata?.schema.find((elem: Element) => elem.id === element.id)
                                    const area = +(el.width.toFixed(1) * el.height.toFixed(1)).toFixed(2) / 10000
                                    setSelectedBed({
                                        id: el.id,
                                        name: el.label,
                                        area: area,
                                        type: el.type
                                    })
                                    setIsModalOpen(true);
                                }}
                            />
                        </div>
                    </div>
                    {/* Кнопки действий */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-row gap-2">
                        <Button variant='primary' onClick={() => setEditSchema(!editSchema)} fullWidth>
                            <Wrench className="w-4 h-4"/>
                            {editSchema ? 'Завершить редактирование' : 'Изменить схему'}
                        </Button>
                        {editSchema && (
                            <Button variant='success' onClick={() => handleSaveSvg(schema)} fullWidth>
                                <Save className="w-4 h-4"/>
                                Сохранить схему
                            </Button>
                        )}
                        <Button variant='danger' onClick={handleDelete} disabled fullWidth>
                            <Delete className="w-4 h-4"/>
                            Удалить
                        </Button>
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
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <div
                                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                        <Ruler className="w-4 h-4"/>
                                        Площадь
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatArea(object.area)}
                                    </p>
                                </div>


                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <div
                                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                        <Sprout className="w-4 h-4"/>
                                        Грядок
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {object.beds?.length || 0}
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'crops' && plans && (
                            <div className="space-y-3">
                                {/* Кнопка добавления посева */}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-green-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4"/>
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


            <CreateCropPlanModal
                objectId={object.id}
                preSelectedLocationId={selectedBed?.id}
                onSuccess={() => console.log("success")} onClose={() => {
                setSelectedBed(undefined)
                setIsModalOpen(false)
            }}
                crops={crops}
                isOpen={isModalOpen}></CreateCropPlanModal>
        </div>
    );
};

export default PlotPage;