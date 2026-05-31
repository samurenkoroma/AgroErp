import {AppRoutes} from "@/routes/AppRoutes.tsx";
import {QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter} from 'react-router-dom';
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {useEffect, useRef} from "react";
import {initSession} from "@/flow/initSession.ts";
import {useAuthStore} from "@/stores/authStore.ts";
import {queryClient} from "@/shared/queryClient.ts";
import {FloatingActionProvider} from "@/contexts/FloatingActionContext.tsx";


export default function App() {

    const hasHydrated = useAuthStore.persist.hasHydrated();

    const initializedRef = useRef(false);

    useEffect(() => {
        if (!hasHydrated || initializedRef.current) return;

        initializedRef.current = true;

        initSession();
    }, [hasHydrated]);

    return (
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                {/* BrowserRouter удалён — он уже есть в main.tsx */}
                <FloatingActionProvider>
                    <AppRoutes/>
                </FloatingActionProvider>
                {/*<Toaster position="top-right"/>*/}
                <ReactQueryDevtools initialIsOpen={false}/>
            </QueryClientProvider>
        </BrowserRouter>

    );
}