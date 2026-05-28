import {Navigate, RouteObject} from 'react-router-dom';
import CropsPage from "@/pages/catalog/CropPage.tsx";
import VarietyDetailsPage from "@/pages/catalog/VarietyDetailsPage.tsx";
import CropDetailsPage from "@/pages/catalog/CropDetailPage.tsx";
import LoginPage from "@/pages/auth/LoginPage.tsx";
import RegisterPage from "@/pages/auth/RegisterPage.tsx";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage.tsx";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import ProductionUnitsPage from "@/pages/farm/ProductionUnitsPage.tsx";

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
    // {path: "/farm1", element: <ProductionUnitsPage/>},
    {path: "/farm2", element: <ProductionUnitsPage/>},
    // {path: "/draw", element: <MapDrawPage/>},
    // {path: "/field/:id", element: <FieldPage/>},
    // {path: "/plot/:id", element: <PlotPage/>},
    // {path: "/greenhouse/:id", element: <GreenhousePage/>},

    {path: '/crops', element: <CropsPage/>},
    {path: "crops/:id", element: <CropDetailsPage/>},
    {path: "crops/:id/variety/:varId", element: <VarietyDetailsPage/>},


    // {path: '/growing', element: <AllCropsPage/>},
    // {path: "/growing/:planId", element: <CropPlanDetailsPage/>},
    //
    // {path: "/seasons", element: <SeasonsPage/>},
    // {path: "/seasons1", element: <SeasonsPage1/>},
    // {path: "/inventory", element: <InventoryPage/>},
];


