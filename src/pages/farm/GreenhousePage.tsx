import {useState} from "react";
import {
    Activity,
    Calendar,
    Delete,
    Droplets,
    FileText,
    MapPin,
    Ruler,
    Sprout,
    Sun,
    Thermometer,
    Wrench
} from "lucide-react";
import {SvgSchemeEditor} from "@/components/svg/SvgSchemeEditor.tsx";
import {useDeleteObject, useUpdateObject} from "@/features/farm/mutations";
import {useObjectPage} from "@/features/farm/hooks";
import Loading from "@/components/shared/Loading.tsx";
import Error from "@/components/shared/Error.tsx";
import {statusLib} from "@/utils/status.ts";
import {Element} from "@/components/svg/SvgSchemeEditor"
import {Greenhouse} from "@/entities";
import {Button} from "@/components/common/Button.tsx";
import {useNavigate} from "react-router-dom";
import {formatArea} from "@/utils/geometry.ts";
import PlantingRecordModal, {PlantingRecord} from "@/features/planting/ui/PlantingRecordModal.tsx";
import {mockVarieties} from "@/data/mockVarieties.ts";
import CropPlanDetailsPage from "@/pages/planning/CropPlanDetailsPage.tsx";
// import SowingModal from "@/features/planting/ui/SowingModal.tsx";

const GreenhousePage = () => {
    const {object, isLoading, error} = useObjectPage<Greenhouse>();
    const [activeTab, setActiveTab] = useState('info');
    const [editSchema, setEditSchema] = useState(false);
    const {mutate: updateObject} = useUpdateObject()
    const {mutate: deleteObject} = useDeleteObject()
    const navigate = useNavigate();
    // Состояние модалки посева
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBed, setSelectedBed] = useState<{
        id: string,
        name: string,
        type: 'bed' | 'field',
        area: number,
    }>();

    if (isLoading) return (<Loading text="Загрузка теплицы..."/>);
    if (error || !object) return (<Error text="Теплица не найдена"/>);

    const tabs = [
        {id: 'info', label: 'Информация', icon: <FileText className="w-4 h-4"/>},
        {id: 'climate', label: 'Климат', icon: <Thermometer className="w-4 h-4"/>},
        {id: 'crops', label: 'Культуры', icon: <Sprout className="w-4 h-4"/>},
        {id: 'tasks', label: 'Задачи', icon: <Calendar className="w-4 h-4"/>},
    ];

    const handleSaveRecord = (record: PlantingRecord) => {
        console.log('Сохраненная запись:', record);
        // Здесь отправка в API или сохранение в store
    };

    const handleSaveSvg = (elements: any[]) => {
        updateObject({
            id: object.id,
            data: {schema: elements,},
        });
    };
    const handleDelete = () => {
        deleteObject({id: object.id},
            {
                onSuccess: () => navigate(`/farm`),
            });
    };
    let schema: Element[] = [];
    if (object.attributes.metadata?.schema != null) {
        schema = object.attributes.metadata?.schema
    }

    let svgWidth = Math.max(object.attributes.width, object.attributes.length);
    let svgHeight = Math.min(object.attributes.width, object.attributes.length);

    return (
        <div className="relative h-screen w-full overflow-auto bg-gray-50 dark:bg-gray-900">
            {/* Схема на весь экран */}
            <div className="inset-0">
                <SvgSchemeEditor
                    width={svgWidth}
                    height={svgHeight}
                    type={object.type}
                    initialElements={schema}
                    onSave={handleSaveSvg}
                    readonly={!editSchema}
                    onBedClick={(element) => {
                        const el = object.attributes.metadata?.schema.find((elem: Element) => elem.id === element.id)
                        console.log(el)
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

            {/* Нижняя панель с табами */}
            <div className="bottom-0 left-0 right-0 z-10">
                <div
                    className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-xl">
                    <div className="w-full mx-auto px-4 py-4">
                        {/* Заголовок и статус */}
                        <div
                            className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {object.name}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-1">
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


                            <div className="flex items-center gap-3">


                                <Button variant='danger' onClick={handleDelete} disabled>
                                    <Delete className="w-4 h-4"/>Удалить</Button>
                                <Button variant='primary' onClick={() => setEditSchema(!editSchema)}>
                                    <Wrench className="w-4 h-4"/>Изменить схему</Button>
                                <Button variant='primary' disabled>
                                    <Wrench className="w-4 h-4"/>Скопировать с сезона</Button>

                            </div>
                        </div>

                        {/* Табы */}
                        <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-hide">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm font-medium
                                        ${activeTab === tab.id
                                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }
                                    `}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Контент табов */}
                        <div className="space-y-4 max-h-[40vh] overflow-y-auto">
                            {activeTab === 'info' && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                            <Thermometer className="w-4 h-4"/>
                                            Температура
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {object.currentTemperature || '—'}°C
                                        </p>
                                    </div>

                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div
                                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Activity className="w-4 h-4"/>
                                            Контроль климата
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {object.temperatureControlled ? 'Да' : 'Нет'}
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
                                                {object.currentTemperature || '22'}°C
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                            <div
                                                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                                <Droplets className="w-4 h-4"/>
                                                Влажность
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                65%
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

                            {activeTab === 'crops' && (
                                <CropPlanDetailsPage/>
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
            </div>
            {/* Модальное окно */}

            {
                selectedBed && <PlantingRecordModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveRecord}
                    object={selectedBed}
                    availableCrops={[]}
                    availableVarieties={mockVarieties}
                />
            }

        </div>
    );
};

export default GreenhousePage;