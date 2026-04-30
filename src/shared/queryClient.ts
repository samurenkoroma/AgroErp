import {QueryClient} from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // данные "свежие" 5 минут
            gcTime: 1000 * 60 * 30,   // кеш живёт 30 минут
            retry: 1,

            refetchOnWindowFocus: false, // ❗ важно
            refetchOnReconnect: true,
        },
        mutations: {
            retry: 0,
        },
    },
});