import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getMe } from "@/lib/api";

export default function UserProfile() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        getMe().then(setUser);
    }, []);

    if (!user) return <div>Loading...</div>;

    return (
        <DashboardLayout title="My Profile">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="/avatars/user.jpg" />
                            <AvatarFallback className="text-xl">{user.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold">{user.full_name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium capitalize">
                                {user.role}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
