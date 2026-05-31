// src/hooks/usePageActions.ts
import {useEffect, useRef} from 'react';
import {useLocation} from 'react-router-dom';
import {Action, useFloatingAction} from '@/contexts/FloatingActionContext';

interface UsePageActionsOptions {
    actions?: Action[];
    mainIcon?: React.ReactNode;
    onMainClick?: () => void;
}

export const usePageActions = ({
                                   actions = [],
                                   mainIcon,
                                   onMainClick,
                               }: UsePageActionsOptions) => {
    const location = useLocation();
    const { setActions, clearActions, setMainIcon, setOnMainClick } = useFloatingAction();

    // Используем ref для стабильности действий
    const actionsRef = useRef(actions);
    const mainIconRef = useRef(mainIcon);
    const onMainClickRef = useRef(onMainClick);

    // Обновляем refs при изменении зависимостей
    useEffect(() => {
        actionsRef.current = actions;
    }, [actions]);

    useEffect(() => {
        mainIconRef.current = mainIcon;
    }, [mainIcon]);

    useEffect(() => {
        onMainClickRef.current = onMainClick;
    }, [onMainClick]);

    // Эффект для установки действий - только при монтировании и размонтировании
    useEffect(() => {
        const currentPath = location.pathname;

        // Устанавливаем действия
        setActions(actionsRef.current);
        if (mainIconRef.current) setMainIcon(mainIconRef.current);
        if (onMainClickRef.current) setOnMainClick(onMainClickRef.current);

        // Очищаем при уходе со страницы
        return () => {
            // Проверяем, что мы все еще на той же странице
            if (window.location.pathname === currentPath) {
                clearActions();
            }
        };
    }, [location.pathname]); // Только при смене пути!
};