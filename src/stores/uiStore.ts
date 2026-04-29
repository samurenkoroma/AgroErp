import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

export type CreateNotification = Omit<Notification, 'id'>;

interface UIStore {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;

    // Уведомления
    notifications: Notification[];
    addNotification: (notification: CreateNotification) => string;
    removeNotification: (id: string) => void;

}

export const useUIStore = create<UIStore>()(
    persist(
        (set, get) => ({
            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),

            theme: 'light',
            toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
            setTheme: (theme) => set({ theme }),


            notifications: [],
            addNotification: (notification: CreateNotification) => {
                const id = Date.now().toString();
                const newNotification: Notification = { ...notification, id };
                set((state) => ({
                    notifications: [...state.notifications, newNotification]
                }));

                const duration = notification.duration || 5000;
                setTimeout(() => {
                    get().removeNotification(id);
                }, duration);

                return id;
            },
            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id)
            })),
        }),
        {
            name: 'ui-storage',
            partialize: (state) => ({
                sidebarOpen: state.sidebarOpen,
                theme: state.theme,
            }),
        }

    )
);