import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconBell,
  IconDotsVertical,
  IconSearch,
  IconStar,
  IconStarFilled,
  IconClipboard,
  IconTrash,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/lib/api";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isFavorite: boolean;
  isArchived: boolean;
}



export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: apiNotifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/dashboard/notifications`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    }
  });

  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  // Update local state when API data changes
  useEffect(() => {
    if (apiNotifications.length > 0) {
      setLocalNotifications(apiNotifications);
    }
  }, [apiNotifications]);

  const notifications = localNotifications.length > 0 ? localNotifications : (apiNotifications || []);


  const toggleFavorite = (id: string) => {
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch = n.message.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "archive") return matchesSearch && n.isArchived;
    if (activeTab === "favorite") return matchesSearch && n.isFavorite;
    return matchesSearch && !n.isArchived;
  });

  const allCount = notifications.filter((n) => !n.isArchived).length;
  const archiveCount = notifications.filter((n) => n.isArchived).length;
  const favoriteCount = notifications.filter((n) => n.isFavorite).length;

  return (
    <DashboardLayout title="Notifications">
      <Card className="w-full overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <IconBell className="size-6" />
            <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
          </div>
          <Button variant="ghost" size="icon">
            <IconDotsVertical className="size-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Count and Search */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {notifications.length} Notification
            </p>
            <div className="relative w-full sm:w-64">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Name Product"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
              <TabsTrigger value="all" className="gap-2">
                <Badge >
                  {allCount}
                </Badge>
                All
              </TabsTrigger>
              <TabsTrigger value="archive" className="gap-2">
                {archiveCount} Archive
              </TabsTrigger>
              <TabsTrigger value="favorite" className="gap-2">
                {favoriteCount} Favorite
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-1">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 rounded-lg p-2 sm:p-3 transition-colors cursor-pointer min-w-0",
                      !notification.isRead
                        ? "bg-destructive/5 hover:bg-destructive/10"
                        : "hover:bg-muted/50"
                    )}
                  >
                    {/* Unread indicator */}
                    <div
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        !notification.isRead ? "bg-primary" : "bg-transparent"
                      )}
                    />

                    {/* Favorite toggle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(notification.id);
                      }}
                    >
                      {notification.isFavorite ? (
                        <IconStarFilled className="size-4 text-yellow-500" />
                      ) : (
                        <IconStar className="size-4 text-muted-foreground" />
                      )}
                    </Button>

                    {/* Clipboard icon - hidden on mobile */}
                    <Button variant="ghost" size="icon" className="size-8 shrink-0 hidden sm:flex">
                      <IconClipboard className="size-4 text-muted-foreground" />
                    </Button>

                    {/* Message */}
                    <p className="flex-1 truncate text-sm min-w-0">{notification.message}</p>

                    {/* Timestamp */}
                    <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {notification.timestamp}
                    </span>

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                ))}

                {filteredNotifications.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No notifications found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
