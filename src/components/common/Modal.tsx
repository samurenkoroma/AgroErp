import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
};

export function Modal({
                          isOpen,
                          onClose,
                          title,
                          children,
                          size = 'md',
                          showCloseButton = true,
                          closeOnOverlayClick = true
                      }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Закрытие по ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Блокировка скролла при открытом модальном окне
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Оверлей */}
            <div
                className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
                onClick={closeOnOverlayClick ? onClose : undefined}
            />

            {/* Модальное окно */}
            <div
                ref={modalRef}
                className={`
                    relative bg-white dark:bg-gray-900 
                    rounded-xl shadow-2xl 
                    w-full ${sizeClasses[size]} 
                    max-h-[90vh] overflow-hidden 
                    flex flex-col
                    animate-in fade-in zoom-in duration-200
                `}
            >
                {/* Заголовок */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            aria-label="Закрыть"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Контент */}
                <div className="flex-1 overflow-y-auto p-5">
                    {children}
                </div>
            </div>
        </div>
    );
}