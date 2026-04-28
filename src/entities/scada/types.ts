export type ModbusDataType = 'coil' | 'discrete_input' | 'holding_register' | 'input_register';
export type ModbusDataFormat = 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32' | 'boolean' | 'string';
export type SensorType = 'temperature' | 'humidity' | 'soil_moisture' | 'light' | 'co2' | 'pressure' | 'water_flow' | 'ph' | 'ec' | 'wind_speed' | 'rainfall';
export type UnitType = '°C' | '%' | 'lux' | 'ppm' | 'hPa' | 'm³/h' | 'pH' | 'mS/cm' | 'm/s' | 'mm';

export interface ModbusDevice {
    id: string;
    name: string;
    ip_address: string;
    port: number;
    slave_id: number;
    timeout_ms: number;
    is_connected: boolean;
    last_seen?: string;
    created_at: string;
}

export interface ModbusSensor {
    id: string;
    device_id: string;
    object_id?: string; // Привязка к полю/теплице/участку
    object_type?: 'field' | 'greenhouse' | 'plot';
    name: string;
    type: SensorType;
    unit: UnitType;
    address: number;
    data_type: ModbusDataType;
    format: ModbusDataFormat;
    scale_factor: number;
    offset: number;
    min_value?: number;
    max_value?: number;
    alarm_min?: number;
    alarm_max?: number;
    is_active: boolean;
    poll_interval_ms: number;
    last_value?: number | string | boolean;
    last_value_raw?: number;
    last_update?: string;
    history: SensorHistory[];
}

export interface SensorHistory {
    timestamp: string;
    value: number;
    quality: 'good' | 'uncertain' | 'bad';
}

export interface AlarmRule {
    id: string;
    sensor_id: string;
    type: 'min' | 'max' | 'delta' | 'rate';
    threshold: number;
    hysteresis: number;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    is_active: boolean;
    triggered_at?: string;
    acknowledged_at?: string;
}

export interface DashboardWidget {
    id: string;
    type: 'gauge' | 'chart' | 'indicator' | 'value';
    sensor_id: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    title: string;
    settings: Record<string, any>;
}