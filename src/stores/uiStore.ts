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

    // Модальные окна
    modals: Record<string, boolean>;
    openModal: (modalId: string) => void;
    closeModal: (modalId: string) => void;
    closeAllModals: () => void;

    // Уведомления
    notifications: Notification[];
    addNotification: (notification: CreateNotification) => string;
    removeNotification: (id: string) => void;

    // Загрузка
    loadingStates: Record<string, boolean>;
    setLoading: (key: string, isLoading: boolean) => void;
    isLoading: (key: string) => boolean;
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

            modals: {},
            openModal: (modalId) => set((state) => ({
                modals: { ...state.modals, [modalId]: true }
            })),
            closeModal: (modalId) => set((state) => ({
                modals: { ...state.modals, [modalId]: false }
            })),
            closeAllModals: () => set({ modals: {} }),

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

            loadingStates: {},
            setLoading: (key, isLoading) => set((state) => ({
                loadingStates: { ...state.loadingStates, [key]: isLoading }
            })),
            isLoading: (key) => get().loadingStates[key] || false,
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