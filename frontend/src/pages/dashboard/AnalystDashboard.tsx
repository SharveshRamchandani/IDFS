import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconTrendingUp, IconTrendingDown, IconChartBar, IconCalendar, IconTarget, IconRefresh } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Line
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { getGlobalForecast, getTrainingStatus, triggerTraining, getDashboardStats } from "@/lib/api";

export default function AnalystDashboard() {
  const [timeRange, setTimeRange] = useState("30"); // days
  const [chartData, setChartData] = useState([]);
  const [trainingStatus, setTrainingStatus] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll Training Status + Stats
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await getTrainingStatus();
        setTrainingStatus(status);
      } catch (e) {
        console.error("Failed to check status", e);
      }
    };
    checkStatus();

    // Initial Stats Load
    getDashboardStats().then(setStats).catch(console.error);

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Forecast
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getGlobalForecast(parseInt(timeRange), true); // Get detailed

        // Transform for Recharts
        // Backend returns: [{ds: '2022-01-01', yhat: 100, yhat_lower: 90, ...}]

        const transformed = data.forecast.map((item: any) => ({
          date: new Date(item.ds).toLocaleDateString(),
          forecast: Math.round(item.yhat),
          lower: Math.round(item.yhat_lower),
          upper: Math.round(item.yhat_upper),
          actual: null // We don't have actuals for future dates yet in this API response, unless we change backend
        }));

        setChartData(transformed);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load forecast data. Model might not be trained.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange, trainingStatus?.is_training]); // Reload when training finishes?

  const handleRetrain = async () => {
    try {
      await triggerTraining(true); // Auto-tune
      // Status polling will pick it up
    } catch (e) {
      alert("Failed to start training");
    }
  }

  // Dynamic KPI Data
  const kpiData = [
    { title: "Total Revenue", value: stats ? `$${(stats.total_revenue / 1000).toFixed(1)}k` : "...", trend: 0, icon: IconTarget, description: "All time" },
    { title: "Avg Daily Sales", value: stats ? Math.round(stats.avg_daily_sales) : "...", trend: 0, icon: IconTrendingUp, description: "Units per day" },
    { title: "Total Units", value: stats ? stats.total_quantity.toLocaleString() : "...", trend: 0, icon: IconChartBar, description: "Sold" },
    { title: "Active Stores", value: stats ? stats.top_stores?.length || 0 : "...", trend: 0, icon: IconCalendar, description: "Reporting" },
  ];

  return (
    <DashboardLayout title="Inventory Analyst Dashboard">
      <div className="space-y-6">

        {/* Training Status Alert */}
        {trainingStatus?.is_training && (
          <Alert className="bg-blue-500/10 border-blue-500/50 text-blue-500">
            <IconRefresh className="h-4 w-4 animate-spin" />
            <AlertTitle>Model Training in Progress</AlertTitle>
            <AlertDescription>
              The AI is currently optimizing hyperparameters. This may take a few minutes.
            </AlertDescription>
          </Alert>
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Demand Forecast</h2>
            <p className="text-muted-foreground">AI-driven predictions using Prophet</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleRetrain} disabled={trainingStatus?.is_training}>
              {trainingStatus?.is_training ? "Training..." : "Retrain Model (Auto-Tune)"}
            </Button>
          </div>
        </div>

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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Forecast Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Global Sales Forecast</CardTitle>
              <CardDescription>Predicted sales for next {timeRange} days</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="h-[350px] flex items-center justify-center text-destructive">
                {error}
              </div>
            ) : loading ? (
              <div className="h-[350px] flex items-center justify-center">
                Loading Forecast...
              </div>
            ) : (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={30}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
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
                      stackId="1"
                      stroke="transparent"
                      fill="none"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stackId="2"
                      stroke="transparent"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.1}
                      name="Confidence Interval"
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      name="Forecast"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
