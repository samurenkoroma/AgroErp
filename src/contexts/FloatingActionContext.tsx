// src/contexts/FloatingActionContext.tsx
import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react';

export interface Action {
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

interface FloatingActionContextType {
    actions: Action[];
    setActions: (actions: Action[]) => void;
    clearActions: () => void;
    mainIcon?: React.ReactNode;
    setMainIcon: (icon: React.ReactNode) => void;
    onMainClick?: () => void;
    setOnMainClick: (callback: () => void) => void;
}

const FloatingActionContext = createContext<FloatingActionContextType | undefined>(undefined);

export const useFloatingAction = () => {
    const context = useContext(FloatingActionContext);
    if (!context) {
        throw new Error('useFloatingAction must be used within FloatingActionProvider');
    }
    return context;
};

export const FloatingActionProvider = ({ children }: { children: ReactNode }) => {
    const [actions, setActions] = useState<Action[]>([]);
    const [mainIcon, setMainIcon] = useState<React.ReactNode>();
    const [onMainClick, setOnMainClick] = useState<() => void>();

    // Мемоизируем clearActions
    const clearActions = useCallback(() => {
        setActions([]);
        setMainIcon(undefined);
        setOnMainClick(undefined);
    }, []);

    // Мемоизируем setActions с проверкой на изменение
    const setActionsOptimized = useCallback((newActions: Action[]) => {
        setActions(prev => {
            // Сравниваем по длине и ID, чтобы избежать лишних обновлений
            if (prev.length !== newActions.length) return newActions;
            const prevIds = prev.map(a => a.id).join(',');
            const newIds = newActions.map(a => a.id).join(',');
            return prevIds === newIds ? prev : newActions;
        });
    }, []);

    return (
        <FloatingActionContext.Provider
            value={{
                actions,
                setActions: setActionsOptimized,
                clearActions,
                mainIcon,
                setMainIcon,
                onMainClick,
                setOnMainClick,
            }}
        >
            {children}
        </FloatingActionContext.Provider>
    );
};