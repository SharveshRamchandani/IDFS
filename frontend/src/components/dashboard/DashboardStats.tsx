import { IconTrendingUp, IconTrendingDown, IconPackage, IconAlertTriangle, IconShoppingCart, IconTruck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold tabular-nums @[200px]/card:text-3xl">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
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
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Products"
        value="2,847"
        description="Across 12 categories"
        trend={{ value: 3.2, isPositive: true }}
        icon={IconPackage}
      />
      <StatCard
        title="Low Stock Items"
        value="24"
        description="Need reorder attention"
        trend={{ value: 8, isPositive: false }}
        icon={IconAlertTriangle}
        variant="warning"
      />
      <StatCard
        title="Pending Orders"
        value="156"
        description="Worth $234,500"
        trend={{ value: 12, isPositive: true }}
        icon={IconShoppingCart}
      />
      <StatCard
        title="Incoming Shipments"
        value="8"
        description="Arriving this week"
        icon={IconTruck}
        variant="success"
      />
    </div>
  );
}
