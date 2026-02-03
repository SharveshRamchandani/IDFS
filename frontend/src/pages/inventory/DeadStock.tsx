import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconBox, IconTrash, IconTag, IconPackage } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DeadStockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  lastSold: string;
  daysWithoutSale: number;
  value: number;
  recommendation: "markdown" | "clearance" | "dispose";
}

const deadStockItems: DeadStockItem[] = [
  { id: "1", name: "LISABO Table, Ash", sku: "SKU-101234", category: "Dining", quantity: 45, lastSold: "2023-09-15", daysWithoutSale: 120, value: 8500, recommendation: "markdown" },
  { id: "2", name: "NORRÅKER Bench, Birch", sku: "SKU-102345", category: "Dining", quantity: 23, lastSold: "2023-08-20", daysWithoutSale: 145, value: 3200, recommendation: "clearance" },
  { id: "3", name: "MÖRBYLÅNGA Table, Oak", sku: "SKU-103456", category: "Dining", quantity: 12, lastSold: "2023-07-10", daysWithoutSale: 186, value: 9600, recommendation: "clearance" },
  { id: "4", name: "GAMLARED Table, Light", sku: "SKU-104567", category: "Dining", quantity: 34, lastSold: "2023-10-05", daysWithoutSale: 100, value: 4200, recommendation: "markdown" },
  { id: "5", name: "LERHAMN Chair Set", sku: "SKU-105678", category: "Dining", quantity: 67, lastSold: "2023-06-15", daysWithoutSale: 210, value: 5600, recommendation: "dispose" },
  { id: "6", name: "ODGER Chair, Blue", sku: "SKU-106789", category: "Office", quantity: 28, lastSold: "2023-08-01", daysWithoutSale: 165, value: 2800, recommendation: "clearance" },
];

const recommendationStyles = {
  markdown: "bg-warning/10 text-warning-foreground border-warning/20",
  clearance: "bg-info/10 text-info border-info/20",
  dispose: "bg-destructive/10 text-destructive border-destructive/20",
};

const recommendationLabels = {
  markdown: "Price Markdown",
  clearance: "Clearance Sale",
  dispose: "Consider Disposal",
};

export default function DeadStock() {
  const totalValue = deadStockItems.reduce((acc, item) => acc + item.value, 0);
  const totalUnits = deadStockItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <DashboardLayout title="Dead Stock Analysis">
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Dead Stock Items</CardDescription>
              <CardTitle className="text-2xl">{deadStockItems.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Units</CardDescription>
              <CardTitle className="text-2xl">{totalUnits}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-destructive">Tied-up Capital</CardDescription>
              <CardTitle className="text-2xl text-destructive">${totalValue.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Days Without Sale</CardDescription>
              <CardTitle className="text-2xl">
                {Math.round(deadStockItems.reduce((acc, item) => acc + item.daysWithoutSale, 0) / deadStockItems.length)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Dead Stock Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconBox className="h-5 w-5 text-muted-foreground" />
                Dead Stock Inventory
              </CardTitle>
              <CardDescription>Products with no or minimal movement over extended periods</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <IconTag className="mr-2 h-4 w-4" />
                Create Promotion
              </Button>
              <Button variant="destructive">
                <IconTrash className="mr-2 h-4 w-4" />
                Write Off Selected
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Last Sold</TableHead>
                  <TableHead>Days Stale</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deadStockItems.map((item) => (
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
                    <TableCell className="font-medium">{item.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{item.lastSold}</TableCell>
                    <TableCell>
                      <span className={item.daysWithoutSale > 150 ? "text-destructive font-medium" : "text-warning-foreground"}>
                        {item.daysWithoutSale} days
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">${item.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={recommendationStyles[item.recommendation]}>
                        {recommendationLabels[item.recommendation]}
                      </Badge>
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
