import React from 'react';
import {Outlet} from 'react-router-dom';
import {Header} from './Header';
import {Sidebar} from './Sidebar';
import {NotificationCenter} from "@/components/shared/NotificationCenter.tsx";

export const Layout: React.FC = () => {
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
        </div>
    );
};