import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconTrendingUp, IconCalendar, IconTarget, IconDownload, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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

  const { data: accuracyData, isLoading: accuracyLoading, error: accuracyError } = useQuery({
    queryKey: ['forecast-accuracy'],
    queryFn: forecastingApi.getAccuracy
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

  // Accuracy metric calculations
  const metrics = accuracyData?.metrics;
  const mapeValue = metrics
    ? typeof metrics.MAPE === 'string'
      ? parseFloat(metrics.MAPE.replace('%', ''))
      : (metrics.MAPE || 0)
    : 0;
  const accuracyScore = Math.max(0, Math.min(100, 100 - mapeValue));

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

        {/* Forecast Accuracy Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Forecast Accuracy</h2>
          {accuracyLoading ? (
            <div className="flex h-24 items-center justify-center">
              <p className="text-muted-foreground">Loading validation metrics...</p>
            </div>
          ) : accuracyError || !accuracyData ? (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load accuracy metrics. {accuracyError?.message}
              </AlertDescription>
            </Alert>
          ) : accuracyData.status === "not_evaluated" ? (
            <Alert>
              <IconAlertCircle className="h-4 w-4" />
              <AlertTitle>Not Evaluated</AlertTitle>
              <AlertDescription>
                {accuracyData.message || "Model has not been validated yet."}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
                    <IconCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{accuracyScore.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">100% - MAPE</p>
                    <Progress value={accuracyScore} className="mt-3" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">MAPE</CardTitle>
                    <IconCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.MAPE}</div>
                    <p className="text-xs text-muted-foreground">Mean Absolute Percentage Error</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">RMSE</CardTitle>
                    <IconCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics?.RMSE !== undefined && metrics?.RMSE !== null
                        ? (typeof metrics.RMSE === 'number' ? metrics.RMSE.toFixed(2) : metrics.RMSE)
                        : 'N/A'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">Root Mean Squared Error</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">MAE</CardTitle>
                    <IconCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics?.MAE !== undefined && metrics?.MAE !== null
                        ? (typeof metrics.MAE === 'number' ? metrics.MAE.toFixed(2) : metrics.MAE)
                        : 'N/A'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">Mean Absolute Error</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Evaluation Details</CardTitle>
                  <CardDescription>
                    Performance metrics calculated using cross-validation on historical data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong>MAPE (Mean Absolute Percentage Error):</strong> The average percentage difference between predicted and actual values. Lower is better.
                    </p>
                    <p>
                      <strong>RMSE (Root Mean Squared Error):</strong> Standard deviation of the prediction errors. Penalizes large errors more heavily.
                    </p>
                    <p>
                      <strong>MAE (Mean Absolute Error):</strong> The average absolute difference between predicted and actual values.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
