import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconBox, IconTrash, IconTag, IconPackage, IconDownload } from "@tabler/icons-react";
import { exportToCSV } from "@/lib/exportCsv";
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
import { useEffect, useState } from "react";
import { getDeadStock } from "@/lib/api";

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
  const [deadStockItems, setItems] = useState<DeadStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeadStock().then(data => {
      // Transform data if needed, but the API should match
      setItems(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

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
                {deadStockItems.length > 0
                  ? Math.round(deadStockItems.reduce((acc, item) => acc + item.daysWithoutSale, 0) / deadStockItems.length)
                  : 0}
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
              <Button variant="outline" onClick={() => exportToCSV("dead_stock", deadStockItems.map(i => ({
                SKU: i.sku,
                Product: i.name,
                Category: i.category,
                Quantity: i.quantity,
                "Last Sold": i.lastSold,
                "Days Without Sale": i.daysWithoutSale,
                "Tied-up Value ($)": i.value,
                Recommendation: recommendationLabels[i.recommendation],
              })))} disabled={deadStockItems.length === 0}>
                <IconDownload className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
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
                {loading ? <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow> :
                  deadStockItems.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center">No dead stock found.</TableCell></TableRow> :
                    deadStockItems.map((item) => (
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
