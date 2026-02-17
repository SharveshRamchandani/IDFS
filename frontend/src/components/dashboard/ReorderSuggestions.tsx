import { IconPackage, IconRefresh, IconShoppingCart, IconArrowRight } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReorderItem {
  id: string;
  name: string;
  sku: string;
  suggestedQty: number;
  confidence: number;
  reason: string;
  supplier: string;
}

const reorderSuggestions: ReorderItem[] = [
  { id: "1", name: "KALLAX Shelf Unit", sku: "SKU-001234", suggestedQty: 150, confidence: 94, reason: "High demand forecast", supplier: "Nordic Supply Co." },
  { id: "2", name: "MALM Bed Frame", sku: "SKU-002345", suggestedQty: 80, confidence: 89, reason: "Seasonal trend", supplier: "Euro Furniture Ltd." },
  { id: "3", name: "LACK Side Table", sku: "SKU-003456", suggestedQty: 200, confidence: 87, reason: "Below safety stock", supplier: "Nordic Supply Co." },
  { id: "4", name: "BILLY Bookcase", sku: "SKU-004567", suggestedQty: 120, confidence: 82, reason: "Promotional campaign", supplier: "Global Wood Partners" },
];

export function ReorderSuggestions() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <IconRefresh className="h-5 w-5 text-primary" />
            Reorder Recommendations
          </CardTitle>
          <CardDescription>AI-powered suggestions based on demand forecasting</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View All
          <IconArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reorderSuggestions.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
            
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {item.confidence}% confidence
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>{item.sku}</span>
                  <span>•</span>
                  <span>{item.reason}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Supplier: {item.supplier}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-primary">{item.suggestedQty}</div>
                <div className="text-sm text-muted-foreground">units</div>
              </div>
              <Button size="sm">
                <IconShoppingCart className="mr-2 h-4 w-4" />
                Order
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
