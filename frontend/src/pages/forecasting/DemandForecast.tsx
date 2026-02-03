import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconTrendingUp, IconCalendar, IconTarget, IconDownload } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  Line,
  ComposedChart,
  Bar
} from "recharts";

const forecastData = [
  { month: "Jan", actual: 4500, forecast: 4200, lower: 3800, upper: 4600 },
  { month: "Feb", actual: 5200, forecast: 5000, lower: 4600, upper: 5400 },
  { month: "Mar", actual: 4800, forecast: 4600, lower: 4200, upper: 5000 },
  { month: "Apr", actual: 5800, forecast: 5500, lower: 5100, upper: 5900 },
  { month: "May", actual: 6200, forecast: 6000, lower: 5600, upper: 6400 },
  { month: "Jun", actual: 5900, forecast: 5700, lower: 5300, upper: 6100 },
  { month: "Jul", actual: null, forecast: 6800, lower: 6200, upper: 7400 },
  { month: "Aug", actual: null, forecast: 7200, lower: 6600, upper: 7800 },
  { month: "Sep", actual: null, forecast: 6500, lower: 5900, upper: 7100 },
  { month: "Oct", actual: null, forecast: 8100, lower: 7400, upper: 8800 },
  { month: "Nov", actual: null, forecast: 9500, lower: 8700, upper: 10300 },
  { month: "Dec", actual: null, forecast: 11200, lower: 10200, upper: 12200 },
];

const categoryForecast = [
  { category: "Storage", current: 12500, predicted: 14200, growth: 13.6 },
  { category: "Bedroom", current: 9800, predicted: 10500, growth: 7.1 },
  { category: "Living Room", current: 8200, predicted: 9100, growth: 11.0 },
  { category: "Office", current: 6500, predicted: 8200, growth: 26.2 },
  { category: "Dining", current: 4300, predicted: 4100, growth: -4.7 },
  { category: "Kitchen", current: 5600, predicted: 5900, growth: 5.4 },
];

export default function DemandForecast() {
  const [timeframe, setTimeframe] = useState("12m");
  const [category, setCategory] = useState("all");

  return (
    <DashboardLayout title="Demand Forecast">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">ML-Powered Demand Predictions</h2>
            <p className="text-sm text-muted-foreground">Forecast based on historical sales, seasonal patterns, and market trends</p>
          </div>
          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
                <SelectItem value="bedroom">Bedroom</SelectItem>
                <SelectItem value="living">Living Room</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Next 3 months</SelectItem>
                <SelectItem value="6m">Next 6 months</SelectItem>
                <SelectItem value="12m">Next 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="bg-gradient-to-t from-primary/5 to-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Predicted Total Demand</CardDescription>
              <IconTrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$89,500</div>
              <p className="text-xs text-muted-foreground mt-1">Next 6 months</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-t from-success/5 to-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Model Confidence</CardDescription>
              <IconTarget className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground mt-1">Based on MAPE score</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Peak Demand Period</CardDescription>
              <IconCalendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Nov - Dec</div>
              <p className="text-xs text-muted-foreground mt-1">Holiday season surge</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Demand Forecast with Confidence Intervals</CardTitle>
            <CardDescription>Actual sales vs. predicted demand with upper/lower bounds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConfidenceBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number | null) => value ? [value.toLocaleString(), ""] : ["-", ""]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="transparent"
                    fill="url(#colorConfidenceBand)"
                    name="Upper Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="transparent"
                    fill="hsl(var(--background))"
                    name="Lower Bound"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "hsl(var(--primary))", r: 3 }}
                    name="Forecast"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                    name="Actual"
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>Category-wise Forecast</CardTitle>
            <CardDescription>Predicted demand growth by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryForecast.map((cat) => (
                <div key={cat.category} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="w-28 font-medium">{cat.category}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Current: {cat.current.toLocaleString()}</span>
                      <span className="text-sm font-medium">Predicted: {cat.predicted.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${Math.min((cat.predicted / 15000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cat.growth >= 0 ? "text-success border-success/30" : "text-destructive border-destructive/30"}
                  >
                    {cat.growth >= 0 ? "+" : ""}{cat.growth}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
