import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconBuilding, IconUsers, IconAlertTriangle, IconTrendingUp, IconChartBar } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  Cell
} from "recharts";

const systemStats = [
  { title: "Active Stores", value: "24", icon: IconBuilding, description: "Across 5 regions" },
  { title: "Total Users", value: "156", icon: IconUsers, description: "78 online now" },
  { title: "Active Alerts", value: "12", icon: IconAlertTriangle, description: "3 critical" },
  { title: "System Health", value: "99.8%", icon: IconTrendingUp, description: "All systems operational" },
];

const regionalData = [
  { region: "North", revenue: 2450000, stores: 6, performance: 94 },
  { region: "South", revenue: 1890000, stores: 5, performance: 87 },
  { region: "East", revenue: 2120000, stores: 5, performance: 91 },
  { region: "West", revenue: 1560000, stores: 4, performance: 82 },
  { region: "Central", revenue: 2780000, stores: 4, performance: 96 },
];

const storeAlerts = [
  { store: "Stockholm Central", alert: "Low stock on 15 items", severity: "warning", time: "2 hours ago" },
  { store: "Malmö Store", alert: "System sync delayed", severity: "info", time: "4 hours ago" },
  { store: "Gothenburg West", alert: "Critical stock level - KALLAX", severity: "critical", time: "30 min ago" },
  { store: "Uppsala Store", alert: "Forecast accuracy below threshold", severity: "warning", time: "1 day ago" },
];

const severityStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning-foreground border-warning/20",
  info: "bg-info/10 text-info border-info/20",
};

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin / HQ Dashboard">
      <div className="space-y-6">
        {/* System Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {systemStats.map((stat) => (
            <Card key={stat.title} className="bg-gradient-to-t from-primary/5 to-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{stat.title}</CardDescription>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Regional Performance */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Regional Revenue</CardTitle>
              <CardDescription>Monthly revenue by region (in millions)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="region" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value / 1000000}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                      {regionalData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Store Performance</CardTitle>
              <CardDescription>Inventory health by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {regionalData.map((region) => (
                  <div key={region.region} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{region.region} Region</span>
                        <span className="text-sm text-muted-foreground ml-2">({region.stores} stores)</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          region.performance >= 90 
                            ? "text-success border-success/30" 
                            : region.performance >= 80 
                              ? "text-warning-foreground border-warning/30" 
                              : "text-destructive border-destructive/30"
                        }
                      >
                        {region.performance}%
                      </Badge>
                    </div>
                    <Progress value={region.performance} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Store Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconAlertTriangle className="h-5 w-5 text-warning" />
              System Alerts
            </CardTitle>
            <CardDescription>Recent alerts across all stores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storeAlerts.map((alert, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{alert.store}</span>
                      <Badge variant="outline" className={severityStyles[alert.severity]}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.alert}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{alert.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
