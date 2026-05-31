// src/components/ui/FloatingActionButton.tsx - расширенная версия
import {useState} from 'react';
import {AlertCircle, Plus, X} from 'lucide-react';

interface Action {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color?: string;
    confirm?: {
        title: string;
        message: string;
    };
}
interface FloatingActionButtonProps {
    actions?: Action[];
    mainIcon?: React.ReactNode;
    onMainClick?: () => void;
}
export const FloatingActionButton = ({
                                         actions = [],
                                         mainIcon,
                                         onMainClick,
                                     }: FloatingActionButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<Action | null>(null);

    // ... хук для скролла

    const handleActionClick = (action: Action) => {
        if (action.confirm) {
            setConfirmAction(action);
            return;
        }

        action.onClick();
        setIsOpen(false);
    };
    const handleMainClick = () => {
        if (onMainClick) {
            onMainClick();
        } else {
            setIsOpen(!isOpen);
        }
    };
    const handleConfirm = () => {
        if (confirmAction) {
            confirmAction.onClick();
            setConfirmAction(null);
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Плавающая кнопка */}
            <div className="fixed bottom-6 right-6 z-50">
                {/* Actions menu */}
                {isOpen && (
                    <div className="absolute bottom-16 right-0 mb-2 space-y-2 animate-fade-in-up">
                        {actions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => handleActionClick(action)}
                                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg shadow-lg
                  text-white transition-all duration-200 hover:scale-105
                  ${action.color || 'bg-gray-700'}
                  w-48
                `}
                            >
                                {action.icon}
                                <span className="text-sm font-medium">{action.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Main button */}
                <button
                    onClick={handleMainClick}
                    className={`
            w-14 h-14 rounded-full shadow-lg flex items-center justify-center
            transition-all duration-300 transform hover:scale-110 active:scale-95
            ${isOpen ? 'bg-gray-700 rotate-45' : 'bg-green-600'}
            text-white
          `}
                >
                    {mainIcon || (isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />)}
                </button>
            </div>



            {/* Модалка подтверждения */}
            {confirmAction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-xl">
                        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {confirmAction.confirm?.title || 'Подтверждение'}
                                </h3>
                            </div>
                        </div>
                        <div className="p-5">
                            <p className="text-gray-600 dark:text-gray-400">
                                {confirmAction.confirm?.message || `Вы уверены, что хотите выполнить действие "${confirmAction.label}"?`}
                            </p>
                        </div>
                        <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Подтвердить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};