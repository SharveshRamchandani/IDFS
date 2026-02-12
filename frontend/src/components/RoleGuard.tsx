import { ReactNode } from 'react';
import { useRBAC, Role } from '@/hooks/useRBAC';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: Role[];
    fallback?: ReactNode;
    showError?: boolean;
}

/**
 * RoleGuard Component - Conditional rendering based on user role
 * 
 * Usage:
 * <RoleGuard allowedRoles={['admin', 'store_manager']}>
 *   <AdminOnlyContent />
 * </RoleGuard>
 */
export function RoleGuard({
    children,
    allowedRoles,
    fallback,
    showError = true
}: RoleGuardProps) {
    const { hasRole } = useRBAC();

    if (!hasRole(allowedRoles)) {
        if (fallback) {
            return <>{fallback}</>;
        }

        if (!showError) {
            return null;
        }

        return (
            <Alert variant="destructive" className="my-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                    You don't have permission to view this content.
                    <br />
                    <span className="text-xs mt-1 opacity-75">
                        Required roles: {allowedRoles.join(', ')}
                    </span>
                </AlertDescription>
            </Alert>
        );
    }

    return <>{children}</>;
}
