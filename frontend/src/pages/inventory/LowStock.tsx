import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconAlertTriangle, IconShoppingCart, IconPackage } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  threshold: number;
  reorderQty: number;
  supplier: string;
  urgency: "critical" | "warning" | "low";
}

const lowStockItems: LowStockItem[] = [
  { id: "1", name: "KALLAX Shelf Unit, White", sku: "SKU-001234", category: "Storage", currentStock: 5, threshold: 50, reorderQty: 100, supplier: "Nordic Supply Co.", urgency: "critical" },
  { id: "2", name: "MALM Bed Frame, Black", sku: "SKU-002345", category: "Bedroom", currentStock: 12, threshold: 40, reorderQty: 60, supplier: "Euro Furniture Ltd.", urgency: "critical" },
  { id: "3", name: "LACK Side Table, Oak", sku: "SKU-003456", category: "Living Room", currentStock: 0, threshold: 60, reorderQty: 120, supplier: "Nordic Supply Co.", urgency: "critical" },
  { id: "4", name: "BESTA TV Unit, Black", sku: "SKU-008901", category: "Living Room", currentStock: 5, threshold: 40, reorderQty: 80, supplier: "Global Wood Partners", urgency: "critical" },
  { id: "5", name: "POÄNG Armchair, Birch", sku: "SKU-005678", category: "Living Room", currentStock: 18, threshold: 35, reorderQty: 50, supplier: "Nordic Supply Co.", urgency: "warning" },
  { id: "6", name: "BILLY Bookcase, White", sku: "SKU-004567", category: "Storage", currentStock: 35, threshold: 80, reorderQty: 100, supplier: "Euro Furniture Ltd.", urgency: "warning" },
];

const urgencyStyles = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning-foreground border-warning/20",
  low: "bg-info/10 text-info border-info/20",
};

export default function LowStock() {
  const criticalCount = lowStockItems.filter(i => i.urgency === "critical").length;
  const warningCount = lowStockItems.filter(i => i.urgency === "warning").length;

  return (
    <DashboardLayout title="Low Stock Items">
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-destructive">Critical (Out of Stock)</CardDescription>
              <CardTitle className="text-2xl text-destructive">{criticalCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-warning/5 border-warning/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-warning-foreground">Warning (Below Threshold)</CardDescription>
              <CardTitle className="text-2xl text-warning-foreground">{warningCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Items Needing Attention</CardDescription>
              <CardTitle className="text-2xl">{lowStockItems.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Low Stock Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconAlertTriangle className="h-5 w-5 text-warning" />
                Low Stock Inventory
              </CardTitle>
              <CardDescription>Products requiring immediate reorder attention</CardDescription>
            </div>
            <Button>
              <IconShoppingCart className="mr-2 h-4 w-4" />
              Create Bulk Order
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Suggested Reorder</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <IconPackage className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-28">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.currentStock}</span>
                          <span className="text-xs text-muted-foreground">/ {item.threshold}</span>
                        </div>
                        <Progress 
                          value={(item.currentStock / item.threshold) * 100} 
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={urgencyStyles[item.urgency]}>
                        {item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-primary">{item.reorderQty} units</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.supplier}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <IconShoppingCart className="mr-2 h-4 w-4" />
                        Order
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
