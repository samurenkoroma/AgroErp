import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../app/store/useAuthStore';

class WebSocketService {
    private socket: Socket | null = null;

    connect() {
        const token = useAuthStore.getState().token;
        this.socket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:3000', {
            auth: { token },
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    subscribe(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    unsubscribe(event: string, callback?: (data: any) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    emit(event: string, data: any) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }
}

export const wsService = new WebSocketService();