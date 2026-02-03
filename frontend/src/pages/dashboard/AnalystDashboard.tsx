import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconTrendingUp, IconTrendingDown, IconChartBar, IconCalendar, IconTarget } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  Line,
  LineChart
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const forecastData = [
  { month: "Jan", actual: 4500, forecast: 4200, lower: 3900, upper: 4500 },
  { month: "Feb", actual: 5200, forecast: 5000, lower: 4700, upper: 5300 },
  { month: "Mar", actual: 4800, forecast: 4600, lower: 4300, upper: 4900 },
  { month: "Apr", actual: 5800, forecast: 5500, lower: 5200, upper: 5800 },
  { month: "May", actual: 6200, forecast: 6000, lower: 5700, upper: 6300 },
  { month: "Jun", actual: 5900, forecast: 5700, lower: 5400, upper: 6000 },
  { month: "Jul", actual: null, forecast: 6500, lower: 6100, upper: 6900 },
  { month: "Aug", actual: null, forecast: 7000, lower: 6600, upper: 7400 },
  { month: "Sep", actual: null, forecast: 6300, lower: 5900, upper: 6700 },
];

const kpiData = [
  { title: "Forecast Accuracy", value: "94.2%", trend: 2.3, icon: IconTarget, description: "Last 30 days" },
  { title: "Demand Growth", value: "+12.5%", trend: 5.1, icon: IconTrendingUp, description: "vs. last quarter" },
  { title: "Inventory Turnover", value: "8.4x", trend: -1.2, icon: IconChartBar, description: "Annual rate" },
  { title: "Service Level", value: "98.7%", trend: 0.5, icon: IconCalendar, description: "Order fulfillment" },
];

const categoryPerformance = [
  { category: "Storage", demand: 12500, growth: 15 },
  { category: "Bedroom", demand: 9800, growth: 8 },
  { category: "Living Room", demand: 8200, growth: 12 },
  { category: "Office", demand: 6500, growth: 22 },
  { category: "Dining", demand: 4300, growth: -5 },
  { category: "Kitchen", demand: 5600, growth: 3 },
];

export default function AnalystDashboard() {
  const [timeRange, setTimeRange] = useState("6m");

  return (
    <DashboardLayout title="Inventory Analyst Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiData.map((kpi) => (
            <Card key={kpi.title} className="bg-gradient-to-t from-primary/5 to-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription className="text-sm font-medium">{kpi.title}</CardDescription>
                <kpi.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
                  </div>
                  <Badge variant="outline" className={kpi.trend >= 0 ? "text-success border-success/30" : "text-destructive border-destructive/30"}>
                    {kpi.trend >= 0 ? <IconTrendingUp className="mr-1 h-3 w-3" /> : <IconTrendingDown className="mr-1 h-3 w-3" />}
                    {kpi.trend >= 0 ? "+" : ""}{kpi.trend}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Forecast Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Demand Forecast</CardTitle>
              <CardDescription>Predicted demand with confidence intervals</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 months</SelectItem>
                <SelectItem value="6m">6 months</SelectItem>
                <SelectItem value="12m">12 months</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="transparent"
                    fill="url(#colorConfidence)"
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
                    dot={false}
                    name="Forecast"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                    name="Actual"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Demand distribution by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryPerformance} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="category" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [value.toLocaleString(), "Demand"]}
                    />
                    <Bar 
                      dataKey="demand" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth by Category</CardTitle>
              <CardDescription>Year-over-year demand changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryPerformance.map((cat) => (
                  <div key={cat.category} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium">{cat.category}</div>
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div 
                          className={`h-2 rounded-full ${cat.growth >= 0 ? "bg-success" : "bg-destructive"}`}
                          style={{ width: `${Math.min(Math.abs(cat.growth) * 4, 100)}%` }}
                        />
                      </div>
                    </div>
                    <Badge variant="outline" className={cat.growth >= 0 ? "text-success border-success/30" : "text-destructive border-destructive/30"}>
                      {cat.growth >= 0 ? "+" : ""}{cat.growth}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
