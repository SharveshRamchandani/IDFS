import { IconAlertTriangle, IconArrowRight } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { getInventory } from "@/lib/api";

export function LowStockAlerts() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // Determine low stock items on the frontend for now
    getInventory().then((inv) => {
      const lowStock = inv.filter((i: any) => i.status === 'low-stock' || i.status === 'out-of-stock');
      setItems(lowStock.slice(0, 5));
    }).catch(console.error);
  }, []);

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
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{item.product_name}</span>
                  <Badge variant="outline" className={item.status === 'out-of-stock' ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning-foreground"}>
                    {item.status}
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
                  {item.availableStock} / {item.threshold}
                </div>
                <Progress
                  value={(item.availableStock / item.threshold) * 100}
                  className="h-2 mt-1"
                />
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-muted-foreground text-center py-4">No low stock alerts.</div>}
        </div>
      </CardContent>
    </Card>
  );
}
