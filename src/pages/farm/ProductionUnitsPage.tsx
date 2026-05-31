import {useMemo, useState} from 'react';
import {Container, Download, Droplets, Factory, Home, Map as MapIcon, MapPin, Package, Sprout} from 'lucide-react';
import {ProductionUnit, RootUnits} from "@/entities/spatial";
import {CreateProductionUnitModal} from "@/features/spatial/production-unit/components/CreateProductionUnitModal.tsx";
import {useCreateProductionUnit} from "@/features/spatial/production-unit/mutations.ts";
import {useProductionUnits} from "@/features/spatial/production-unit/queries.ts";
import Loading from "@/components/shared/Loading.tsx";
import Error from "@/components/shared/Error.tsx";
import {CreateProductionUnitRequest} from "@/entities/spatial/production-unit/dto.ts";
import {usePageActions} from "@/hooks/usePageActions.ts";
import {FieldsTab} from "@/features/spatial/production-unit/components/FieldsTab.tsx";
import {GreenhousesTab} from "@/features/spatial/production-unit/components/GreenhousesTab.tsx";
import {ContainersTab} from "@/features/spatial/production-unit/components/ContainersTab.tsx";
import {HydroTab} from "@/features/spatial/production-unit/components/HydroTab.tsx";
import {PlotsTab} from "@/features/spatial/production-unit/components/PlotsTab.tsx";


type TabType = 'fields' | 'greenhouses' | 'containers' | 'hydroponic' | 'plots';

const ProductionUnitsPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('greenhouses');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedParentForCreate, setSelectedParentForCreate] = useState<ProductionUnit | null>(null);
    const {mutate: createUnit} = useCreateProductionUnit();
    const {data, isLoading, error} = useProductionUnits();
    const [unitType, setUnitType] = useState<RootUnits | null>(null)

    // Мемоизируем действия - они не будут меняться при каждом рендере
    const pageActions = useMemo(() => [
        {
            id: 'add-field',
            label: 'Добавить поле',
            icon: <MapPin className="w-5 h-5"/>,
            onClick: () => {
                setUnitType('FIELD');
                setIsCreateModalOpen(true);
            },
            color: 'bg-green-500'
        },
        {
            id: 'add-plot',
            label: 'Добавить участок',
            icon: <Sprout className="w-5 h-5"/>,
            onClick: () => {
                setUnitType('PLOT');
                setSelectedParentForCreate(null);
                setIsCreateModalOpen(true);
            },
            color: 'bg-blue-500'
        },
        {
            id: 'add-greenhouse',
            label: 'Добавить теплицу',
            icon: <Sprout className="w-5 h-5"/>,
            onClick: () => {
                setUnitType('GREENHOUSE');
                setSelectedParentForCreate(null);
                setIsCreateModalOpen(true);
            },
            color: 'bg-blue-500'
        },
        {
            id: 'add-container',
            label: 'Добавить контейнер',
            icon: <Package className="w-5 h-5"/>,
            onClick: () => {
                setUnitType('CONTAINER');
                setIsCreateModalOpen(true);
            },
            color: 'bg-purple-500'
        },
        {
            id: 'export-data',
            label: 'Экспорт данных',
            icon: <Download className="w-5 h-5"/>,
            onClick: () => console.log('Экспорт данных'),
            color: 'bg-amber-500'
        }
    ], []); // Пустой массив зависимостей!

    usePageActions({actions: pageActions});

    const tabs = [
        {id: 'fields', label: 'Поля', icon: MapIcon, count: data?.fields.length},
        {id: 'plots', label: 'Участки', icon: Home, count: data?.plots.length},
        {id: 'greenhouses', label: 'Теплицы', icon: Factory, count: data?.greenhouses.length},
        {id: 'containers', label: 'Контейнеры', icon: Container, count: data?.containers.length},
        {id: 'hydroponic', label: 'Гидропоника', icon: Droplets, count: data?.hydroponic.length},
    ] as const;

    const handleAddChild = (parentUnit: ProductionUnit) => {
        setSelectedParentForCreate(parentUnit);
        setIsCreateModalOpen(true);
    };

    const handleCreateUnit = (newUnit: CreateProductionUnitRequest) => {
        setIsCreateModalOpen(false);
        setSelectedParentForCreate(null);
        createUnit(newUnit);
    };


    if (isLoading) return (<Loading text="Загрузка теплицы..."/>);
    if (error) return (<Error text="Объекты не найдены"/>);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="w-full mx-auto px-3 py-2">
                {/* Tabs */}
                <div
                    className="flex gap-1 mb-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                }}
                                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
                  ${isActive
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }
                `}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {tab.count}
                </span>
                            </button>
                        );
                    })}
                </div>

                {activeTab == 'fields' && (<FieldsTab units={data?.fields!} onAddChild={handleAddChild}/>)}
                {activeTab == 'plots' && (
                    <PlotsTab units={data?.plots!} handleAddChild={handleAddChild}
                              handleCreateUnit={() => {
                                  setUnitType('PLOT');
                                  setIsCreateModalOpen(true);
                              }}/>
                )}
                {activeTab == 'greenhouses' && (
                    <GreenhousesTab units={data?.greenhouses!} onAddChild={handleAddChild}/>)}
                {activeTab == 'containers' && (
                    <ContainersTab units={data?.containers!} onAddChild={handleAddChild} handleCreateUnit={() => {
                        setUnitType('CONTAINER');
                        setIsCreateModalOpen(true);
                    }}/>
                )}
                {activeTab == 'hydroponic' && (<HydroTab units={data?.hydroponic!} onAddChild={handleAddChild}/>)}
            </div>
            {/* Модалка создания */}
            {isCreateModalOpen && (<CreateProductionUnitModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setSelectedParentForCreate(null);
                }}
                onSuccess={handleCreateUnit}
                parentUnit={selectedParentForCreate}
                unitType={unitType}
            />)}
        </div>
    );
};

export default ProductionUnitsPage;