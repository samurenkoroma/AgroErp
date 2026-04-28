import {apiClient} from '@/api/client';
import {mockModbusApi, startMockWebSocket} from "@/entities/scada/mock-data.ts";


export const USE_MOCK = import.meta.env.VITE_USE_MOCK_SCADA === 'true' || true; // По умолчанию true для разработки
class ModbusApi {
    private readonly basePath = '/scada';
    // ============ Устройства Modbus ============

    async getDevices() {
        if (USE_MOCK) return mockModbusApi.getDevices();
        return apiClient.get(`${this.basePath}/devices`);
    }

    async getDevice(id: string) {
        if (USE_MOCK) return mockModbusApi.getDevice(id);
        return apiClient.get(`${this.basePath}/devices/${id}`);
    }

    async createDevice(data: any) {
        if (USE_MOCK) return mockModbusApi.createDevice(data);
        return apiClient.post(`${this.basePath}/devices`, data);
    }

    async updateDevice(id: string, data: any) {
        if (USE_MOCK) return mockModbusApi.updateDevice(id, data);
        return apiClient.put(`${this.basePath}/devices/${id}`, data);
    }

    async deleteDevice(id: string) {
        if (USE_MOCK) return mockModbusApi.deleteDevice(id);
        return apiClient.delete(`${this.basePath}/devices/${id}`);
    }

    async testConnection(id: string) {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {connected: true, message: 'Connection successful'};
        }
        return apiClient.post(`${this.basePath}/devices/${id}/test`);
    }

    // ============ Датчики ============

    async getSensors(deviceId?: string) {
        if (USE_MOCK) return mockModbusApi.getSensors(deviceId);
        const url = deviceId ? `${this.basePath}/sensors?device_id=${deviceId}` : `${this.basePath}/sensors`;
        return apiClient.get(url);
    }

    async getSensor(id: string) {
        if (USE_MOCK) return mockModbusApi.getSensor(id);
        return apiClient.get(`${this.basePath}/sensors/${id}`);
    }

    async createSensor(data: any) {
        if (USE_MOCK) return mockModbusApi.createSensor(data);
        return apiClient.post(`${this.basePath}/sensors`, data);
    }

    async updateSensor(id: string, data: any) {
        if (USE_MOCK) return mockModbusApi.updateSensor(id, data);
        return apiClient.put(`${this.basePath}/sensors/${id}`, data);
    }

    async deleteSensor(id: string) {
        if (USE_MOCK) return mockModbusApi.deleteSensor(id);
        return apiClient.delete(`${this.basePath}/sensors/${id}`);
    }

    async readSensor(id: string) {
        if (USE_MOCK) return mockModbusApi.readSensor(id);
        return apiClient.post(`${this.basePath}/sensors/${id}/read`);
    }

    // ============ История ============

    async getHistory(sensorId: string, from: Date, to: Date) {
        if (USE_MOCK) return mockModbusApi.getHistory(sensorId, from, to);
        return apiClient.get(`${this.basePath}/sensors/${sensorId}/history`, {
            params: {from: from.toISOString(), to: to.toISOString()}
        });
    }

    async getLiveData(sensorId: string) {
        if (USE_MOCK) {
            const sensor = await mockModbusApi.getSensor(sensorId);
            return {value: sensor.last_value as number, quality: 'good', timestamp: sensor.last_update as string};
        }
        return apiClient.get(`${this.basePath}/sensors/${sensorId}/live`);
    }

    // ============ Алерты ============

    async getAlarms(activeOnly: boolean = true) {
        if (USE_MOCK) return mockModbusApi.getAlarms(activeOnly);
        return apiClient.get(`${this.basePath}/alarms`, {params: {active_only: activeOnly}});
    }

    async createAlarm(rule: any) {
        if (USE_MOCK) return mockModbusApi.createAlarm(rule);
        return apiClient.post(`${this.basePath}/alarms`, rule);
    }

    async acknowledgeAlarm(id: string) {
        if (USE_MOCK) return mockModbusApi.acknowledgeAlarm(id);
        return apiClient.post(`${this.basePath}/alarms/${id}/acknowledge`);
    }

    // ============ Объекты ============

    async getObjectSensors(objectId: string, objectType: string) {
        if (USE_MOCK) return mockModbusApi.getObjectSensors(objectId, objectType);
        return apiClient.get(`${this.basePath}/objects/${objectType}/${objectId}/sensors`);
    }
}

export const modbusApi = new ModbusApi();