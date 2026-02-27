import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconAlertTriangle, IconShoppingCart, IconPackage, IconDownload, IconSearch, IconLoader2 } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { exportToCSV } from "@/lib/exportCsv";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getInventory } from "@/lib/api";
import { useMemo, useState } from "react";

// ── urgency helpers ────────────────────────────────────────────────────────────
function getUrgency(current: number, threshold: number): "critical" | "warning" | "low" {
  if (current === 0) return "critical";
  const pct = current / threshold;
  if (pct < 0.25) return "critical";
  if (pct < 0.60) return "warning";
  return "low";
}

const urgencyStyles = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  low: "bg-blue-500/10 text-blue-700 border-blue-500/20",
};

const urgencyLabels = {
  critical: "Critical",
  warning: "Warning",
  low: "Low",
};

// ── component ─────────────────────────────────────────────────────────────────
export default function LowStock() {
  const [search, setSearch] = useState("");

  const { data: allInventory = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getInventory(),
    refetchInterval: 60_000,  // refresh every minute
  });

  // Filter to only items below threshold
  const lowStockItems = useMemo(() => {
    return (allInventory as any[]).filter(
      (item) => item.status === "low-stock" || item.status === "out-of-stock"
    );
  }, [allInventory]);

  // Client-side search
  const filtered = useMemo(() => {
    if (!search) return lowStockItems;
    const q = search.toLowerCase();
    return lowStockItems.filter(
      (item) =>
        item.sku.toLowerCase().includes(q) ||
        item.product_name.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q)
    );
  }, [lowStockItems, search]);

  const criticalCount = lowStockItems.filter((i) => getUrgency(i.availableStock, i.threshold) === "critical").length;
  const warningCount = lowStockItems.filter((i) => getUrgency(i.availableStock, i.threshold) === "warning").length;

  return (
    <DashboardLayout title="Low Stock Items">
      <div className="space-y-6">

        {/* Summary KPI cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-destructive">Critical / Out of Stock</CardDescription>
              <CardTitle className="text-2xl text-destructive">
                {isLoading ? "—" : criticalCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700">Warning (Below Threshold)</CardDescription>
              <CardTitle className="text-2xl text-amber-700">
                {isLoading ? "—" : warningCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Needing Attention</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? "—" : lowStockItems.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconAlertTriangle className="h-5 w-5 text-amber-500" />
                Low Stock Inventory
              </CardTitle>
              <CardDescription>
                Products below reorder threshold — sourced live from the database
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search SKU, product, category…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-56"
                />
              </div>
              <Button
                variant="outline"
                disabled={filtered.length === 0}
                onClick={() =>
                  exportToCSV(
                    "low_stock",
                    filtered.map((i) => ({
                      SKU: i.sku,
                      Product: i.product_name,
                      Category: i.category,
                      "Current Stock": i.availableStock,
                      Threshold: i.threshold,
                      "% of Threshold": `${Math.round((i.availableStock / i.threshold) * 100)}%`,
                      Location: i.location,
                      Status: i.status,
                      Urgency: urgencyLabels[getUrgency(i.availableStock, i.threshold)],
                      "Last Updated": i.lastUpdated,
                    }))
                  )
                }
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button>
                <IconShoppingCart className="mr-2 h-4 w-4" />
                Create Bulk Order
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-52 items-center justify-center">
                <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
                <IconPackage className="h-10 w-10 opacity-25" />
                <p>{search ? "No results match your search." : "No low stock items found — inventory looks healthy! ✅"}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => {
                    const urgency = getUrgency(item.availableStock, item.threshold);
                    const pct = Math.min((item.availableStock / item.threshold) * 100, 100);
                    return (
                      <TableRow key={item.id}>
                        {/* Product name */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                              <IconPackage className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="font-medium truncate max-w-[160px]" title={item.product_name}>
                              {item.product_name}
                            </span>
                          </div>
                        </TableCell>
                        {/* SKU */}
                        <TableCell className="text-muted-foreground font-mono text-xs">{item.sku}</TableCell>
                        {/* Category */}
                        <TableCell>
                          <Badge variant="outline">{item.category || "—"}</Badge>
                        </TableCell>
                        {/* Stock level with progress bar */}
                        <TableCell>
                          <div className="w-32">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold">{item.availableStock}</span>
                              <span className="text-xs text-muted-foreground">/ {item.threshold}</span>
                            </div>
                            <Progress
                              value={pct}
                              className={
                                urgency === "critical"
                                  ? "[&>div]:bg-destructive"
                                  : urgency === "warning"
                                    ? "[&>div]:bg-amber-500"
                                    : "[&>div]:bg-blue-500"
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-0.5">{Math.round(pct)}% of threshold</p>
                          </div>
                        </TableCell>
                        {/* Urgency badge */}
                        <TableCell>
                          <Badge variant="outline" className={urgencyStyles[urgency]}>
                            {urgencyLabels[urgency]}
                          </Badge>
                        </TableCell>
                        {/* Location */}
                        <TableCell className="text-muted-foreground text-sm">{item.location || "—"}</TableCell>
                        {/* Last Updated */}
                        <TableCell className="text-muted-foreground text-xs">{item.lastUpdated || "—"}</TableCell>
                        {/* Action */}
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <IconShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                            Order
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
