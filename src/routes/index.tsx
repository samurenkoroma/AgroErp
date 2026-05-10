import {Navigate, RouteObject} from 'react-router-dom';

import FarmPage from "@/pages/farm/FarmPage.tsx";
import FieldPage from "@/pages/farm/FieldPage.tsx";
import PlotPage from "@/pages/farm/PlotPage.tsx";
import GreenhousePage from "@/pages/farm/GreenhousePage.tsx";
import CropsPage from "@/pages/catalog/CropPage.tsx";
import VarietyDetailsPage from "@/pages/catalog/VarietyDetailsPage.tsx";
import CropDetailsPage from "@/pages/catalog/CropDetailPage.tsx";
import CropPlanDetailsPage from "@/pages/planning/CropPlanDetailsPage.tsx";
import SeasonsPage from "@/pages/planning/SeasonsPage.tsx";
import InventoryPage from "@/pages/inventory/InventoryPage.tsx";
import {MapDrawPage} from "@/pages/farm/MapDrawPage.tsx";
import {Dashboard} from "@/pages/Dashboard.tsx";
import LoginPage from "@/pages/auth/LoginPage.tsx";
import RegisterPage from "@/pages/auth/RegisterPage.tsx";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage.tsx";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage.tsx";
import AllCropsPage from "@/pages/planning/AllCropsPage.tsx";
import SeasonsPage1 from "@/pages/planning/SeasonsPage1.tsx";

// Публичные маршруты (без авторизации)
export const publicRoutes: RouteObject[] = [
    {path: '/login', element: <LoginPage/>},
    {path: '/register', element: <RegisterPage/>},
    {path: '/forgot-password', element: <ForgotPasswordPage/>},
    {path: '/reset-password/:token', element: <ResetPasswordPage/>},
];

// Приватные маршруты (требуют авторизации)
export const privateRoutes: RouteObject[] = [
    {path: '/', element: <Navigate to="/dashboard" replace/>},
    {path: '/dashboard', element: <Dashboard/>},
    {path: "/farm", element: <FarmPage/>},
    {path: "/draw", element: <MapDrawPage/>},
    {path: "/field/:id", element: <FieldPage/>},
    {path: "/plot/:id", element: <PlotPage/>},
    {path: "/greenhouse/:id", element: <GreenhousePage/>},

    {path: '/crops', element: <CropsPage/>},
    {path: "crops/:id", element: <CropDetailsPage/>},
    {path: "crops/:id/variety/:varId", element: <VarietyDetailsPage/>},


    {path: '/growing', element: <AllCropsPage/>},
    {path: "/growing/:planId", element: <CropPlanDetailsPage/>},

    {path: "/seasons", element: <SeasonsPage/>},
    {path: "/seasons1", element: <SeasonsPage1/>},
    {path: "/inventory", element: <InventoryPage/>},
];


