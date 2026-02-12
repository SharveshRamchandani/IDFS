import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { getMe, updateMe } from "@/lib/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function UserProfile() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const fetchUser = async () => {
        try {
            const data = await getMe();
            setUser(data);
            setFormData({
                full_name: data.full_name,
                email: data.email,
                password: "",
                confirmPassword: ""
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleUpdate = async () => {
        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const updates: any = {};
            if (formData.full_name !== user.full_name) updates.full_name = formData.full_name;
            if (formData.email !== user.email) updates.email = formData.email;
            if (formData.password) updates.password = formData.password;

            if (Object.keys(updates).length === 0) {
                setIsEditing(false);
                return;
            }

            await updateMe(updates);
            toast.success("Profile updated successfully");
            setIsEditing(false);
            fetchUser();
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Error loading profile</div>;

    return (
        <DashboardLayout title="My Profile">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Profile Information</CardTitle>
                        <Dialog open={isEditing} onOpenChange={setIsEditing}>
                            <DialogTrigger asChild>
                                <Button variant="outline">Edit Profile</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>
                                        Update your personal information. Leave password blank to keep it unchanged.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="password" className="text-right">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="confirm" className="text-right">Confirm</Label>
                                        <Input
                                            id="confirm"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleUpdate}>Save Changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
