import {X, CheckCircle, AlertCircle, AlertTriangle, Info} from 'lucide-react';
import {useUIStore} from '@/stores/uiStore';

const notificationIcons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const notificationColors = {
    success: 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/90 dark:text-yellow-100',
    error: 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/90 dark:text-red-100',
    warning: 'bg-amber-50 border-amber-500 text-amber-800 dark:bg-amber-900/90 dark:text-amber-400',
    info: 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/90 dark:text-blue-200',
};

export function NotificationCenter() {
    const {notifications, removeNotification} = useUIStore();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-4 left-20 z-50 flex flex-col gap-2 max-w-md">
            {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                const colors = notificationColors[notification.type];

                return (
                    <div
                        key={notification.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-bottom duration-100 ${colors}`}
                    >
                        <Icon className="w-5 h-5 shrink-0 mt-0.5"/>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{notification.message}</p>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="p-1 hover:bg-black/10 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4"/>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}