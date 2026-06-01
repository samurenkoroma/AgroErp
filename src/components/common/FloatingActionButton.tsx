// src/components/ui/FloatingActionButton.tsx
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {AlertCircle, ChevronUp, Plus, X} from 'lucide-react';
import {Action, useFloatingAction} from '@/contexts/FloatingActionContext';

export const FloatingActionButton = ({ showScrollTop = true }: { showScrollTop?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [confirmAction, setConfirmAction] = useState<Action | null>(null);
    const [mounted, setMounted] = useState(false);

    const { actions, mainIcon, onMainClick } = useFloatingAction();
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Стабилизируем actions для мемоизации
    const stableActions = useMemo(() => actions, [actions]);
    const hasActions = stableActions.length > 0;
    const hasMainClick = !!onMainClick;

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Закрытие меню при клике вне области - оптимизировано
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    // Отслеживаем скролл - оптимизировано с throttle
    useEffect(() => {
        if (!showScrollTop) return;

        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setShowScrollButton(window.scrollY > 300);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showScrollTop]);

    const handleScrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleMainClick = useCallback(() => {
        if (onMainClick) {
            onMainClick();
        } else {
            setIsOpen(prev => !prev);
        }
    }, [onMainClick]);

    const handleActionClick = useCallback((action: Action) => {
        if (action.confirm) {
            setConfirmAction(action);
            return;
        }

        action.onClick();
        setIsOpen(false);
    }, []);

    const handleConfirm = useCallback(() => {
        if (confirmAction) {
            confirmAction.onClick();
            setConfirmAction(null);
            setIsOpen(false);
        }
    }, [confirmAction]);

    if (!mounted) return null;
    if (!hasActions && !hasMainClick) return null;

    return (
        <>
            {/* Оверлей */}
            {isOpen && createPortal(
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                />,
                document.body
            )}

            {/* Меню */}
            {isOpen && hasActions && createPortal(
                <div
                    ref={menuRef}
                    className="fixed bottom-24 right-6 z-50 space-y-2 animate-fade-in-up"
                >
                    {stableActions.map((action) => (
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
                </div>,
                document.body
            )}

            {/* Кнопка "Наверх" */}
            {showScrollTop && showScrollButton && createPortal(
                <button
                    onClick={handleScrollToTop}
                    className="fixed bottom-24 right-6 z-50 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-lg flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 animate-fade-in"
                >
                    <ChevronUp className="w-5 h-5" />
                </button>,
                document.body
            )}

            {/* Модалка подтверждения */}
            {confirmAction && createPortal(
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
                </div>,
                document.body
            )}

            {/* Основная кнопка */}
            <div className="fixed bottom-6 right-24 z-50">
                <button
                    ref={buttonRef}
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
        </>
    );
};