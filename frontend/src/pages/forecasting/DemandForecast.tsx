import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconTrendingUp, IconCalendar, IconTarget, IconDownload } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Line,
  ComposedChart,
  CartesianGrid
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { forecastingApi } from "@/lib/forecastingApi";
import { getGlobalForecast } from "@/lib/api";

export default function DemandForecast() {
  const [timeframe, setTimeframe] = useState("30");
  const [showHistory, setShowHistory] = useState(true);

  const { data, isLoading, error } = useQuery({
    queryKey: ['global-forecast', timeframe, showHistory],
    queryFn: () => getGlobalForecast(parseInt(timeframe), false, showHistory)
  });

  const forecastData = data?.forecast || [];

  // Filter for chart: If showing history, we might want to limit how far back 
  // or just show all. Let's show last 90 days of history + forecast.
  const chartData = showHistory
    ? forecastData.slice(- (parseInt(timeframe) + 90))
    : forecastData;

  const totalDemand = forecastData
    .filter((item: any) => new Date(item.ds) > new Date()) // Only sum future
    .reduce((sum: any, item: any) => sum + (item.yhat || 0), 0);

  return (
    <DashboardLayout title="Demand Forecast">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">ML-Powered Demand Predictions</h2>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading predictions..." : "Using Facebook Prophet model"}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center space-x-2 mr-4">
              <Checkbox
                id="history"
                checked={showHistory}
                onCheckedChange={(checked) => setShowHistory(checked === true)}
              />
              <label
                htmlFor="history"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show Historical Actuals
              </label>
            </div>

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Next 30 days</SelectItem>
                <SelectItem value="60">Next 60 days</SelectItem>
                <SelectItem value="90">Next 90 days</SelectItem>
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
          <Card className="bg-sidebar-background">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Predicted Total Demand</CardDescription>
              <IconTrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(totalDemand).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Next {timeframe} days</p>
            </CardContent>
          </Card>

          {/* Placeholder for confidence - difficult to get single number without evaluation */}
          <Card className="bg-sidebar-background">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Model Status</CardDescription>
              <IconTarget className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data ? "Active" : "Loading..."}</div>
              <p className="text-xs text-muted-foreground mt-1">{data?.method || "Prophet"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Forecast Horizon</CardDescription>
              <IconCalendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timeframe} Days</div>
              <p className="text-xs text-muted-foreground mt-1">Future projection</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Demand Forecast with Confidence Intervals</CardTitle>
            <CardDescription>Predicted demand vs Actual History</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">Loading Data...</div>
              ) : error ? (
                <div className="flex h-full items-center justify-center text-red-500">Failed to load forecast data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorConfidenceBand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="ds"
                      tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      minTickGap={30}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(d) => new Date(d).toLocaleDateString()}
                      formatter={(value: number, name: string) => [Math.round(value), name === "y" ? "Actual Sales" : name]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="yhat_upper"
                      stroke="transparent"
                      fill="url(#colorConfidenceBand)"
                      name="Upper Bound"
                    />
                    <Area
                      type="monotone"
                      dataKey="yhat_lower"
                      stroke="transparent"
                      fill="hsl(var(--background))"
                      name="Lower Bound"
                    />
                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke="hsl(var(--success))" // Green for actual
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      name="Actual Sales"
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="yhat"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      name="Forecast"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
