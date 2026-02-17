// Role definitions matching backend
export enum UserRole {
    ADMIN = "admin",
    STORE_MANAGER = "store_manager",
    INVENTORY_ANALYST = "inventory_analyst",
    STAFF = "staff",
    USER = "user",
}

// Define what each role can access
export const rolePermissions = {
    [UserRole.ADMIN]: {
        dashboards: ["store", "analyst", "admin"],
        inventory: ["all", "low-stock", "dead-stock"],
        forecasting: ["demand", "seasonal", "accuracy"],
        supplyChain: ["orders", "shipments", "suppliers", "warehouse"],
        admin: ["users", "settings", "thresholds"],
        notifications: true,
    },
    [UserRole.STORE_MANAGER]: {
        dashboards: ["store", "analyst"],
        inventory: ["all", "low-stock", "dead-stock"],
        forecasting: ["demand", "seasonal", "accuracy"],
        supplyChain: ["orders", "shipments", "suppliers", "warehouse"],
        admin: [],
        notifications: true,
    },
    [UserRole.INVENTORY_ANALYST]: {
        dashboards: ["analyst"],
        inventory: ["all", "low-stock", "dead-stock"],
        forecasting: ["demand", "seasonal", "accuracy"],
        supplyChain: ["orders", "shipments"],
        admin: [],
        notifications: true,
    },
    [UserRole.STAFF]: {
        dashboards: ["store"],
        inventory: ["all", "low-stock"],
        forecasting: [],
        supplyChain: ["orders", "shipments"],
        admin: [],
        notifications: true,
    },
    [UserRole.USER]: {
        dashboards: [],
        inventory: ["all"],
        forecasting: [],
        supplyChain: [],
        admin: [],
        notifications: true,
    },
};

// Check if user has access to a specific feature
export function hasAccess(
    userRole: string | undefined,
    category: keyof typeof rolePermissions.admin,
    feature?: string
): boolean {
    if (!userRole) return false;

    const role = userRole as UserRole;
    const permissions = rolePermissions[role];

    if (!permissions) return false;

    const categoryPermissions = permissions[category];

    // If it's a boolean permission (like notifications)
    if (typeof categoryPermissions === "boolean") {
        return categoryPermissions;
    }

    // If checking for a specific feature within a category
    if (feature && Array.isArray(categoryPermissions)) {
        return categoryPermissions.includes(feature);
    }

    // If just checking if category has any permissions
    if (Array.isArray(categoryPermissions)) {
        return categoryPermissions.length > 0;
    }

    return false;
}

// Get allowed pages for a specific category
export function getAllowedPages(
    userRole: string | undefined,
    category: keyof typeof rolePermissions.admin
): string[] {
    if (!userRole) return [];

    const role = userRole as UserRole;
    const permissions = rolePermissions[role];

    if (!permissions) return [];

    const categoryPermissions = permissions[category];

    if (Array.isArray(categoryPermissions)) {
        return categoryPermissions;
    }

    return [];
}

// Check if user can access admin panel
export function isAdmin(userRole: string | undefined): boolean {
    return userRole === UserRole.ADMIN;
}

// Get default dashboard based on role
export function getDefaultDashboard(userRole: string | undefined): string {
    if (!userRole) return "/login";

    const role = userRole as UserRole;

    switch (role) {
        case UserRole.ADMIN:
            return "/dashboard/admin";
        case UserRole.STORE_MANAGER:
            return "/dashboard/store";
        case UserRole.INVENTORY_ANALYST:
            return "/dashboard/analyst";
        case UserRole.STAFF:
            return "/dashboard/store";
        case UserRole.USER:
            return "/inventory";
        default:
            return "/unauthorized";
    }
}
