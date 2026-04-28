import {useState} from "react";
import {Calendar, FileText, Layers, MapPin, Ruler, Sprout, Wrench} from "lucide-react";
import Loading from "@/components/shared/Loading.tsx";
import Error from "@/components/shared/Error.tsx";
import {useObjectPage} from "@/features/farm/hooks";
import {getGardenCrops, Plot} from "@/entities";
import {useUpdateObject} from "@/features/farm/mutations";
import {Element, SvgSchemeEditor} from "@/components/svg/SvgSchemeEditor.tsx";
import {statusLib} from "@/utils/status.ts";
import {formatArea} from "@/utils/geometry.ts";
import {Button} from "@/components/common/Button.tsx";
import PlantingRecordModal from "@/features/planting/ui/PlantingRecordModal.tsx";
import {mockVarieties} from "@/data/mockVarieties.ts";
import {useListSpecies} from "@/features/crops/queries/useListSpecies.ts";
import {PlantingRecord} from "@/entities/planting/model/types.ts";

const PlotPage = () => {
    const {object, isLoading, error} = useObjectPage<Plot>();
    const {data: species} = useListSpecies()
    const [activeTab, setActiveTab] = useState('info');
    const {mutate: updateObject} = useUpdateObject()
    const [editSchema, setEditSchema] = useState(false);
    const [selectedBed, setSelectedBed] = useState<{
        id: string,
        name: string,
        type: 'bed' | 'field',
        area: number,
    }>();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveRecord = (record: PlantingRecord) => {
        console.log('Сохраненная запись:', record);
        // Здесь отправка в API или сохранение в store
    };

    if (isLoading) return (<Loading text="Загрузка теплицы..."/>);
    if (error || !object) return (<Error text="Теплица не найдена"/>);

    const tabs = [
        {id: 'info', label: 'Информация', icon: <FileText className="w-4 h-4"/>},
        {id: 'beds', label: 'Грядки', icon: <Layers className="w-4 h-4"/>},
        {id: 'crops', label: 'Культуры', icon: <Sprout className="w-4 h-4"/>},
        {id: 'tasks', label: 'Задачи', icon: <Calendar className="w-4 h-4"/>},
    ];

    const handleSaveSvg = (elements: any[]) => {
        updateObject({
            id: object.id,
            data: {schema: elements,},
        });
    };
    // Подсчет грядок
    const bedsCount = object.beds?.length || 0;
    const emptyBeds = object.beds?.filter((b: any) => b.status === 'empty').length || 0;
    const sownBeds = object.beds?.filter((b: any) => b.status === 'sown' || b.status === 'growing').length || 0;

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
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                    <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400"/>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {object.name}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                            Участок
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${statusLib.getColor(object.status)}`}>
                                            {statusLib.getText(object.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant='primary' onClick={() => setEditSchema(!editSchema)}>
                                    <Wrench className="w-4 h-4"/>Изменить схему</Button>
                                <button
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
                                    <Wrench className="w-4 h-4"/>
                                    Действия
                                </button>
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
                                        ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 shadow-sm'
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
                                            <Layers className="w-4 h-4"/>
                                            Всего грядок
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {bedsCount}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div
                                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Sprout className="w-4 h-4"/>
                                            Засеяно грядок
                                        </div>
                                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                            {sownBeds}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div
                                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Sprout className="w-4 h-4"/>
                                            Свободно
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {emptyBeds}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'beds' && (
                                <div className="space-y-2">
                                    {object.beds?.length > 0 ? (
                                        object.beds.map((bed: any) => (
                                            <div
                                                key={bed.id}
                                                className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                                        <span className="text-sm">🌱</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            Грядка {bed.number}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {bed.status === 'empty' && 'Свободна'}
                                                            {bed.status === 'sown' && 'Засеяна'}
                                                            {bed.status === 'growing' && 'Растет'}
                                                            {bed.status === 'harvested' && 'Собрана'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {bed.crop && (
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                                            {bed.crop.name}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div
                                            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center text-gray-500">
                                            <Layers className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                                            <p>Нет добавленных грядок</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'crops' && (
                                <div
                                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center text-gray-500 dark:text-gray-400">
                                    <Sprout className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                                    <p>Информация о культурах будет доступна в ближайшее время</p>
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
        </div>
    );
};

export default PlotPage;