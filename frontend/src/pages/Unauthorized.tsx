import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconLock, IconHome } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultDashboard } from "@/lib/rbac";

export default function UnauthorizedPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleGoHome = () => {
        const defaultPath = getDefaultDashboard(user?.role);
        navigate(defaultPath);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <IconLock className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">Access Denied</CardTitle>
                    <CardDescription className="mt-2">
                        You don't have permission to access this page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted p-4 text-sm">
                        <p className="text-muted-foreground">
                            Your current role: <span className="font-medium capitalize text-foreground">{user?.role || "Unknown"}</span>
                        </p>
                        <p className="mt-2 text-muted-foreground">
                            Contact your administrator if you believe you should have access to this page.
                        </p>
                    </div>
                    <Button onClick={handleGoHome} className="w-full gap-2">
                        <IconHome className="h-4 w-4" />
                        Go to Dashboard
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
