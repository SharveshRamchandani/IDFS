import { useAuth } from '@/contexts/AuthContext';

export type Role = 'admin' | 'store_manager' | 'inventory_analyst' | 'staff' | 'user';

/**
 * RBAC Hook - Role-Based Access Control
 * 
 * Permissions:
 * - admin              → Full access to everything
 * - store_manager      → Inventory management + Forecast
 * - inventory_analyst  → Analytics + Forecast (read-only)
 * - staff              → Basic inventory view
 * - user               → Dashboard only
 */
export function useRBAC() {
    const { user } = useAuth();

    const hasRole = (roles: Role | Role[]): boolean => {
        if (!user || !user.role) return false;

        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        return allowedRoles.includes(user.role as Role);
    };

    // Individual role checks
    const isAdmin = () => hasRole('admin');
    const isStoreManager = () => hasRole('store_manager');
    const isAnalyst = () => hasRole('inventory_analyst');
    const isStaff = () => hasRole('staff');
    const isUser = () => hasRole('user');

    // Permission-based checks
    const canManageUsers = () => hasRole('admin');

    const canManageInventory = () => hasRole(['admin', 'store_manager']);

    const canViewForecast = () => hasRole(['admin', 'store_manager', 'inventory_analyst']);

    const canViewAnalytics = () => hasRole(['admin', 'inventory_analyst']);

    const canViewInventory = () => hasRole(['admin', 'store_manager', 'inventory_analyst', 'staff']);

    return {
        // Role checks
        hasRole,
        isAdmin,
        isStoreManager,
        isAnalyst,
        isStaff,
        isUser,

        // Permission checks
        canManageUsers,
        canManageInventory,
        canViewForecast,
        canViewAnalytics,
        canViewInventory,

        // Current user role
        userRole: user?.role as Role | undefined,
    };
}
