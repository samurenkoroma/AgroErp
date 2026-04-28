// src/pages/scada/ScadaDashboard.tsx
import {useCallback, useEffect, useRef, useState} from 'react';
import {
    Activity,
    AlertTriangle,
    Battery,
    BatteryLow,
    BatteryMedium,
    BatteryWarning,
    Check,
    ChevronDown,
    ChevronUp,
    Droplets,
    Factory,
    Gauge,
    Home,
    Leaf,
    MapPin,
    Plus,
    RefreshCw,
    Sun,
    Thermometer
} from 'lucide-react';
import {modbusApi, USE_MOCK} from '@/features/scada/api/modbusApi';
import {AlarmRule, ModbusSensor} from '@/entities/scada/types';
import {mockSensors, startMockWebSocket} from "@/entities/scada/mock-data.ts";

// Типы для группировки
interface GroupedSensor {
    objectId: string;
    objectName: string;
    objectType: 'field' | 'greenhouse' | 'plot';
    sensors: ModbusSensor[];
    status: 'online' | 'offline' | 'warning' | 'critical';
    lastUpdate: string;
}

// Компонент датчика внутри карточки объекта
const SensorItem = ({
                        sensor,
                        onRead
                    }: {
    sensor: ModbusSensor;
    onRead: (id: string) => void;
}) => {
    const getIcon = () => {
        switch (sensor.type) {
            case 'temperature': return <Thermometer className="w-4 h-4" />;
            case 'humidity': return <Droplets className="w-4 h-4" />;
            case 'soil_moisture': return <Droplets className="w-4 h-4" />;
            case 'light': return <Sun className="w-4 h-4" />;
            case 'co2': return <Activity className="w-4 h-4" />;
            case 'ph': return <Activity className="w-4 h-4" />;
            case 'ec': return <Gauge className="w-4 h-4" />;
            default: return <Gauge className="w-4 h-4" />;
        }
    };

    const getValueColor = () => {
        if (sensor.alarm_min && sensor.last_value !== null && Number(sensor.last_value) < sensor.alarm_min) {
            return 'text-red-600 dark:text-red-400';
        }
        if (sensor.alarm_max && sensor.last_value !== null && Number(sensor.last_value) > sensor.alarm_max) {
            return 'text-red-600 dark:text-red-400';
        }
        return 'text-gray-900 dark:text-white';
    };

    const getBgColor = () => {
        if (sensor.alarm_min && sensor.last_value !== null && Number(sensor.last_value) < sensor.alarm_min) {
            return 'bg-red-50 dark:bg-red-900/20';
        }
        if (sensor.alarm_max && sensor.last_value !== null && Number(sensor.last_value) > sensor.alarm_max) {
            return 'bg-red-50 dark:bg-red-900/20';
        }
        return 'bg-gray-50 dark:bg-gray-800';
    };

    const formatValue = () => {
        if (sensor.last_value === undefined || sensor.last_value === null) return '—';
        if (typeof sensor.last_value === 'number') {
            return sensor.last_value.toFixed(1);
        }
        return sensor.last_value;
    };

    const getProgressWidth = () => {
        if (!sensor.last_value || typeof sensor.last_value !== 'number') return 0;
        const min = sensor.min_value || 0;
        const max = sensor.max_value || 100;
        const percent = ((Number(sensor.last_value) - min) / (max - min)) * 100;
        return Math.min(100, Math.max(0, percent));
    };

    return (
        <div
            className={`flex items-center justify-between p-2 rounded-lg ${getBgColor()} transition-all group`}
        >
            <div className="flex items-center gap-2">
                <div className="text-gray-500">
                    {getIcon()}
                </div>
                <div>
                    <p className="text-xs text-gray-500">{sensor.name}</p>
                    <div className="flex items-baseline gap-1">
            <span className={`text-lg font-semibold ${getValueColor()}`}>
              {formatValue()}
            </span>
                        <span className="text-xs text-gray-400">{sensor.unit}</span>
                    </div>
                </div>
            </div>

            {sensor.min_value !== undefined && sensor.max_value !== undefined && typeof sensor.last_value === 'number' && (
                <div className="w-16">
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${getProgressWidth()}%` }}
                        />
                    </div>
                </div>
            )}

            <button
                onClick={(e) => { e.stopPropagation(); onRead(sensor.id); }}
                className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                <RefreshCw className="w-3 h-3 text-gray-400" />
            </button>
        </div>
    );
};

// Компонент карточки объекта
const ObjectCard = ({
                        group,
                        onSensorRead,
                        onSensorSettings,
                        isExpanded,
                        onToggle
                    }: {
    group: GroupedSensor;
    onSensorRead: (sensorId: string) => void;
    onSensorSettings: (sensor: ModbusSensor) => void;
    isExpanded: boolean;
    onToggle: () => void;
}) => {
    const getObjectIcon = () => {
        switch (group.objectType) {
            case 'field': return <Leaf className="w-5 h-5" />;
            case 'greenhouse': return <Factory className="w-5 h-5" />;
            case 'plot': return <Home className="w-5 h-5" />;
            default: return <MapPin className="w-5 h-5" />;
        }
    };

    const getStatusColor = () => {
        switch (group.status) {
            case 'online': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'warning': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getStatusText = () => {
        switch (group.status) {
            case 'online': return 'Все датчики в норме';
            case 'warning': return 'Есть отклонения';
            case 'critical': return 'Критические значения';
            default: return 'Нет данных';
        }
    };

    const getBatteryIcon = () => {
        const activeSensors = group.sensors.filter(s => s.is_active).length;
        const totalSensors = group.sensors.length;
        const ratio = activeSensors / totalSensors;

        if (ratio === 1) return <Battery className="w-4 h-4 text-green-500" />;
        if (ratio >= 0.7) return <BatteryMedium className="w-4 h-4 text-yellow-500" />;
        if (ratio >= 0.3) return <BatteryLow className="w-4 h-4 text-orange-500" />;
        return <BatteryWarning className="w-4 h-4 text-red-500" />;
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all">
            {/* Заголовок карточки объекта */}
            <button
                onClick={onToggle}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getStatusColor()}`}>
                        {getObjectIcon()}
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{group.objectName}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor()}`}>
                {getStatusText()}
              </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                {getBatteryIcon()}
                                <span>{group.sensors.filter(s => s.is_active).length}/{group.sensors.length} датчиков</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {new Date(group.lastUpdate).toLocaleTimeString()}
          </span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
            </button>

            {/* Список датчиков (раскрывается) */}
            {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-2">
                    {group.sensors.map((sensor) => (
                        <SensorItem
                            key={sensor.id}
                            sensor={sensor}
                            onRead={onSensorRead}
                        />
                    ))}

                    {/* Кнопка добавления датчика */}
                    <button
                        onClick={() => onSensorSettings({ ...group.sensors[0], object_id: group.objectId, object_type: group.objectType } as ModbusSensor)}
                        className="w-full mt-3 p-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Добавить датчик
                    </button>
                </div>
            )}
        </div>
    );
};

// Компонент алармов
const AlarmPanel = ({ alarms, onAcknowledge }: { alarms: AlarmRule[]; onAcknowledge: (id: string) => void }) => {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400';
            case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
            default: return 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return <AlertTriangle className="w-4 h-4" />;
            case 'warning': return <AlertTriangle className="w-4 h-4" />;
            default: return <AlertTriangle className="w-4 h-4" />;
        }
    };

    const activeAlarms = alarms.filter(a => a.triggered_at && !a.acknowledged_at);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h2 className="font-semibold text-gray-900 dark:text-white">Активные алармы</h2>
                    {activeAlarms.length > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs">
              {activeAlarms.length}
            </span>
                    )}
                </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-96 overflow-y-auto">
                {activeAlarms.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">Нет активных алармов</p>
                    </div>
                ) : (
                    activeAlarms.map((alarm) => {
                        const sensor = mockSensors.find(s => s.id === alarm.sensor_id);
                        return (
                            <div key={alarm.id} className={`p-3 ${getSeverityColor(alarm.severity)}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            {getSeverityIcon(alarm.severity)}
                                            <p className="text-sm font-medium">{alarm.message}</p>
                                        </div>
                                        {sensor && (
                                            <p className="text-xs opacity-75 mt-1">
                                                Датчик: {sensor.name} ({sensor.object_name || sensor.object_id})
                                            </p>
                                        )}
                                        <p className="text-xs opacity-75 mt-1">
                                            {alarm.triggered_at && new Date(alarm.triggered_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onAcknowledge(alarm.id)}
                                        className="px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
                                    >
                                        Подтвердить
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// Главный компонент
const ScadaDashboard = () => {
    const [sensors, setSensors] = useState<ModbusSensor[]>([]);
    const [alarms, setAlarms] = useState<AlarmRule[]>([]);
    const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set());
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const wsRef = useRef<(() => void) | null>(null);
    const [filterType, setFilterType] = useState<string>('all');

    // Группировка датчиков по объектам
    const groupedSensors = useCallback((): GroupedSensor[] => {
        const groups = new Map<string, GroupedSensor>();

        sensors.forEach(sensor => {
            if (!sensor.object_id) return;

            const key = `${sensor.object_type}_${sensor.object_id}`;
            if (!groups.has(key)) {
                groups.set(key, {
                    objectId: sensor.object_id,
                    objectName: sensor.object_name || sensor.object_id,
                    objectType: sensor.object_type as any,
                    sensors: [],
                    status: 'online',
                    lastUpdate: sensor.last_update || new Date().toISOString()
                });
            }

            const group = groups.get(key)!;
            group.sensors.push(sensor);

            // Обновляем статус группы
            if (sensor.last_value !== null) {
                if ((sensor.alarm_min && Number(sensor.last_value) < sensor.alarm_min) ||
                    (sensor.alarm_max && Number(sensor.last_value) > sensor.alarm_max)) {
                    group.status = 'critical';
                } else if (group.status !== 'critical') {
                    group.status = 'online';
                }
            }

            if (sensor.last_update && new Date(sensor.last_update) > new Date(group.lastUpdate)) {
                group.lastUpdate = sensor.last_update;
            }
        });

        return Array.from(groups.values());
    }, [sensors]);

    // Фильтрация групп
    const filteredGroups = useCallback(() => {
        let groups = groupedSensors();
        if (filterType !== 'all') {
            groups = groups.filter(g => g.objectType === filterType);
        }
        return groups;
    }, [groupedSensors, filterType]);

    // Загрузка датчиков
    const loadSensors = useCallback(async () => {
        try {
            const data = await modbusApi.getSensors();
            setSensors(data);
        } catch (error) {
            console.error('Failed to load sensors:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Загрузка алармов
    const loadAlarms = useCallback(async () => {
        try {
            const data = await modbusApi.getAlarms(true);
            setAlarms(data);
        } catch (error) {
            console.error('Failed to load alarms:', error);
        }
    }, []);

    // WebSocket для live данных
    useEffect(() => {
        if (USE_MOCK) {
            wsRef.current = startMockWebSocket((data) => {
                if (data.type === 'sensor_update') {
                    setSensors(prev => prev.map(s =>
                        s.id === data.sensor_id
                            ? { ...s, last_value: data.value, last_update: data.timestamp }
                            : s
                    ));
                } else if (data.type === 'alarm') {
                    loadAlarms();
                }
            });
        }

        return () => {
            if (wsRef.current) {
                wsRef.current();
            }
        };
    }, [loadAlarms]);

    // Initial load
    useEffect(() => {
        loadSensors();
        loadAlarms();
    }, [loadSensors, loadAlarms]);

    const handleSensorRead = async (sensorId: string) => {
        try {
            await modbusApi.readSensor(sensorId);
            await loadSensors();
        } catch (error) {
            console.error('Failed to read sensor:', error);
        }
    };

    const handleSensorSettings = (sensor: ModbusSensor) => {
        // Открыть модалку редактирования датчика
        console.log('Edit sensor:', sensor);
    };

    const handleAcknowledgeAlarm = async (id: string) => {
        try {
            await modbusApi.acknowledgeAlarm(id);
            await loadAlarms();
        } catch (error) {
            console.error('Failed to acknowledge alarm:', error);
        }
    };

    const toggleObject = (objectId: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(objectId)) {
                newSet.delete(objectId);
            } else {
                newSet.add(objectId);
            }
            return newSet;
        });
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Загрузка SCADA системы...</p>
                </div>
            </div>
        );
    }

    const groups = filteredGroups();

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SCADA мониторинг</h1>
                        <p className="text-sm text-gray-500 mt-1">Мониторинг датчиков по объектам • Режим реального времени</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                        >
                            <option value="all">Все объекты</option>
                            <option value="field">🌾 Поля</option>
                            <option value="greenhouse">🌱 Теплицы</option>
                            <option value="plot">📍 Участки</option>
                        </select>
                        <button
                            onClick={() => loadSensors()}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Левая колонка - Объекты с датчиками */}
                    <div className="lg:col-span-2 space-y-4">
                        {groups.length === 0 ? (
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                                <Gauge className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Нет подключенных датчиков
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Добавьте датчики и назначьте их к объектам для мониторинга
                                </p>
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Добавить первый датчик
                                </button>
                            </div>
                        ) : (
                            groups.map((group) => (
                                <ObjectCard
                                    key={`${group.objectType}_${group.objectId}`}
                                    group={group}
                                    onSensorRead={handleSensorRead}
                                    onSensorSettings={handleSensorSettings}
                                    isExpanded={expandedGroups.has(`${group.objectType}_${group.objectId}`)}
                                    onToggle={() => toggleObject(`${group.objectType}_${group.objectId}`)}
                                />
                            ))
                        )}
                    </div>

                    {/* Правая колонка - Алармы */}
                    <div className="lg:col-span-1">
                        <AlarmPanel alarms={alarms} onAcknowledge={handleAcknowledgeAlarm} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScadaDashboard;