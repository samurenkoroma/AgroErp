// src/pages/farm/ProductionUnitsPage.tsx
// Обновляем компоненты для отображения иерархии

// ==================== TYPES ====================
// ... (типы остаются те же)

// ==================== MOCK DATA ====================
// Добавляем дочерние элементы для теплиц
const mockProductionUnits: ProductionUnit[] = [
    // ... существующие поля ...

    // Теплица с зонами и грядками
    {
        id: 'greenhouse-1',
        farmId: 'farm-1',
        type: 'GREENHOUSE',
        name: 'Теплица №1',
        code: 'GH-01',
        geometry: {
            type: 'Point',
            coordinates: [30.35, 45.75],
            area: 500,
            areaUnit: 'm2'
        },
        capabilities: ['HYDROPONIC', 'CLIMATE_CONTROL', 'LIGHTING', 'SENSOR_SUPPORT', 'AUTOMATION'],
        metadata: {
            color: '#3b82f6',
            icon: '🌱',
            temperatureControlled: true,
            description: 'Современная теплица с автоматическим климат-контролем',
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'greenhouse-zone-1',
        farmId: 'farm-1',
        parentId: 'greenhouse-1',
        type: 'GREENHOUSE_ZONE',
        name: 'Зона A (томаты)',
        code: 'GH-01-A',
        capabilities: ['HYDROPONIC', 'LIGHTING', 'SENSOR_SUPPORT'],
        metadata: {
            color: '#3b82f6',
            icon: '🌿',
            description: 'Зона для выращивания томатов',
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'greenhouse-zone-2',
        farmId: 'farm-1',
        parentId: 'greenhouse-1',
        type: 'GREENHOUSE_ZONE',
        name: 'Зона B (огурцы)',
        code: 'GH-01-B',
        capabilities: ['HYDROPONIC', 'LIGHTING', 'SENSOR_SUPPORT'],
        metadata: {
            color: '#3b82f6',
            icon: '🌿',
            description: 'Зона для выращивания огурцов',
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'bed-1',
        farmId: 'farm-1',
        parentId: 'greenhouse-zone-1',
        type: 'BED',
        name: 'Грядка 1',
        code: 'GH-01-A-01',
        capabilities: ['HYDROPONIC'],
        metadata: {
            color: '#3b82f6',
            icon: '📦',
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'bed-2',
        farmId: 'farm-1',
        parentId: 'greenhouse-zone-1',
        type: 'BED',
        name: 'Грядка 2',
        code: 'GH-01-A-02',
        capabilities: ['HYDROPONIC'],
        metadata: {
            color: '#3b82f6',
            icon: '📦',
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'bed-3',
        farmId: 'farm-1',
        parentId: 'greenhouse-zone-2',
        type: 'BED',
        name: 'Грядка 1',
        code: 'GH-01-B-01',
        capabilities: ['HYDROPONIC'],
        metadata: {
            color: '#3b82f6',
            icon: '📦',
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },

    // Контейнер со стеллажами и слотами
    {
        id: 'container-1',
        farmId: 'farm-1',
        type: 'CONTAINER',
        name: 'Контейнерная ферма A',
        code: 'CF-01',
        geometry: {
            type: 'Point',
            coordinates: [30.3, 45.73],
            area: 50,
            areaUnit: 'm2'
        },
        capabilities: ['AEROPONIC', 'CLIMATE_CONTROL', 'LIGHTING', 'AUTOMATION', 'SENSOR_SUPPORT'],
        metadata: {
            color: '#8b5cf6',
            icon: '📦',
            description: 'Вертикальная ферма в контейнере',
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'rack-1',
        farmId: 'farm-1',
        parentId: 'container-1',
        type: 'RACK',
        name: 'Стеллаж №1',
        code: 'CF-01-R01',
        capabilities: ['AEROPONIC', 'LIGHTING', 'SLOT_BASED'],
        metadata: {
            color: '#8b5cf6',
            icon: '🗄️',
            levels: 4,
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'rack-2',
        farmId: 'farm-1',
        parentId: 'container-1',
        type: 'RACK',
        name: 'Стеллаж №2',
        code: 'CF-01-R02',
        capabilities: ['AEROPONIC', 'LIGHTING', 'SLOT_BASED'],
        metadata: {
            color: '#8b5cf6',
            icon: '🗄️',
            levels: 4,
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    }
];

// ==================== BUILD TREE FUNCTION ====================

const buildUnitTree = (units: ProductionUnit[]): ProductionUnit[] => {
    const unitMap = new Map<string, ProductionUnit>();
    const roots: ProductionUnit[] = [];

    units.forEach(unit => {
        unitMap.set(unit.id, { ...unit, children: [] });
    });

    units.forEach(unit => {
        const node = unitMap.get(unit.id)!;
        if (unit.parentId && unitMap.has(unit.parentId)) {
            const parent = unitMap.get(unit.parentId)!;
            if (!parent.children) parent.children = [];
            parent.children.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
};

// ==================== HIERARCHICAL TREE COMPONENT ====================

const UnitTreeNode = ({ unit, level = 0, onSelectUnit, selectedId }: {
    unit: ProductionUnit;
    level?: number;
    onSelectUnit: (unit: ProductionUnit) => void;
    selectedId?: string;
}) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = unit.children && unit.children.length > 0;
    const isSelected = selectedId === unit.id;

    const getStatusBadge = () => {
        if (unit.metadata?.status === 'active') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (unit.metadata?.status === 'maintenance') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    return (
        <div className="space-y-1">
            <div
                className={`
          group rounded-lg border transition-all cursor-pointer
          ${isSelected ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500' : 'border-gray-200 dark:border-gray-700 hover:border-green-300'}
          ${level > 0 ? 'ml-6' : ''}
        `}
                onClick={() => onSelectUnit(unit)}
            >
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        {hasChildren && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            >
                                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                        )}
                        {!hasChildren && <div className="w-5" />}

                        <div className="text-2xl">{getUnitIcon(unit.type)}</div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{unit.name}</h3>
                                {unit.code && <span className="text-xs text-gray-400 font-mono">{unit.code}</span>}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusBadge()}`}>
                  {unit.metadata?.status === 'active' ? 'Активен' : unit.metadata?.status === 'maintenance' ? 'Обслуживание' : 'Планируется'}
                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                <span>{getUnitTypeName(unit.type)}</span>
                                {unit.geometry?.area && (
                                    <span>• {unit.geometry.area} {unit.geometry.areaUnit === 'ha' ? 'га' : 'м²'}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="space-y-1">
                    {unit.children!.map((child) => (
                        <UnitTreeNode
                            key={child.id}
                            unit={child}
                            level={level + 1}
                            onSelectUnit={onSelectUnit}
                            selectedId={selectedId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ==================== HIERARCHICAL VIEW COMPONENT ====================

const HierarchicalUnitList = ({ units, title, icon: Icon, onSelectUnit, selectedId }: {
    units: ProductionUnit[];
    title: string;
    icon: any;
    onSelectUnit: (unit: ProductionUnit) => void;
    selectedId?: string;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const unitTree = useMemo(() => buildUnitTree(units), [units]);

    // Фильтрация дерева по поиску
    const filterTree = (nodes: ProductionUnit[]): ProductionUnit[] => {
        if (!searchTerm) return nodes;

        return nodes
            .map(node => {
                const filteredChildren = node.children ? filterTree(node.children) : [];
                if (
                    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (node.code && node.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    filteredChildren.length > 0
                ) {
                    return { ...node, children: filteredChildren };
                }
                return null;
            })
            .filter(Boolean) as ProductionUnit[];
    };

    const filteredTree = filterTree(unitTree);

    if (units.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                <Icon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Нет {title.toLowerCase()}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder={`Поиск ${title.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                />
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="space-y-1">
                    {filteredTree.map((unit) => (
                        <UnitTreeNode
                            key={unit.id}
                            unit={unit}
                            onSelectUnit={onSelectUnit}
                            selectedId={selectedId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// ==================== DETAIL PANEL WITH CHILDREN ====================

const UnitDetailPanel = ({ unit, allUnits, onClose }: {
    unit: ProductionUnit;
    allUnits: ProductionUnit[];
    onClose: () => void;
}) => {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Получаем дочерние элементы
    const children = allUnits.filter(u => u.parentId === unit.id);

    // Получаем родительский элемент
    const parent = allUnits.find(u => u.id === unit.parentId);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{getUnitIcon(unit.type)}</span>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{unit.name}</h2>
                            {unit.code && <p className="text-sm text-gray-500 font-mono">{unit.code}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Родительский элемент */}
                {parent && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <ArrowUp className="w-4 h-4" />
                            Родительский объект
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{getUnitIcon(parent.type)}</span>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{parent.name}</p>
                                    <p className="text-xs text-gray-500">{getUnitTypeName(parent.type)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Основная информация */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Основная информация</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-500">Тип</span>
                            <p className="font-medium">{getUnitTypeName(unit.type)}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Статус</span>
                            <p className="font-medium">
                                {unit.metadata?.status === 'active' && 'Активен'}
                                {unit.metadata?.status === 'maintenance' && 'Обслуживание'}
                                {!unit.metadata?.status && 'Активен'}
                            </p>
                        </div>
                        {unit.geometry?.area && (
                            <div>
                                <span className="text-gray-500">Площадь</span>
                                <p className="font-medium">{unit.geometry.area} {unit.geometry.areaUnit === 'ha' ? 'га' : 'м²'}</p>
                            </div>
                        )}
                        <div>
                            <span className="text-gray-500">Создан</span>
                            <p className="font-medium">{formatDate(unit.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Возможности */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Возможности
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {unit.capabilities.map((cap) => (
                            <span key={cap} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
                {getCapabilityIcon(cap)}
                                {getCapabilityName(cap)}
              </span>
                        ))}
                    </div>
                </div>

                {/* Дочерние элементы */}
                {children.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Дочерние объекты ({children.length})
                        </h3>
                        <div className="space-y-2">
                            {children.map((child) => (
                                <div key={child.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{getUnitIcon(child.type)}</span>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">{child.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{getUnitTypeName(child.type)}</span>
                                                {child.code && <span>• {child.code}</span>}
                                            </div>
                                        </div>
                                        <button className="text-xs text-green-600 hover:text-green-700">
                                            Подробнее
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {unit.metadata?.description && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Описание</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{unit.metadata.description}</p>
                    </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Редактировать
                    </button>
                    <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                        Добавить дочерний
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== UPDATED MAIN COMPONENT ====================

const ProductionUnitsPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('fields');
    const [selectedUnit, setSelectedUnit] = useState<ProductionUnit | null>(null);

    const fields = mockProductionUnits.filter(u => u.type === 'FIELD');
    const greenhouses = mockProductionUnits.filter(u => u.type === 'GREENHOUSE');
    const containers = mockProductionUnits.filter(u => u.type === 'CONTAINER');
    const hydroponic = mockProductionUnits.filter(u =>
        u.capabilities.includes('HYDROPONIC') || u.capabilities.includes('AEROPONIC')
    );

    const tabs = [
        { id: 'fields', label: 'Поля', icon: MapIcon, count: fields.length },
        { id: 'greenhouses', label: 'Теплицы', icon: Factory, count: greenhouses.length },
        { id: 'containers', label: 'Контейнеры', icon: Container, count: containers.length },
        { id: 'hydroponic', label: 'Гидропоника', icon: Droplets, count: hydroponic.length },
    ] as const;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-green-600" />
                                Производственные объекты
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Управление полями, теплицами и другими объектами
                            </p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <Plus className="w-4 h-4" />
                            Добавить объект
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSelectedUnit(null);
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

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {activeTab === 'fields' && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-semibold text-gray-900 dark:text-white">Карта полей</h2>
                                        <span className="text-xs text-gray-500">{fields.length} полей</span>
                                    </div>
                                </div>
                                <FieldsMap fields={fields} onSelectField={setSelectedUnit} />
                            </div>
                        )}

                        {activeTab === 'greenhouses' && (
                            <HierarchicalUnitList
                                units={greenhouses}
                                title="Теплиц"
                                icon={Factory}
                                onSelectUnit={setSelectedUnit}
                                selectedId={selectedUnit?.id}
                            />
                        )}

                        {activeTab === 'containers' && (
                            <HierarchicalUnitList
                                units={containers}
                                title="Контейнеров"
                                icon={Container}
                                onSelectUnit={setSelectedUnit}
                                selectedId={selectedUnit?.id}
                            />
                        )}

                        {activeTab === 'hydroponic' && (
                            <HierarchicalUnitList
                                units={hydroponic}
                                title="Гидропонных систем"
                                icon={Droplets}
                                onSelectUnit={setSelectedUnit}
                                selectedId={selectedUnit?.id}
                            />
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        {selectedUnit ? (
                            <UnitDetailPanel
                                unit={selectedUnit}
                                allUnits={mockProductionUnits}
                                onClose={() => setSelectedUnit(null)}
                            />
                        ) : (
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                    Выберите объект
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Нажмите на объект в списке или на карте
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};