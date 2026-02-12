import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { getGlobalForecast, getSalesTrend } from "@/lib/api";

export function SalesTrendChart() {
  const [period, setPeriod] = useState("30");
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      getGlobalForecast(parseInt(period), false),
      getSalesTrend(parseInt(period))
    ]).then(([forecastRes, salesRes]) => {

      const historyData = Array.isArray(salesRes) ? salesRes.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: item.quantity,
        forecast: null,
        timestamp: new Date(item.date).getTime()
      })) : [];

      const forecastData = (forecastRes && forecastRes.forecast) ? forecastRes.forecast.map((item: any) => ({
        date: new Date(item.ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: null,
        forecast: Math.round(item.yhat || 0),
        timestamp: new Date(item.ds).getTime()
      })) : [];

      // Combine and sort by date
      const combined = [...historyData, ...forecastData].sort((a, b) => a.timestamp - b.timestamp);

      // Remove duplicates if any (Prophet might return history)
      // For now, naive merge is fine as long as ranges don't overlap strangely

      setData(combined);
    }).catch(console.error);
  }, [period]);

  return (
    <Card className="col-span-full xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sales vs Forecast</CardTitle>
          <CardDescription>Daily comparison of actual sales and forecasted demand</CardDescription>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="60">Last 60 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
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
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number, name: string) => [Math.round(value).toLocaleString(), name]}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorForecast)"
                name="Forecast"
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSales)"
                name="Actual Sales"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
