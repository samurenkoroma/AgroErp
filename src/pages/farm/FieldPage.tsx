import {FarmMap} from "@/features/farm";
import {useState} from "react";
import {Calendar, Delete, Droplets, FileText, MapPin, Ruler, Sprout, Thermometer} from "lucide-react";
import Loading from "@/components/shared/Loading.tsx";
import Error from "@/components/shared/Error.tsx";
import {useObjectPage} from "@/features/farm/hooks";
import {statusLib} from "@/utils/status.ts";
import {formatArea} from "@/utils/geometry.ts";
import {useDeleteObject} from "@/features/farm/mutations";
import {Button} from "@/components/common/Button.tsx";
import {useNavigate} from "react-router-dom";
import {PlantingRecord} from "@/entities/planning/types.ts";
import {Field} from "@/entities/object/model.ts";

const FieldPage = () => {
    const {object, isLoading, error} = useObjectPage<Field>();
    const [activeTab, setActiveTab] = useState('info');
    // const {mutate: updateObject} = useUpdateObject()
    const {mutate: deleteObject} = useDeleteObject()
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) return (<Loading text="Загрузка теплицы..."/>);
    if (error || !object) return (<Error text="Теплица не найдена"/>);

    const tabs = [
        {id: 'info', label: 'Информация', icon: <FileText className="w-4 h-4"/>},
        {id: 'crops', label: 'Культуры', icon: <Sprout className="w-4 h-4"/>},
        {id: 'climate', label: 'Климат', icon: <Thermometer className="w-4 h-4"/>},
        {id: 'tasks', label: 'Задачи', icon: <Calendar className="w-4 h-4"/>},
        {id: 'docs', label: 'Документы', icon: <FileText className="w-4 h-4"/>},
    ];

    const handleSaveRecord = (record: PlantingRecord) => {
        console.log('Сохраненная запись:', record);
        // Здесь отправка в API или сохранение в store
    };
    const handleDelete = () => {
        deleteObject({id: object.id},
            {
                onSuccess: () => navigate(`/farm`),
            });
    };
    return (
        <div className="relative h-screen w-full overflow-auto bg-gray-50 dark:bg-gray-900">
            {/* Карта на весь экран */}
            <div className="inset-0">
                <FarmMap objects={[object]} onObjectClick={()=> setIsModalOpen(true)}/>
            </div>

            {/* Нижняя панель с табами */}
            <div className=" bottom-0 left-0 right-0 z-10">
                {/* Основной контент панели */}
                <div
                    className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-xl">
                    <div className="w-full mx-auto px-4 py-4">
                        {/* Заголовок и статус */}
                        <div
                            className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400"/>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {object.name}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span
                                            className="text-sm text-gray-500 dark:text-gray-400 capitalize">Поле</span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${statusLib.getColor(object.status)}`}>
                                            {statusLib.getText(object.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button variant='danger' onClick={handleDelete}><Delete
                                    className="w-4 h-4"/>Удалить</Button>
                                <Button variant='primary' onClick={() => setIsModalOpen(true)}><Sprout
                                    className="w-4 h-4"/>Добавить посев</Button>
                                {/*<Button variant='primary'><Wrench className="w-4 h-4"/>Действия</Button>*/}
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
                                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 shadow-sm'
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

                                    {'currentCrop' in object && (
                                        <>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <div
                                                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                                    <Sprout className="w-4 h-4"/>
                                                    Текущая культура
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {object.currentCrop?.name || '—'}
                                                </p>
                                            </div>

                                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <div
                                                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                                    <Calendar className="w-4 h-4"/>
                                                    Дата посева
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {object.sowingDate ? new Date(object.sowingDate).toLocaleDateString('ru') : '—'}
                                                </p>
                                            </div>
                                        </>
                                    )}


                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div
                                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                                            <Droplets className="w-4 h-4"/>
                                            Почва
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {'soilType' in object
                                                ? (object.soilType === 'chernozem' ? 'Чернозем' :
                                                    object.soilType === 'loam' ? 'Суглинок' :
                                                        object.soilType === 'sand' ? 'Песок' :
                                                            object.soilType === 'clay' ? 'Глина' : 'Другое')
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'crops' && (
                                <div
                                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center text-gray-500 dark:text-gray-400">
                                    <Sprout className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                                    <p>Информация о культурах будет доступна в ближайшее время</p>
                                </div>
                            )}

                            {activeTab === 'climate' && (
                                <div
                                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center text-gray-500 dark:text-gray-400">
                                    <Thermometer className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                                    <p>Климатические данные в разработке</p>
                                </div>
                            )}

                            {activeTab === 'tasks' && (
                                <div
                                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                                    <p>Список задач появится здесь</p>
                                </div>
                            )}

                            {activeTab === 'docs' && (
                                <div
                                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center text-gray-500 dark:text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                                    <p>Документация будет добавлена позже</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FieldPage;