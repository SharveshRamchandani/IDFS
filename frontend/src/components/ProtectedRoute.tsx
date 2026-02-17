import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasAccess, getDefaultDashboard } from "@/lib/rbac";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredCategory?: "dashboards" | "inventory" | "forecasting" | "supplyChain" | "admin" | "notifications";
    requiredFeature?: string;
    fallbackPath?: string;
}

export function ProtectedRoute({
    children,
    requiredCategory,
    requiredFeature,
    fallbackPath,
}: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();

    // Show nothing while loading
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If no specific permission required, just check authentication
    if (!requiredCategory) {
        return <>{children}</>;
    }

    // Check if user has required permission
    const userHasAccess = hasAccess(user?.role, requiredCategory, requiredFeature);

    if (!userHasAccess) {
        // Redirect to fallback or default dashboard
        const redirectPath = fallbackPath || getDefaultDashboard(user?.role);
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
}
