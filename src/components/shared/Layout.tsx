import React, {useEffect} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {Header} from './Header';
import {Sidebar} from './Sidebar';
import {NotificationCenter} from "@/components/shared/NotificationCenter.tsx";
import {useAuthStore} from "@/stores/authStore.ts";
import {Sprout} from "lucide-react";
import {FloatingActionButton} from "@/components/common/FloatingActionButton.tsx";
import {useFloatingAction} from "@/contexts/FloatingActionContext.tsx";

export const Layout: React.FC = () => {
    const {role} = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const {setActions, clearActions, setOnMainClick} = useFloatingAction();


    useEffect(() => {
        // Очищаем предыдущие действия при смене страницы
        clearActions();
        setOnMainClick(() => {
        });

        // Дефолтные действия (если нужно добавить глобальные)
        const defaultActions = [];

        // Добавляем действия в зависимости от роли
        if (role === 'super_admin' || role === 'agronomist') {
            defaultActions.push({
                id: 'global-create-crop-plan',
                label: 'Новый посев',
                icon: <Sprout className="w-5 h-5"/>,
                onClick: () => navigate('/planning'),
                color: 'bg-green-500'
            });
        }

        if (defaultActions.length > 0) {
            setActions(defaultActions);
        }
    }, [location.pathname, role]);



    return (
        <div className="h-screen flex bg-background text-foreground transition-colors duration-300">
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Header/>
                <main className="flex-1 overflow-y-auto relative flex flex-col">
                    <Outlet/>
                </main>
            </div>
            <Sidebar/>
            <NotificationCenter />
            <FloatingActionButton showScrollTop/>
        </div>
    );
};