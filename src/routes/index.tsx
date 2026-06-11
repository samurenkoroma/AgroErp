import {Navigate, RouteObject} from 'react-router-dom';
import CropsPage from "@/pages/agronomy/CropPage.tsx";
import VarietyDetailsPage from "@/pages/agronomy/VarietyDetailsPage.tsx";
import CropDetailsPage from "@/pages/agronomy/CropDetailPage.tsx";
import LoginPage from "@/pages/auth/LoginPage.tsx";
import RegisterPage from "@/pages/auth/RegisterPage.tsx";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage.tsx";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import ProductionUnitsPage from "@/pages/farm/ProductionUnitsPage.tsx";
import PlotPage from "@/pages/farm/PlotPage.tsx";
import SeasonsPage from "@/pages/planning/SeasonsPage.tsx";
import InventoryPage from "@/pages/inventory/InventoryPage.tsx";
import CropPlanDetailsPage from "@/pages/growing/CropPlanDetailsPage.tsx";
import GrowingTablePage from "@/features/production/growing_cycle/components/GrowingTablePage.tsx";

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
    {path: "/farm", element: <ProductionUnitsPage/>},
    {path: "/plot/:id", element: <PlotPage/>},
    // {path: "/field/:id", element: <FieldPage/>},
    // {path: "/greenhouse/:id", element: <GreenhousePage/>},

    // {path: "/draw", element: <MapDrawPage/>},

    {path: '/crops', element: <CropsPage/>},
    {path: "crops/:id", element: <CropDetailsPage/>},
    {path: "crops/:id/variety/:varId", element: <VarietyDetailsPage/>},

    {path: "/seasons", element: <SeasonsPage/>},
    {path: "/inventory", element: <InventoryPage/>},
    {path: "/growing", element: <GrowingTablePage/>},
    // {path: "/growing/:id", element: <GrowingCycleFullPage/>},

    {path: "/growing/:id", element: <CropPlanDetailsPage/>},
    // {path: "/table", element: <GrowingTablePage/>},
];


