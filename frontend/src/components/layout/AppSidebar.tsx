import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMe } from "@/lib/api";
import { hasAccess, getAllowedPages } from "@/lib/rbac";
import {
  IconBox,
  IconChartBar,
  IconClipboardList,
  IconDashboard,
  IconPackage,
  IconSettings,
  IconTruck,
  IconUsers,
  IconBell,
  IconAlertTriangle,
  IconTrendingUp,
  IconCalendar,
  IconBuildingWarehouse,
  IconFileAnalytics,
  IconShoppingCart,
  IconUserCircle,
  IconAdjustments,
} from "@tabler/icons-react";

import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconChevronUp } from "@tabler/icons-react";

const dashboardItems = [
  { title: "Store Manager", url: "/dashboard/store", icon: IconDashboard, feature: "store" },
  { title: "Inventory Analyst", url: "/dashboard/analyst", icon: IconChartBar, feature: "analyst" },
  { title: "Admin / HQ", url: "/dashboard/admin", icon: IconUsers, feature: "admin" },
];

const inventoryItems = [
  { title: "All Products", url: "/inventory", icon: IconPackage, feature: "all" },
  { title: "Low Stock", url: "/inventory/low-stock", icon: IconAlertTriangle, feature: "low-stock" },
  { title: "Dead Stock", url: "/inventory/dead-stock", icon: IconBox, feature: "dead-stock" },
];

const forecastingItems = [
  { title: "Demand Forecast", url: "/forecasting/demand", icon: IconTrendingUp, feature: "demand" },
  { title: "Seasonal Trends", url: "/forecasting/seasonal", icon: IconCalendar, feature: "seasonal" },
  // { title: "Forecast Accuracy", url: "/forecasting/accuracy", icon: IconFileAnalytics, feature: "accuracy" },
];

const supplyChainItems = [
  { title: "Purchase Orders", url: "/supply-chain/orders", icon: IconShoppingCart, feature: "orders" },
  { title: "Inbound Shipments", url: "/supply-chain/shipments", icon: IconTruck, feature: "shipments" },
  { title: "Suppliers", url: "/supply-chain/suppliers", icon: IconClipboardList, feature: "suppliers" },
  { title: "Warehouse", url: "/dashboard/warehouse", icon: IconBuildingWarehouse, feature: "warehouse" },
];

const adminItems = [
  { title: "User Management", url: "/admin/users", icon: IconUsers, feature: "users" },
  { title: "Settings", url: "/admin/settings", icon: IconSettings, feature: "settings" },
  { title: "Threshold Rules", url: "/admin/thresholds", icon: IconAdjustments, feature: "thresholds" },
];

interface User {
  full_name: string;
  email: string;
  role: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getMe().then((data) => {
      if (data) {
        setUser(data);
      }
    }).catch(err => console.error("Failed to fetch user:", err));
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");

  // Filter menu items based on user role
  const visibleDashboards = dashboardItems.filter(item => hasAccess(user?.role, "dashboards", item.feature));
  const visibleInventory = inventoryItems.filter(item => hasAccess(user?.role, "inventory", item.feature));
  const visibleForecasting = forecastingItems.filter(item => hasAccess(user?.role, "forecasting", item.feature));
  const visibleSupplyChain = supplyChainItems.filter(item => hasAccess(user?.role, "supplyChain", item.feature));
  const visibleAdmin = adminItems.filter(item => hasAccess(user?.role, "admin", item.feature));
  const canSeeNotifications = hasAccess(user?.role, "notifications");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <a href="/dashboard/store">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconBox className="h-5 w-5" />
                </div>
                {!collapsed && (
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">IKEA Forecast</span>
                  </div>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        {visibleDashboards.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleDashboards.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {canSeeNotifications && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/notifications")}>
                      <NavLink to="/notifications">
                        <IconBell className="h-4 w-4" />
                        <span>Notifications</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleInventory.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Inventory</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleInventory.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleForecasting.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Forecasting</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleForecasting.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleSupplyChain.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Supply Chain</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleSupplyChain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleAdmin.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/user.jpg" alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user ? user.full_name.charAt(0).toUpperCase() : "G"}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <>
                      <div className="flex flex-col gap-0.5 leading-none text-left">
                        <span className="font-medium text-sm truncate">{user?.full_name || "Guest"}</span>
                        <span className="text-xs text-muted-foreground truncate capitalize">{user?.role || "Visitor"}</span>
                      </div>
                      <IconChevronUp className="ml-auto h-4 w-4" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
                side="top"
              >
                <DropdownMenuLabel>My Account ({user?.email})</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <IconUserCircle className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {/* <DropdownMenuItem onClick={() => navigate("/notifications")}>
                  <IconBell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                  <IconSettings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
