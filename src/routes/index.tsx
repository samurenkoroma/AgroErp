import {Navigate, RouteObject} from 'react-router-dom';

import FarmPage from "@/pages/farm/FarmPage.tsx";
import FieldPage from "@/pages/farm/FieldPage.tsx";
import PlotPage from "@/pages/farm/PlotPage.tsx";
import GreenhousePage from "@/pages/farm/GreenhousePage.tsx";
import CropsPage from "@/pages/crop/CropPage.tsx";
import VarietyDetailsPage from "@/pages/crop/VarietyDetailsPage.tsx";
import CropDetailsPage from "@/pages/crop/CropDetailPage.tsx";
import SeasonalPlanningPage from "@/pages/planning/SeasonalPlanningPage.tsx";
import CropPlanDetailsPage from "@/pages/planning/CropPlanDetailsPage.tsx";
import SeasonsPage from "@/pages/planning/SeasonsPage.tsx";
import SeasonDashboardPage from "@/pages/planning/SeasonsPage1.tsx";
import InventoryPage from "@/pages/inventory/InventoryPage.tsx";
import {MapDrawPage} from "@/pages/farm/MapDrawPage.tsx";
import {Dashboard} from "@/pages/Dashboard.tsx";
import LoginPage from "@/pages/auth/LoginPage.tsx";
import RegisterPage from "@/pages/auth/RegisterPage.tsx";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage.tsx";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage.tsx";
import ScadaDashboard from "@/pages/scada/ScadaDashboard.tsx";
import AllCropsPage from "@/pages/crop/AllCropsPage.tsx";

// Публичные маршруты (без авторизации)
export const publicRoutes: RouteObject[] = [
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/reset-password/:token', element: <ResetPasswordPage /> },
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
    { path: "/scada", element: <ScadaDashboard/> },

    {path: '/crops', element: <CropsPage/>},
    {path: "crops/:id", element: <CropDetailsPage/>},
    {path: "crops/:id/variety/:varId", element: <VarietyDetailsPage/>},


    {path: 'crop-plan', element: <AllCropsPage/>},

    {path: 'planning', element: <SeasonalPlanningPage/>},
    { path: "/plan/:planId", element: <CropPlanDetailsPage/> },
    { path: "/seasons", element: <SeasonsPage/> },
    { path: "/season1/:id", element: <SeasonDashboardPage/> },
    { path: "/inventory", element: <InventoryPage/> },
];


