import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRBAC, Role } from '@/hooks/useRBAC';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: Role[];
}

/**
 * ProtectedRoute - Protects routes with authentication and optional RBAC
 * 
 * Usage:
 * <Route path="/admin" element={
 *   <ProtectedRoute requiredRoles={['admin']}>
 *     <AdminPage />
 *   </ProtectedRoute>
 * } />
 */
export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { hasRole } = useRBAC();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // No role requirements - just need to be authenticated
    if (!requiredRoles || requiredRoles.length === 0) {
        return <>{children}</>;
    }

    // Check if user has required role
    if (!hasRole(requiredRoles)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="max-w-md w-full">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertTitle className="text-lg font-bold">Access Denied</AlertTitle>
                        <AlertDescription className="mt-2">
                            <p className="mb-2">
                                You don't have permission to access this page.
                            </p>
                            <p className="text-sm opacity-75 mb-4">
                                Required role(s): <strong>{requiredRoles.join(', ')}</strong>
                                <br />
                                Your role: <strong>{user.role || 'unknown'}</strong>
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="w-full"
                            >
                                Go Back
                            </Button>
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
