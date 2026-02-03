import { IconArrowRight, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  sku: string;
  sales: number;
  trend: number;
  category: string;
}

const fastMovingProducts: Product[] = [
  { id: "1", name: "KALLAX Shelf Unit", sku: "SKU-001234", sales: 1247, trend: 23, category: "Storage" },
  { id: "2", name: "MALM Dresser", sku: "SKU-002345", sales: 892, trend: 18, category: "Bedroom" },
  { id: "3", name: "LACK Coffee Table", sku: "SKU-003456", sales: 756, trend: 12, category: "Living Room" },
  { id: "4", name: "BILLY Bookcase", sku: "SKU-004567", sales: 634, trend: 8, category: "Storage" },
  { id: "5", name: "ALEX Drawer Unit", sku: "SKU-005678", sales: 521, trend: 15, category: "Office" },
];

const slowMovingProducts: Product[] = [
  { id: "1", name: "LISABO Table", sku: "SKU-101234", sales: 23, trend: -15, category: "Dining" },
  { id: "2", name: "NORRÅKER Bench", sku: "SKU-102345", sales: 34, trend: -12, category: "Dining" },
  { id: "3", name: "MÖRBYLÅNGA Table", sku: "SKU-103456", sales: 45, trend: -8, category: "Dining" },
  { id: "4", name: "GAMLARED Table", sku: "SKU-104567", sales: 56, trend: -5, category: "Dining" },
  { id: "5", name: "LERHAMN Chair", sku: "SKU-105678", sales: 67, trend: -3, category: "Dining" },
];

interface ProductListProps {
  title: string;
  description: string;
  products: Product[];
  type: "fast" | "slow";
}

function ProductList({ title, description, products, type }: ProductListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {type === "fast" ? (
              <IconTrendingUp className="h-5 w-5 text-success" />
            ) : (
              <IconTrendingDown className="h-5 w-5 text-destructive" />
            )}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View All
          <IconArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product, index) => (
            <div key={product.id} className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{product.name}</div>
                <div className="text-sm text-muted-foreground">{product.category}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{product.sales} units</div>
                <Badge 
                  variant="outline" 
                  className={type === "fast" ? "text-success border-success/30" : "text-destructive border-destructive/30"}
                >
                  {product.trend > 0 ? "+" : ""}{product.trend}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TopProducts() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ProductList 
        title="Fast Moving Products" 
        description="Top sellers this month"
        products={fastMovingProducts}
        type="fast"
      />
      <ProductList 
        title="Slow Moving Products" 
        description="Consider promotions or markdowns"
        products={slowMovingProducts}
        type="slow"
      />
    </div>
  );
}
