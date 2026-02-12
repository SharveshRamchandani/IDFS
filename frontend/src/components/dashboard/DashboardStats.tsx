import { IconTrendingUp, IconTrendingDown, IconPackage, IconAlertTriangle, IconShoppingCart, IconTruck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "warning" | "success" | "danger";
}

export function StatCard({ title, value, description, trend, icon: Icon, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "from-primary/5 to-card",
    warning: "from-warning/10 to-card",
    success: "from-success/10 to-card",
    danger: "from-destructive/10 to-card",
  };

  return (
    <Card className={`@container/card bg-gradient-to-t ${variantStyles[variant]} shadow-sm`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-sm font-semibold text-gray-700">{title}</CardDescription>
        <Icon className="h-5 w-5 text-gray-700" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-extrabold tabular-nums @[200px]/card:text-3xl text-gray-900">{value}</div>
            {description && (
              <p className="text-xs text-gray-600 mt-1 font-medium">{description}</p>
            )}
          </div>
          {trend && (
            <Badge variant="outline" className={trend.isPositive ? "text-success border-success/30" : "text-destructive border-destructive/30"}>
              {trend.isPositive ? (
                <IconTrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <IconTrendingDown className="mr-1 h-3 w-3" />
              )}
              {trend.isPositive ? "+" : ""}{trend.value}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((data) => {
        setStats(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load dashboard stats:", err);
        setError(err.message || "Failed to load stats");
      })
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="col-span-full p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-semibold">⚠️ Error loading dashboard data</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <p className="text-gray-600 text-xs mt-2">
          Make sure the backend is running and you're logged in. Check browser console for details.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Products"
        value={stats?.summary?.total_products || "..."}
        description="Active SKUs"
        icon={IconPackage}
      />
      <StatCard
        title="Total Stores"
        value={stats?.summary?.total_stores || "..."}
        description="Active locations"
        icon={IconAlertTriangle}
      />
      <StatCard
        title="Daily Avg Sales"
        value={stats ? Math.round(stats.avg_daily_sales).toLocaleString() : "..."}
        description="Units per day"
        trend={{ value: 12, isPositive: true }}
        icon={IconShoppingCart}
      />
      <StatCard
        title="Total Revenue"
        value={stats ? `$${(stats.total_revenue / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k` : "..."}
        description="All time"
        variant="success"
        icon={IconTruck}
      />
    </div>
  );
}
