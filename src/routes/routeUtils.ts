import { privateRoutes } from './index';

export const getRouteByPath = (path: string) => {
    const findRoute = (routes: any[], path: string): any => {
        for (const route of routes) {
            if (route.path === path) return route;
            if (route.children) {
                const found = findRoute(route.children, path);
                if (found) return found;
            }
        }
        return null;
    };

    return findRoute(privateRoutes, path);
};

export const checkRoutePermission = (path: string, userPermissions: string[]): boolean => {
    const route = getRouteByPath(path);

    if (!route?.meta?.permissions) return true;

    return route.meta.permissions.some((perm: string) => userPermissions.includes(perm));
};

export const getPageTitle = (path: string): string => {
    const route = getRouteByPath(path);
    return route?.meta?.title || 'Agro Management';
};

export const generatePathWithParams = (
    path: string,
    params: Record<string, string | number>
): string => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, String(value));
    });
    return result;
};