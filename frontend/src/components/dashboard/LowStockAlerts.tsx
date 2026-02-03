import { IconAlertTriangle, IconArrowRight } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  threshold: number;
  category: string;
  urgency: "critical" | "warning" | "low";
}

const lowStockItems: LowStockItem[] = [
  { id: "1", name: "KALLAX Shelf Unit", sku: "SKU-001234", currentStock: 5, threshold: 50, category: "Storage", urgency: "critical" },
  { id: "2", name: "MALM Bed Frame", sku: "SKU-002345", currentStock: 12, threshold: 40, category: "Bedroom", urgency: "critical" },
  { id: "3", name: "LACK Side Table", sku: "SKU-003456", currentStock: 23, threshold: 60, category: "Living Room", urgency: "warning" },
  { id: "4", name: "BILLY Bookcase", sku: "SKU-004567", currentStock: 35, threshold: 80, category: "Storage", urgency: "warning" },
  { id: "5", name: "POÄNG Armchair", sku: "SKU-005678", currentStock: 18, threshold: 35, category: "Living Room", urgency: "low" },
];

const urgencyStyles = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning-foreground border-warning/20",
  low: "bg-info/10 text-info border-info/20",
};

const urgencyLabels = {
  critical: "Critical",
  warning: "Warning",
  low: "Low",
};

export function LowStockAlerts() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <IconAlertTriangle className="h-5 w-5 text-warning" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription>Products requiring immediate attention</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View All
          <IconArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lowStockItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{item.name}</span>
                  <Badge variant="outline" className={urgencyStyles[item.urgency]}>
                    {urgencyLabels[item.urgency]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>{item.sku}</span>
                  <span>•</span>
                  <span>{item.category}</span>
                </div>
              </div>
              <div className="text-right shrink-0 w-32">
                <div className="text-sm font-medium">
                  {item.currentStock} / {item.threshold}
                </div>
                <Progress 
                  value={(item.currentStock / item.threshold) * 100} 
                  className="h-2 mt-1"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
