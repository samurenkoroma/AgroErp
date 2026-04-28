// src/entities/scada/mock-data.ts
import { ModbusDevice, ModbusSensor, AlarmRule, SensorHistory } from './types';


export const mockObjectsForScada = [
    { id: 'greenhouse-1', name: 'Теплица №1', type: 'greenhouse' },
    { id: 'field-1', name: 'Поле Северное', type: 'field' },
    { id: 'field-2', name: 'Поле Восточное', type: 'field' },
    { id: 'plot-1', name: 'Участок Приусадебный', type: 'plot' }
];

// ============ Мок-устройства Modbus ============
export const mockDevices: ModbusDevice[] = [
    {
        id: 'device-1',
        name: 'Контроллер теплицы №1',
        ip_address: '192.168.1.100',
        port: 502,
        slave_id: 1,
        timeout_ms: 5000,
        is_connected: true,
        last_seen: new Date().toISOString(),
        created_at: '2025-01-15T10:00:00Z'
    },
    {
        id: 'device-2',
        name: 'Метеостанция полевая',
        ip_address: '192.168.1.101',
        port: 502,
        slave_id: 2,
        timeout_ms: 5000,
        is_connected: true,
        last_seen: new Date().toISOString(),
        created_at: '2025-02-10T14:30:00Z'
    },
    {
        id: 'device-3',
        name: 'Система полива',
        ip_address: '192.168.1.102',
        port: 502,
        slave_id: 3,
        timeout_ms: 5000,
        is_connected: false,
        last_seen: '2025-04-25T08:15:00Z',
        created_at: '2025-03-01T09:00:00Z'
    }
];

// ============ Мок-датчики ============
export const mockSensors: ModbusSensor[] = [
    // Теплица №1 - Температура
    {
        id: 'sensor-1',
        device_id: 'device-1',
        object_id: 'greenhouse-1',
        object_type: 'greenhouse',
        name: 'Температура воздуха',
        type: 'temperature',
        unit: '°C',
        address: 1,
        data_type: 'holding_register',
        format: 'float32',
        scale_factor: 0.1,
        offset: 0,
        min_value: -10,
        max_value: 50,
        alarm_min: 15,
        alarm_max: 30,
        is_active: true,
        poll_interval_ms: 5000,
        last_value: 23.5,
        last_value_raw: 235,
        last_update: new Date().toISOString(),
        history: []
    },
    // Теплица №1 - Влажность
    {
        id: 'sensor-2',
        device_id: 'device-1',
        object_id: 'greenhouse-1',
        object_type: 'greenhouse',
        name: 'Влажность воздуха',
        type: 'humidity',
        unit: '%',
        address: 2,
        data_type: 'holding_register',
        format: 'float32',
        scale_factor: 0.1,
        offset: 0,
        min_value: 0,
        max_value: 100,
        alarm_min: 40,
        alarm_max: 80,
        is_active: true,
        poll_interval_ms: 5000,
        last_value: 65.2,
        last_value_raw: 652,
        last_update: new Date().toISOString(),
        history: []
    },
    // Теплица №1 - CO2
    {
        id: 'sensor-3',
        device_id: 'device-1',
        object_id: 'greenhouse-1',
        object_type: 'greenhouse',
        name: 'Уровень CO2',
        type: 'co2',
        unit: 'ppm',
        address: 3,
        data_type: 'holding_register',
        format: 'uint16',
        scale_factor: 1,
        offset: 0,
        min_value: 300,
        max_value: 2000,
        alarm_min: 400,
        alarm_max: 1200,
        is_active: true,
        poll_interval_ms: 10000,
        last_value: 485,
        last_value_raw: 485,
        last_update: new Date().toISOString(),
        history: []
    },
    // Теплица №1 - Освещенность
    {
        id: 'sensor-4',
        device_id: 'device-1',
        object_id: 'greenhouse-1',
        object_type: 'greenhouse',
        name: 'Освещенность',
        type: 'light',
        unit: 'lux',
        address: 4,
        data_type: 'holding_register',
        format: 'uint32',
        scale_factor: 1,
        offset: 0,
        min_value: 0,
        max_value: 100000,
        alarm_min: 5000,
        alarm_max: null,
        is_active: true,
        poll_interval_ms: 15000,
        last_value: 24500,
        last_value_raw: 24500,
        last_update: new Date().toISOString(),
        history: []
    },
    // Поле Северное - Температура почвы
    {
        id: 'sensor-5',
        device_id: 'device-2',
        object_id: 'field-1',
        object_type: 'field',
        name: 'Температура почвы',
        type: 'temperature',
        unit: '°C',
        address: 10,
        data_type: 'holding_register',
        format: 'float32',
        scale_factor: 0.1,
        offset: 0,
        min_value: -10,
        max_value: 40,
        alarm_min: 5,
        alarm_max: 28,
        is_active: true,
        poll_interval_ms: 10000,
        last_value: 16.8,
        last_value_raw: 168,
        last_update: new Date().toISOString(),
        history: []
    },
    // Поле Северное - Влажность почвы
    {
        id: 'sensor-6',
        device_id: 'device-2',
        object_id: 'field-1',
        object_type: 'field',
        name: 'Влажность почвы',
        type: 'soil_moisture',
        unit: '%',
        address: 11,
        data_type: 'holding_register',
        format: 'float32',
        scale_factor: 0.1,
        offset: 0,
        min_value: 0,
        max_value: 100,
        alarm_min: 30,
        alarm_max: 70,
        is_active: true,
        poll_interval_ms: 10000,
        last_value: 45.3,
        last_value_raw: 453,
        last_update: new Date().toISOString(),
        history: []
    },
    // Поле Восточное - Влажность почвы
    {
        id: 'sensor-7',
        device_id: 'device-2',
        object_id: 'field-2',
        object_type: 'field',
        name: 'Влажность почвы',
        type: 'soil_moisture',
        unit: '%',
        address: 12,
        data_type: 'holding_register',
        format: 'float32',
        scale_factor: 0.1,
        offset: 0,
        min_value: 0,
        max_value: 100,
        alarm_min: 30,
        alarm_max: 70,
        is_active: true,
        poll_interval_ms: 10000,
        last_value: 28.7,
        last_value_raw: 287,
        last_update: new Date().toISOString(),
        history: []
    },
    // Метеостанция - Скорость ветра
    {
        id: 'sensor-8',
        device_id: 'device-2',
        name: 'Скорость ветра',
        type: 'wind_speed',
        unit: 'm/s',
        address: 20,
        data_type: 'holding_register',
        format: 'float32',
        scale_factor: 0.01,
        offset: 0,
        min_value: 0,
        max_value: 30,
        alarm_min: null,
        alarm_max: 12,
        is_active: true,
        poll_interval_ms: 5000,
        last_value: 3.2,
        last_value_raw: 320,
        last_update: new Date().toISOString(),
        history: []
    },
    // Метеостанция - Осадки
    {
        id: 'sensor-9',
        device_id: 'device-2',
        name: 'Осадки',
        type: 'rainfall',
        unit: 'mm',
        address: 21,
        data_type: 'holding_register',
        format: 'float32',
        scale_factor: 0.1,
        offset: 0,
        min_value: 0,
        max_value: 100,
        alarm_min: null,
        alarm_max: null,
        is_active: true,
        poll_interval_ms: 60000,
        last_value: 0,
        last_value_raw: 0,
        last_update: new Date().toISOString(),
        history: []
    }
];

// ============ Мок-алармы ============
export const mockAlarms: AlarmRule[] = [
    {
        id: 'alarm-1',
        sensor_id: 'sensor-7',
        type: 'min',
        threshold: 30,
        hysteresis: 2,
        severity: 'warning',
        message: '⚠️ Влажность почвы ниже нормы (28.7%) на Поле Восточном',
        is_active: true,
        triggered_at: new Date().toISOString(),
        acknowledged_at: null
    },
    {
        id: 'alarm-2',
        sensor_id: 'sensor-1',
        type: 'max',
        threshold: 30,
        hysteresis: 1,
        severity: 'info',
        message: 'ℹ️ Температура в теплице в норме',
        is_active: false,
        triggered_at: null,
        acknowledged_at: null
    },
    {
        id: 'alarm-3',
        sensor_id: 'sensor-8',
        type: 'max',
        threshold: 12,
        hysteresis: 1,
        severity: 'critical',
        message: '💨 Сильный ветер 14.5 м/с!',
        is_active: true,
        triggered_at: new Date().toISOString(),
        acknowledged_at: null
    }
];

// ============ Мок-история датчиков ============
export const generateMockHistory = (sensorId: string, hours: number = 24): SensorHistory[] => {
    const history: SensorHistory[] = [];
    const now = new Date();
    const sensor = mockSensors.find(s => s.id === sensorId);
    const baseValue = sensor?.last_value as number || 20;

    for (let i = hours; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        // Симуляция колебаний значений
        const variation = Math.sin(i * 0.5) * 5;
        const noise = (Math.random() - 0.5) * 2;
        let value = baseValue + variation + noise;

        // Для определенных датчиков добавляем тренд
        if (sensorId === 'sensor-6') {
            // Влажность почвы - медленное снижение
            value = baseValue - (i / 24) * 5 + noise;
        }
        if (sensorId === 'sensor-1') {
            // Температура - дневной цикл
            const hour = timestamp.getHours();
            value = 18 + Math.sin((hour - 12) * Math.PI / 12) * 8 + noise;
        }

        history.push({
            timestamp: timestamp.toISOString(),
            value: Math.max(0, Math.min(100, value)),
            quality: 'good'
        });
    }

    return history;
};

// ============ WebSocket симуляция ============
let wsInterval: NodeJS.Timeout | null = null;
let wsCallbacks: ((data: any) => void)[] = [];

export const startMockWebSocket = (onMessage: (data: any) => void) => {
    wsCallbacks.push(onMessage);

    if (!wsInterval) {
        wsInterval = setInterval(() => {
            // Симулируем обновление значений датчиков
            mockSensors.forEach(sensor => {
                if (sensor.is_active) {
                    const currentValue = sensor.last_value as number;
                    const change = (Math.random() - 0.5) * 0.5;
                    let newValue = currentValue + change;

                    // Ограничения по min/max
                    if (sensor.min_value !== undefined) {
                        newValue = Math.max(sensor.min_value, newValue);
                    }
                    if (sensor.max_value !== undefined) {
                        newValue = Math.min(sensor.max_value, newValue);
                    }

                    sensor.last_value = newValue;
                    sensor.last_update = new Date().toISOString();

                    // Отправляем обновление
                    wsCallbacks.forEach(cb => cb({
                        type: 'sensor_update',
                        sensor_id: sensor.id,
                        value: newValue,
                        timestamp: new Date().toISOString()
                    }));
                }
            });

            // Проверяем алармы
            mockAlarms.forEach(alarm => {
                const sensor = mockSensors.find(s => s.id === alarm.sensor_id);
                if (sensor && sensor.last_value !== undefined) {
                    const value = sensor.last_value as number;
                    let isTriggered = false;

                    if (alarm.type === 'min' && value < alarm.threshold) {
                        isTriggered = true;
                    }
                    if (alarm.type === 'max' && alarm.threshold && value > alarm.threshold) {
                        isTriggered = true;
                    }

                    if (isTriggered && !alarm.triggered_at) {
                        alarm.triggered_at = new Date().toISOString();
                        alarm.is_active = true;
                        wsCallbacks.forEach(cb => cb({
                            type: 'alarm',
                            alarm_id: alarm.id,
                            message: alarm.message
                        }));
                    } else if (!isTriggered && alarm.triggered_at) {
                        alarm.triggered_at = null;
                        alarm.is_active = false;
                    }
                }
            });
        }, 3000);
    }

    return () => {
        const index = wsCallbacks.indexOf(onMessage);
        if (index > -1) wsCallbacks.splice(index, 1);
        if (wsCallbacks.length === 0 && wsInterval) {
            clearInterval(wsInterval);
            wsInterval = null;
        }
    };
};

// ============ Мок-API методы ============
export const mockModbusApi = {
    async getDevices(): Promise<ModbusDevice[]> {
        await delay(500);
        return [...mockDevices];
    },

    async getSensors(deviceId?: string): Promise<ModbusSensor[]> {
        await delay(300);
        let sensors = [...mockSensors];
        if (deviceId) {
            sensors = sensors.filter(s => s.device_id === deviceId);
        }
        return sensors;
    },

    async getSensor(id: string): Promise<ModbusSensor> {
        await delay(200);
        const sensor = mockSensors.find(s => s.id === id);
        if (!sensor) throw new Error('Sensor not found');
        return { ...sensor };
    },

    async createSensor(data: Partial<ModbusSensor>): Promise<ModbusSensor> {
        await delay(500);
        const newSensor: ModbusSensor = {
            id: `sensor-${Date.now()}`,
            device_id: data.device_id || 'device-1',
            name: data.name || 'Новый датчик',
            type: data.type || 'temperature',
            unit: data.unit || '°C',
            address: data.address || 0,
            data_type: data.data_type || 'holding_register',
            format: data.format || 'float32',
            scale_factor: data.scale_factor || 1,
            offset: data.offset || 0,
            is_active: data.is_active ?? true,
            poll_interval_ms: data.poll_interval_ms || 5000,
            last_value: 0,
            last_update: new Date().toISOString(),
            history: []
        };
        mockSensors.push(newSensor);
        return newSensor;
    },

    async updateSensor(id: string, data: Partial<ModbusSensor>): Promise<ModbusSensor> {
        await delay(500);
        const index = mockSensors.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Sensor not found');
        mockSensors[index] = { ...mockSensors[index], ...data };
        return mockSensors[index];
    },

    async deleteSensor(id: string): Promise<void> {
        await delay(500);
        const index = mockSensors.findIndex(s => s.id === id);
        if (index !== -1) {
            mockSensors.splice(index, 1);
        }
    },

    async readSensor(id: string): Promise<{ value: number; timestamp: string }> {
        await delay(200);
        const sensor = mockSensors.find(s => s.id === id);
        if (!sensor) throw new Error('Sensor not found');

        // Симулируем чтение с небольшим изменением
        const currentValue = sensor.last_value as number || 20;
        const change = (Math.random() - 0.5) * 1;
        let newValue = currentValue + change;

        if (sensor.min_value !== undefined) {
            newValue = Math.max(sensor.min_value, newValue);
        }
        if (sensor.max_value !== undefined) {
            newValue = Math.min(sensor.max_value, newValue);
        }

        sensor.last_value = newValue;
        sensor.last_update = new Date().toISOString();

        return { value: newValue, timestamp: new Date().toISOString() };
    },

    async getHistory(sensorId: string, from: Date, to: Date): Promise<SensorHistory[]> {
        await delay(300);
        // Генерируем историю для выбранного датчика
        const hours = Math.floor((to.getTime() - from.getTime()) / (60 * 60 * 1000));
        return generateMockHistory(sensorId, Math.min(hours, 168)); // максимум 7 дней
    },

    async getAlarms(activeOnly: boolean = true): Promise<AlarmRule[]> {
        await delay(200);
        let alarms = [...mockAlarms];
        if (activeOnly) {
            alarms = alarms.filter(a => a.is_active);
        }
        return alarms;
    },

    async acknowledgeAlarm(id: string): Promise<void> {
        await delay(300);
        const alarm = mockAlarms.find(a => a.id === id);
        if (alarm) {
            alarm.acknowledged_at = new Date().toISOString();
            alarm.is_active = false;
        }
    },

    async getObjectSensors(objectId: string, objectType: string): Promise<ModbusSensor[]> {
        await delay(300);
        return mockSensors.filter(s => s.object_id === objectId && s.object_type === objectType);
    }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));