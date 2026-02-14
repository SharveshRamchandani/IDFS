import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  IconCamera,
  IconLock,
  IconMail,
  IconBell,
  IconShieldLock,
  IconUserPlus,
  IconDotsVertical,
} from "@tabler/icons-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const [notifications, setNotifications] = useState({
    emailSms: true,
    lowStock: true,
    orderUpdates: false,
    reports: true,
    loginAlerts: true,
    doNotDisturb: false,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    activityLog: true,
  });

  const [dndTime, setDndTime] = useState({ from: "22:00", to: "07:00" });

  const teamMembers = [
    { name: "Sarah Johnson", role: "Store Manager", access: "Full Access" },
    { name: "Mike Chen", role: "Inventory Analyst", access: "View Only" },
    { name: "Emily Davis", role: "Staff", access: "View Only" },
  ];

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            "x-auth-token": token,
          },
        });

        if (response.ok) {
          const userData = await response.json();

          setProfileData({
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            phone: userData.phone || "",
            email: userData.email || "",
          });

          // If settings exist, populate them
          if (userData.settings) {
            if (userData.settings.notifications) {
              const { dndTime: savedDndTime, ...savedNotifs } = userData.settings.notifications;
              setNotifications(prev => ({ ...prev, ...savedNotifs }));
              if (savedDndTime) {
                setDndTime(savedDndTime);
              }
            }
            if (userData.settings.security) {
              setSecurity(prev => ({ ...prev, ...userData.settings.security }));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
        toast.error("Failed to load settings");
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You must be logged in to save settings");
      setLoading(false);
      return;
    }

    const payload = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      settings: {
        notifications: {
          ...notifications,
          dndTime
        },
        security
      }
    };

    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Settings saved successfully");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.msg || "Unknown error";
        toast.error(`Failed to save settings: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("An error occurred while saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Settings">
      {/* <div className="mb-6">
        <h1 className="text-2xl font-bold">General Settings</h1>
      </div> */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {profileData.firstName?.[0] || ""}{profileData.lastName?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  >
                    <IconCamera className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="link" className="text-destructive text-sm">
                  Remove photo
                </Button>

              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="flex-1"
                  />
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    ✓ Verified
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="flex-1 bg-muted"
                  />
                  <Button variant="outline" size="sm">
                    <IconMail className="h-4 w-4 mr-2" />
                    Change Email
                  </Button>
                </div>
              </div>
              <div className="flex gap-3 w-full justify-end">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account & Security */}
          <Card>
            <CardHeader>
              <CardTitle>Account & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Password */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                </div>
                <Button variant="outline" size="sm">
                  <IconLock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>

              <Separator />

              {/* Manage Devices */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Manage Logged Devices</p>
                </div>
                <Button variant="link" className="text-primary">
                  View all active logins
                </Button>
              </div>

              <Separator />

              {/* 2FA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Two-Factor Authentication (2FA)</p>
                  <IconShieldLock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Switch
                  checked={security.twoFactor}
                  onCheckedChange={(checked) => setSecurity({ ...security, twoFactor: checked })}
                />
              </div>
              <p className="text-sm text-muted-foreground">Extra security via OTP/email</p>

              <Separator />

              {/* Login Alerts */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Login Alerts</p>
                  <IconBell className="h-4 w-4 text-muted-foreground" />
                </div>
                <Switch
                  checked={security.loginAlerts}
                  onCheckedChange={(checked) => setSecurity({ ...security, loginAlerts: checked })}
                />
              </div>
              <p className="text-sm text-muted-foreground">Notify on new/unfamiliar logins</p>
              <div className="flex gap-3 w-full justify-end">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notification Channels */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notification Channels</p>
                  <p className="text-sm text-muted-foreground">Email & SMS</p>
                </div>
                <Switch
                  checked={notifications.emailSms}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailSms: checked })}
                />
              </div>

              <Separator />

              {/* Low Stock Alerts */}
              <div className="flex items-center justify-between">
                <p className="font-medium">Low Stock Alerts</p>
                <Switch
                  checked={notifications.lowStock}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
                />
              </div>

              <Separator />

              {/* Order Updates */}
              <div className="flex items-center justify-between">
                <p className="font-medium">Order Updates</p>
                <Switch
                  checked={notifications.orderUpdates}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, orderUpdates: checked })}
                />
              </div>

              <Separator />

              {/* Reports */}
              <div className="flex items-center justify-between">
                <p className="font-medium">Weekly Reports</p>
                <Switch
                  checked={notifications.reports}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, reports: checked })}
                />
              </div>

              <Separator />

              {/* Login Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Login Alerts</p>
                  <p className="text-sm text-muted-foreground">Notify on new/unfamiliar logins</p>
                </div>
                <Switch
                  checked={notifications.loginAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, loginAlerts: checked })}
                />
              </div>

              <Separator />

              {/* Do Not Disturb */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Do Not Disturb</p>
                    <p className="text-sm text-muted-foreground">Mute notifications during set hours</p>
                  </div>
                  <Switch
                    checked={notifications.doNotDisturb}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, doNotDisturb: checked })}
                  />
                </div>
                {notifications.doNotDisturb && (
                  <div className="flex items-center gap-4 pl-4">
                    <div className="flex items-center gap-2">
                      <Label>From:</Label>
                      <Input
                        type="time"
                        value={dndTime.from}
                        onChange={(e) => setDndTime({ ...dndTime, from: e.target.value })}
                        className="w-28"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>To:</Label>
                      <Input
                        type="time"
                        value={dndTime.to}
                        onChange={(e) => setDndTime({ ...dndTime, to: e.target.value })}
                        className="w-28"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full justify-end">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Team Permissions */}
              <div>
                <p className="font-medium mb-1">Data Access Permissions</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Set permissions to other team members in your organization
                </p>
                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select defaultValue={member.access}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full Access">Full Access</SelectItem>
                            <SelectItem value="View Only">View Only</SelectItem>
                            <SelectItem value="No Access">No Access</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon">
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2">
                    <IconUserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Activity Log */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Activity Log</p>
                  <p className="text-sm text-muted-foreground">Track actions like logins or exports</p>
                </div>
                <Switch
                  checked={security.activityLog}
                  onCheckedChange={(checked) => setSecurity({ ...security, activityLog: checked })}
                />
              </div>

              <Separator />

              {/* Export Format */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export Data Format</p>
                  <p className="text-sm text-muted-foreground">Download inventory or reports</p>
                </div>
                <Select defaultValue="pdf">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">XLSX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Privacy Policy */}
              <div className="flex items-center justify-between">
                <p className="font-medium">Privacy Policy & Terms</p>
                <Button variant="link" className="text-primary">
                  View legal documents
                </Button>
              </div>

              <div className="flex gap-3 w-full justify-end">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions
      <div className="mt-6 flex items-center justify-between border-t pt-6">
       
        <div className="flex gap-3">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div> */}
    </DashboardLayout>
  );
}
