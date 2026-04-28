import { RouteObject } from 'react-router-dom';

export interface RouteMeta {
    title?: string;
    icon?: React.ReactNode;
    hidden?: boolean;
    permissions?: string[];
    breadcrumb?: string;
}

export interface AppRouteObject extends RouteObject {
    meta?: RouteMeta;
    children?: AppRouteObject[];
}

export interface BreadcrumbItem {
    title: string;
    path: string;
    isActive: boolean;
}