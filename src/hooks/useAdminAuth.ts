import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Role-based access control configuration
 * Maps role_id to allowed routes/dashboards
 */
const ROLE_ACCESS_MAP: Record<number, string[]> = {
    0: [
        '/admin/dashboard',
        '/admin/dashboard/admission',
        '/admin/dashboard/enquiry',
        '/admin/dashboard/contact',
        '/admin/dashboard/spotlight',
        '/admin/create-user',
        '/admin/manage-user',
        '/admin/change-password',
    ], // super-admin: all access
    1: [
        '/admin/dashboard',
        '/admin/dashboard/admission',
        '/admin/dashboard/enquiry',
        '/admin/dashboard/contact',
        '/admin/dashboard/spotlight',
        '/admin/change-password',
    ], // regular admin
    2: [
        '/admin/dashboard/admission',
        '/admin/change-password',
    ], // tele-caller: only admission dashboard
};

export interface AdminAuthResult {
    isAuthenticated: boolean;
    adminUsername: string | null;
    adminRoleId: number | null;
    hasAccess: boolean;
    loading: boolean;
}

/**
 * Hook to check if user is authenticated and has access to current route.
 * Redirects to /admin/login if not authenticated.
 * Redirects to /admin/dashboard if authenticated but lacks role access.
 * @param requiredRole - optional role_id required (e.g., 0 for super-admin only). If null, any authenticated user allowed.
 */
export const useAdminAuth = (requiredRole: number | null = null): AdminAuthResult => {
    const router = useRouter();
    const [hasChecked, setHasChecked] = useState(false);
    const [result, setResult] = useState<AdminAuthResult>({
        isAuthenticated: false,
        adminUsername: null,
        adminRoleId: null,
        hasAccess: false,
        loading: true,
    });

    useEffect(() => {
        // Only run on client-side after first render to avoid hydration mismatch
        try {
            const username = localStorage.getItem('adminUsername');
            const roleIdStr = localStorage.getItem('adminRoleId');
            const roleId = roleIdStr ? parseInt(roleIdStr, 10) : null;

            // Check authentication
            const isAuthenticated = !!(username && roleId !== null && !isNaN(roleId));

            if (!isAuthenticated) {
                // Not authenticated, redirect to login
                router.push('/admin/login');
                setResult({
                    isAuthenticated: false,
                    adminUsername: null,
                    adminRoleId: null,
                    hasAccess: false,
                    loading: false,
                });
                setHasChecked(true);
                return;
            }

            // Authenticated: check role access if requiredRole specified
            let hasAccess = true;
            if (requiredRole !== null && roleId !== requiredRole) {
                hasAccess = false;
                // Redirect to dashboard if trying to access restricted page
                router.push('/admin/dashboard');
            }

            setResult({
                isAuthenticated: true,
                adminUsername: username,
                adminRoleId: roleId,
                hasAccess,
                loading: false,
            });
            setHasChecked(true);
        } catch (e) {
            // Error reading localStorage, treat as not authenticated
            router.push('/admin/login');
            setResult({
                isAuthenticated: false,
                adminUsername: null,
                adminRoleId: null,
                hasAccess: false,
                loading: false,
            });
            setHasChecked(true);
        }
    }, [router, requiredRole]);

    return result;
};

/**
 * Check if a given route is accessible by a role.
 * @param roleId - user's role_id
 * @param route - the route path (e.g., '/admin/dashboard/admission')
 * @returns true if role can access the route
 */
export const canAccessRoute = (roleId: number | null, route: string): boolean => {
    if (roleId === null || roleId === undefined) return false;
    const allowedRoutes = ROLE_ACCESS_MAP[roleId];
    if (!allowedRoutes) return false;

    // Exact match or parent route match (e.g., '/admin/dashboard/admission' matches '/admin/dashboard')
    return allowedRoutes.some(
        (allowedRoute) =>
            route === allowedRoute || route.startsWith(allowedRoute + '/')
    );
};
