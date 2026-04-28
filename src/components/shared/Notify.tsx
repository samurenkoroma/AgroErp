import { useUIStore } from '@/stores/uiStore';

export function Notify() {
    const { addNotification } = useUIStore();

    const handleSuccess = () => {
        addNotification({
            type: 'success',
            message: 'Операция выполнена успешно!'
        });
    };

    const handleError = () => {
        addNotification({
            type: 'error',
            message: 'Произошла ошибка'
        });
    };

    const handleWarning = () => {
        addNotification({
            type: 'warning',
            message: 'Внимание! Проверьте данные'
        });
    };

    const handleInfo = () => {
        addNotification({
            type: 'info',
            message: 'Информационное сообщение',
            duration: 3000 // 3 секунды
        });
    };

    return (
        <div>
            <button onClick={handleSuccess}>Success</button>
            <button onClick={handleError}>Error</button>
            <button onClick={handleWarning}>Warning</button>
            <button onClick={handleInfo}>Info</button>
        </div>
    );
}