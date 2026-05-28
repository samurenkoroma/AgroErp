// src/pages/farm/ProductionUnitsPage.tsx
import {useEffect, useRef, useState} from 'react';
import {
    Box,
    ChevronDown,
    ChevronRight,
    Container,
    Droplets,
    Factory,
    Map as MapIcon,
    MapPin,
    Search,
    Shield,
    X
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// ==================== TYPES ====================

type ProductionUnitType =
    | 'FIELD' | 'BLOCK' | 'BED' | 'ROW'
    | 'GREENHOUSE' | 'GREENHOUSE_ZONE'
    | 'CONTAINER' | 'POT' | 'TRAY'
    | 'NFT_CHANNEL' | 'DWC_TANK' | 'AEROPONIC_CHAMBER'
    | 'RACK' | 'SHELF' | 'VERTICAL_TOWER'
    | 'SLOT' | 'RESERVOIR' | 'STORAGE';

type Capability =
    | 'SOIL' | 'IRRIGATION' | 'FERTIGATION' | 'DRAINAGE'
    | 'HYDROPONIC' | 'AEROPONIC' | 'NUTRIENT_CONTROL'
    | 'LIGHTING' | 'CLIMATE_CONTROL'
    | 'SENSOR_SUPPORT' | 'AUTOMATION'
    | 'SLOT_BASED' | 'MOBILE';

interface Geometry {
    type: 'Point' | 'Polygon' | 'MultiPolygon';
    coordinates: number[] | number[][][];
    area?: number;
    areaUnit?: 'ha' | 'm2';
}

interface ProductionUnit {
    id: string;
    farmId: string;
    parentId?: string;
    type: ProductionUnitType;
    name: string;
    code?: string;
    geometry?: Geometry;
    capabilities: Capability[];
    climateZoneId?: string;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    children?: ProductionUnit[];
}

// ==================== MOCK DATA ====================

const mockProductionUnits: ProductionUnit[] = [
    // Поля
    {
        id: 'field-1',
        farmId: 'farm-1',
        type: 'FIELD',
        name: 'Поле Северное',
        code: 'F-01',
        geometry: {
            type: 'Polygon',
            coordinates: [[[30.2, 45.8], [30.3, 45.8], [30.3, 45.7], [30.2, 45.7], [30.2, 45.8]]],
            area: 50,
            areaUnit: 'ha'
        },
        capabilities: ['SOIL', 'IRRIGATION', 'SENSOR_SUPPORT'],
        metadata: {
            color: '#22c55e',
            icon: '🌾',
            soilType: 'Чернозем',
            description: 'Основное поле для зерновых культур',
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'field-2',
        farmId: 'farm-1',
        type: 'FIELD',
        name: 'Поле Восточное',
        code: 'F-02',
        geometry: {
            type: 'Polygon',
            coordinates: [[[30.4, 45.8], [30.55, 45.8], [30.55, 45.65], [30.4, 45.65], [30.4, 45.8]]],
            area: 75,
            areaUnit: 'ha'
        },
        capabilities: ['SOIL', 'IRRIGATION', 'FERTIGATION', 'SENSOR_SUPPORT'],
        metadata: {
            color: '#22c55e',
            icon: '🌾',
            soilType: 'Суглинок',
            description: 'Поле с системой капельного полива',
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'field-3',
        farmId: 'farm-1',
        type: 'FIELD',
        name: 'Поле Южное',
        code: 'F-03',
        geometry: {
            type: 'Polygon',
            coordinates: [[[30.25, 45.72], [30.35, 45.72], [30.35, 45.68], [30.25, 45.68], [30.25, 45.72]]],
            area: 33,
            areaUnit: 'ha'
        },
        capabilities: ['SOIL', 'IRRIGATION'],
        metadata: {
            color: '#22c55e',
            icon: '🌾',
            soilType: 'Песчаный',
            description: 'Поле в стадии восстановления',
            status: 'maintenance'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },

    // Теплица с иерархией
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

    // Теплица 2
    {
        id: 'greenhouse-2',
        farmId: 'farm-1',
        type: 'GREENHOUSE',
        name: 'Теплица №2',
        code: 'GH-02',
        geometry: {
            type: 'Point',
            coordinates: [30.4, 45.73],
            area: 800,
            areaUnit: 'm2'
        },
        capabilities: ['HYDROPONIC', 'CLIMATE_CONTROL', 'LIGHTING', 'SENSOR_SUPPORT', 'AUTOMATION'],
        metadata: {
            color: '#3b82f6',
            icon: '🌱',
            temperatureControlled: true,
            description: 'Теплица для выращивания томатов',
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'greenhouse-zone-3',
        farmId: 'farm-1',
        parentId: 'greenhouse-2',
        type: 'GREENHOUSE_ZONE',
        name: 'Зона A',
        code: 'GH-02-A',
        capabilities: ['HYDROPONIC', 'LIGHTING', 'SENSOR_SUPPORT'],
        metadata: {
            color: '#3b82f6',
            icon: '🌿',
            description: 'Основная зона',
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'bed-4',
        farmId: 'farm-1',
        parentId: 'greenhouse-zone-3',
        type: 'BED',
        name: 'Грядка 1',
        code: 'GH-02-A-01',
        capabilities: ['HYDROPONIC'],
        metadata: {
            color: '#3b82f6',
            icon: '📦',
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },

    // Контейнер с иерархией
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
        id: 'slot-1',
        farmId: 'farm-1',
        parentId: 'rack-1',
        type: 'SLOT',
        name: 'Слот 1',
        code: 'CF-01-R01-S01',
        capabilities: ['AEROPONIC'],
        metadata: {
            color: '#8b5cf6',
            icon: '🔲',
            level: 1,
            status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'slot-2',
        farmId: 'farm-1',
        parentId: 'rack-1',
        type: 'SLOT',
        name: 'Слот 2',
        code: 'CF-01-R01-S02',
        capabilities: ['AEROPONIC'],
        metadata: {
            color: '#8b5cf6',
            icon: '🔲',
            level: 2,
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

// ==================== UTILITIES ====================

const getUnitIcon = (type: ProductionUnitType): string => {
    const icons: Record<ProductionUnitType, string> = {
        FIELD: '🌾',
        BLOCK: '📐',
        BED: '📦',
        ROW: '📏',
        GREENHOUSE: '🌱',
        GREENHOUSE_ZONE: '🌿',
        CONTAINER: '📦',
        POT: '🍯',
        TRAY: '📎',
        NFT_CHANNEL: '💧',
        DWC_TANK: '🛢️',
        AEROPONIC_CHAMBER: '💨',
        RACK: '🗄️',
        SHELF: '📚',
        VERTICAL_TOWER: '🏗️',
        SLOT: '🔲',
        RESERVOIR: '💧',
        STORAGE: '🏚️'
    };
    return icons[type] || '📍';
};

const getUnitTypeName = (type: ProductionUnitType): string => {
    const names: Record<ProductionUnitType, string> = {
        FIELD: 'Поле',
        BLOCK: 'Блок',
        BED: 'Грядка',
        ROW: 'Ряд',
        GREENHOUSE: 'Теплица',
        GREENHOUSE_ZONE: 'Зона теплицы',
        CONTAINER: 'Контейнер',
        POT: 'Горшок',
        TRAY: 'Лоток',
        NFT_CHANNEL: 'NFT Канал',
        DWC_TANK: 'DWC Резервуар',
        AEROPONIC_CHAMBER: 'Аэропоника',
        RACK: 'Стеллаж',
        SHELF: 'Полка',
        VERTICAL_TOWER: 'Вертикальная башня',
        SLOT: 'Слот',
        RESERVOIR: 'Резервуар',
        STORAGE: 'Хранилище'
    };
    return names[type] || type;
};

const getCapabilityIcon = (capability: Capability): string => {
    const icons: Record<Capability, string> = {
        SOIL: '🪴',
        IRRIGATION: '💧',
        FERTIGATION: '🧪',
        DRAINAGE: '🚰',
        HYDROPONIC: '💧',
        AEROPONIC: '💨',
        NUTRIENT_CONTROL: '⚗️',
        LIGHTING: '💡',
        CLIMATE_CONTROL: '🌡️',
        SENSOR_SUPPORT: '📡',
        AUTOMATION: '🤖',
        SLOT_BASED: '🔲',
        MOBILE: '🚚'
    };
    return icons[capability] || '🔧';
};

const getCapabilityName = (capability: Capability): string => {
    const names: Record<Capability, string> = {
        SOIL: 'Грунт',
        IRRIGATION: 'Полив',
        FERTIGATION: 'Фертигация',
        DRAINAGE: 'Дренаж',
        HYDROPONIC: 'Гидропоника',
        AEROPONIC: 'Аэропоника',
        NUTRIENT_CONTROL: 'Контроль питания',
        LIGHTING: 'Досветка',
        CLIMATE_CONTROL: 'Климат-контроль',
        SENSOR_SUPPORT: 'Датчики',
        AUTOMATION: 'Автоматизация',
        SLOT_BASED: 'Слотовая система',
        MOBILE: 'Мобильный'
    };
    return names[capability] || capability;
};

// ==================== BUILD TREE FUNCTION ====================

const buildUnitTree = (units: ProductionUnit[]): ProductionUnit[] => {
    // Создаем карту для быстрого доступа
    const unitMap = new Map<string, ProductionUnit>();
    const roots: ProductionUnit[] = [];

    // Сначала добавляем все объекты в карту с пустыми children
    units.forEach(unit => {
        unitMap.set(unit.id, {
            ...unit,
            children: []
        });
    });

    // Затем распределяем по родителям
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

// ==================== MAP COMPONENT ====================

const FieldsMap = ({ fields, onSelectField }: { fields: ProductionUnit[]; onSelectField: (field: ProductionUnit) => void }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        const token = import.meta.env.VITE_MAPBOX_TOKEN;
        if (!token) {
            console.error('Mapbox token is required');
            return;
        }

        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: [30.33, 45.73],
            zoom: 11,
            attributionControl: false,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');

        map.current.on('load', () => {
            setMapLoaded(true);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!map.current || !mapLoaded || !fields.length) return;

        if (map.current.getLayer('fields-fill')) {
            map.current.removeLayer('fields-fill');
            map.current.removeLayer('fields-outline');
            map.current.removeSource('fields');
        }

        const features: any[] = [];

        fields.forEach(field => {
            if (field.geometry?.type === 'Polygon' && field.geometry.coordinates) {
                features.push({
                    type: 'Feature',
                    id: field.id,
                    properties: {
                        id: field.id,
                        name: field.name,
                        type: field.type,
                        area: field.geometry.area,
                        status: field.metadata?.status
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: field.geometry.coordinates
                    }
                });
            }
        });

        if (features.length === 0) return;

        map.current.addSource('fields', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: features
            }
        });

        map.current.addLayer({
            id: 'fields-fill',
            type: 'fill',
            source: 'fields',
            paint: {
                'fill-color': [
                    'match',
                    ['get', 'status'],
                    'maintenance', '#f59e0b',
                    '#22c55e'
                ],
                'fill-opacity': 0.4
            }
        });

        map.current.addLayer({
            id: 'fields-outline',
            type: 'line',
            source: 'fields',
            paint: {
                'line-color': '#16a34a',
                'line-width': 2
            }
        });

        map.current.on('click', 'fields-fill', (e) => {
            if (e.features?.length) {
                const fieldId = e.features[0].properties?.id;
                const field = fields.find(f => f.id === fieldId);
                if (field) onSelectField(field);
            }
        });

        map.current.on('mouseenter', 'fields-fill', () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'fields-fill', () => {
            if (map.current) map.current.getCanvas().style.cursor = '';
        });

        try {
            const bounds = new mapboxgl.LngLatBounds();
            features.forEach((feature) => {
                feature.geometry.coordinates[0].forEach((coord: number[]) => {
                    bounds.extend(coord as [number, number]);
                });
            });
            map.current.fitBounds(bounds, { padding: 50, duration: 1000 });
        } catch (e) {
            console.error('Error centering map:', e);
        }
    }, [fields, mapLoaded, onSelectField]);

    return (
        <div className="relative w-full h-full min-h-[calc(100vh-200px)]">
            <div ref={mapContainer} className="absolute inset-0 rounded-xl overflow-hidden" style={{ background: '#1a1a2e' }} />
        </div>
    );
};

// ==================== TREE NODE COMPONENT ====================

const UnitTreeNode = ({ unit, level = 0, onSelectUnit, selectedId }: {
    unit: ProductionUnit;
    level?: number;
    onSelectUnit: (unit: ProductionUnit) => void;
    selectedId?: string;
}) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = unit.children && unit.children.length > 0;
    const isSelected = selectedId === unit.id;

    const getStatusBadge = () => {
        if (unit.metadata?.status === 'active') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (unit.metadata?.status === 'maintenance') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    const handleSelect = () => {
        onSelectUnit(unit);
    };

    return (
        <div className="space-y-1">
            <div
                className={`
          group rounded-lg border transition-all cursor-pointer
          ${isSelected ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500' : 'border-gray-200 dark:border-gray-700 hover:border-green-300'}
          ${level > 0 ? 'ml-6' : ''}
        `}
                onClick={handleSelect}
            >
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        {hasChildren && (
                            <button
                                onClick={handleToggleExpand}
                                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded focus:outline-none"
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

// ==================== DETAIL PANEL ====================

const UnitDetailPanel = ({ unit, onClose }: {
    unit: ProductionUnit;
    onClose: () => void;
}) => {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{getUnitIcon(unit.type)}</span>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{unit.name}</h2>
                          ф  {unit.code && <p className="text-sm text-gray-500 font-mono">{unit.code}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
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

// ==================== MAIN COMPONENT ====================

type TabType = 'fields' | 'greenhouses' | 'containers' | 'hydroponic';

// ==================== MAIN COMPONENT - УПРОЩЕННЫЙ ====================

const ProductionUnitsPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('fields');
    const [selectedUnit, setSelectedUnit] = useState<ProductionUnit | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Данные
    const fields = mockProductionUnits.filter(u => u.type === 'FIELD');
    const greenhouses = mockProductionUnits.filter(u => u.type === 'GREENHOUSE' || u.type === 'GREENHOUSE_ZONE');
    const containers = mockProductionUnits.filter(u => u.type === 'CONTAINER');
    const hydroponic = mockProductionUnits.filter(u =>
        u.capabilities.includes('HYDROPONIC') || u.capabilities.includes('AEROPONIC')
    );

    // Строим деревья ОДИН РАЗ и сохраняем в state
    const [greenhouseTree, setGreenhouseTree] = useState<ProductionUnit[]>([]);
    const [containerTree, setContainerTree] = useState<ProductionUnit[]>([]);
    const [hydroponicTree, setHydroponicTree] = useState<ProductionUnit[]>([]);

    // Строим деревья при монтировании и при изменении данных
    useEffect(() => {
        setGreenhouseTree(buildUnitTree(greenhouses));
        setContainerTree(buildUnitTree(containers));
        setHydroponicTree(buildUnitTree(hydroponic));
    }, []);

    const tabs = [
        { id: 'fields', label: 'Поля', icon: MapIcon, count: fields.length },
        { id: 'greenhouses', label: 'Теплицы', icon: Factory, count: greenhouses.length },
        { id: 'containers', label: 'Контейнеры', icon: Container, count: containers.length },
        { id: 'hydroponic', label: 'Гидропоника', icon: Droplets, count: hydroponic.length },
    ] as const;

    const isFieldsTab = activeTab === 'fields';

    const getCurrentTree = (): ProductionUnit[] => {
        switch (activeTab) {
            case 'greenhouses': return greenhouseTree;
            case 'containers': return containerTree;
            case 'hydroponic': return hydroponicTree;
            default: return [];
        }
    };

    // Рекурсивная фильтрация дерева для поиска
    const filterTreeBySearch = (nodes: ProductionUnit[], term: string): ProductionUnit[] => {
        if (!term) return nodes;

        return nodes.reduce((acc: ProductionUnit[], node) => {
            const filteredChildren = node.children ? filterTreeBySearch(node.children, term) : [];
            const matchesNode = node.name.toLowerCase().includes(term.toLowerCase()) ||
                (node.code && node.code.toLowerCase().includes(term.toLowerCase()));

            if (matchesNode || filteredChildren.length > 0) {
                acc.push({
                    ...node,
                    children: filteredChildren
                });
            }
            return acc;
        }, []);
    };

    const filteredTree = filterTreeBySearch(getCurrentTree(), searchTerm);

    const handleSelectUnit = (unit: ProductionUnit) => {
        setSelectedUnit(unit);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

            <div className="w-full mx-auto px-0 py-1">
                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white dark:bg-gray-900  border border-gray-200 dark:border-gray-800 p-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSelectedUnit(null);
                                    setSearchTerm('');
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

                {isFieldsTab ? (
                    <div className="flex gap-6">
                        <div className="flex-1">
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-semibold text-gray-900 dark:text-white">Карта полей</h2>
                                        <span className="text-xs text-gray-500">{fields.length} полей</span>
                                    </div>
                                </div>
                                <FieldsMap fields={fields} onSelectField={handleSelectUnit} />
                            </div>
                        </div>

                        <div className="w-96 shrink-0">
                            {selectedUnit ? (
                                <UnitDetailPanel
                                    unit={selectedUnit}
                                    onClose={() => setSelectedUnit(null)}
                                />
                            ) : (
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center sticky top-6">
                                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                        Выберите поле
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        Нажмите на поле на карте
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={`Поиск ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                                    <div className="space-y-1">
                                        {filteredTree.length > 0 ? (
                                            filteredTree.map((unit) => (
                                                <UnitTreeNode
                                                    key={unit.id}
                                                    unit={unit}
                                                    onSelectUnit={handleSelectUnit}
                                                    selectedId={selectedUnit?.id}
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>Ничего не найдено</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            {selectedUnit ? (
                                <UnitDetailPanel
                                    unit={selectedUnit}
                                    onClose={() => setSelectedUnit(null)}
                                />
                            ) : (
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center sticky top-6">
                                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                        Выберите объект
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        Нажмите на объект в списке
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductionUnitsPage;