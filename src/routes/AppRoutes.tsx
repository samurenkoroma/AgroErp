import {useRoutes} from 'react-router-dom';
import {publicRoutes, privateRoutes} from './index';
import {PrivateRoute} from './PrivateRoute';
import {PublicRoute} from './PublicRoute';
import {Layout} from '@/components/shared/Layout';

export const AppRoutes = () => {
    // useRoutes работает внутри BrowserRouter
    return useRoutes([
        // Публичные маршруты (без авторизации)
        {
            element: <PublicRoute/>,
            children: publicRoutes,
        },
        // Приватные маршруты (требуют авторизации)
        {
            element: <PrivateRoute/>,
            children: [
                {
                    element: <Layout/>,
                    children: privateRoutes,
                },
            ],
        },
        // 404
        {
            path: '*',
            element: <Layout/>,
            children: [{element: <NotFoundPage/>}]
        },
    ]);
};

const NotFoundPage = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="text-6xl font-bold text-gray-300">404</h1>
            <p className="mt-2 text-gray-500">Страница не найдена</p>
            <a href="/" className="mt-4 text-blue-600 hover:underline">
                Вернуться на главную
            </a>
        </div>
    );
};