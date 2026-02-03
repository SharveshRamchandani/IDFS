import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconSearch, IconFilter, IconDownload, IconPlus, IconPackage } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  availableStock: number;
  threshold: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  location: string;
  lastUpdated: string;
}

const products: Product[] = [
  { id: "1", name: "KALLAX Shelf Unit, White", sku: "SKU-001234", category: "Storage", availableStock: 245, threshold: 50, status: "in-stock", location: "A-12-3", lastUpdated: "2024-01-15" },
  { id: "2", name: "MALM Bed Frame, Black", sku: "SKU-002345", category: "Bedroom", availableStock: 12, threshold: 40, status: "low-stock", location: "B-08-1", lastUpdated: "2024-01-14" },
  { id: "3", name: "LACK Side Table, Oak", sku: "SKU-003456", category: "Living Room", availableStock: 0, threshold: 60, status: "out-of-stock", location: "C-04-2", lastUpdated: "2024-01-13" },
  { id: "4", name: "BILLY Bookcase, White", sku: "SKU-004567", category: "Storage", availableStock: 156, threshold: 80, status: "in-stock", location: "A-15-1", lastUpdated: "2024-01-15" },
  { id: "5", name: "POÄNG Armchair, Birch", sku: "SKU-005678", category: "Living Room", availableStock: 18, threshold: 35, status: "low-stock", location: "D-02-4", lastUpdated: "2024-01-12" },
  { id: "6", name: "ALEX Drawer Unit", sku: "SKU-006789", category: "Office", availableStock: 89, threshold: 30, status: "in-stock", location: "E-09-2", lastUpdated: "2024-01-15" },
  { id: "7", name: "HEMNES Dresser, Gray", sku: "SKU-007890", category: "Bedroom", availableStock: 34, threshold: 25, status: "in-stock", location: "B-11-3", lastUpdated: "2024-01-14" },
  { id: "8", name: "BESTA TV Unit, Black", sku: "SKU-008901", category: "Living Room", availableStock: 5, threshold: 40, status: "low-stock", location: "C-07-1", lastUpdated: "2024-01-13" },
  { id: "9", name: "IVAR Shelving Unit", sku: "SKU-009012", category: "Storage", availableStock: 67, threshold: 50, status: "in-stock", location: "A-18-2", lastUpdated: "2024-01-15" },
  { id: "10", name: "SÖDERHAMN Sofa, Beige", sku: "SKU-010123", category: "Living Room", availableStock: 23, threshold: 20, status: "in-stock", location: "D-05-1", lastUpdated: "2024-01-11" },
];

const statusStyles = {
  "in-stock": "bg-success/10 text-success border-success/20",
  "low-stock": "bg-warning/10 text-warning-foreground border-warning/20",
  "out-of-stock": "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
};

export default function InventoryList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    const matchesStatus = status === "all" || product.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <DashboardLayout title="Inventory Management">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Products</CardDescription>
              <CardTitle className="text-2xl">{products.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Low Stock Items</CardDescription>
              <CardTitle className="text-2xl text-warning">{products.filter(p => p.status === "low-stock").length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Out of Stock</CardDescription>
              <CardTitle className="text-2xl text-destructive">{products.filter(p => p.status === "out-of-stock").length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>Manage and track all products across categories</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <IconDownload className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button size="sm">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-6 sm:flex-row">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <IconPackage className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{product.availableStock}</span>
                            <span className="text-xs text-muted-foreground">/ {product.threshold}</span>
                          </div>
                          <Progress 
                            value={Math.min((product.availableStock / product.threshold) * 100, 100)} 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[product.status]}>
                          {statusLabels[product.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.location}</TableCell>
                      <TableCell className="text-muted-foreground">{product.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
