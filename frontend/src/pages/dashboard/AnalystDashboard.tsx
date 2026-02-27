import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconRefresh } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { getGlobalForecast, getTrainingStatus, triggerTraining } from "@/lib/api";
import { DashboardStats } from "@/components/dashboard/DashboardStats";

export default function AnalystDashboard() {
  const [timeRange, setTimeRange] = useState("30"); // days
  const [chartData, setChartData] = useState([]);
  const [trainingStatus, setTrainingStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll Training Status
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
        // Backend returns: {{ forecast: [{ds: ..., yhat: ...}] }}
        if (data && data.forecast) {
          const transformed = data.forecast.map((item: any) => ({
            date: new Date(item.ds).toLocaleDateString(),
            forecast: Math.round(item.yhat || 0),
            lower: Math.round(item.yhat_lower || 0),
            upper: Math.round(item.yhat_upper || 0),
            actual: null
          }));
          setChartData(transformed);
          setError(null);
        } else {
          // Fallback if structure mismatches
          setChartData([]);
        }
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

  return (
    <DashboardLayout title="Inventory Analyst Dashboard">
      <div className="space-y-6">

        {/* Training Status Alert */}
        {trainingStatus?.is_training && (
          <Alert className="bg-info/10 border-info/50 text-info">
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
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Demand Forecast</h2>
            <p className="text-muted-foreground font-medium">AI-driven predictions using Prophet</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleRetrain} disabled={trainingStatus?.is_training}>
              {trainingStatus?.is_training ? "Training..." : "Retrain Model (Auto-Tune)"}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <DashboardStats />


        {/* Forecast Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground font-bold">Global Sales Forecast</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">Predicted sales for next {timeRange} days</CardDescription>
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
                      <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="gradConfidence" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
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
                    {/* Upper bound — invisible stroke, fills the confidence band */}
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stackId="ci"
                      stroke="transparent"
                      fill="url(#gradConfidence)"
                      name="Upper Bound"
                      legendType="none"
                    />
                    {/* Lower bound — closes the confidence band */}
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stackId="ci2"
                      stroke="#22c55e"
                      strokeDasharray="4 3"
                      strokeWidth={1}
                      fill="transparent"
                      fillOpacity={0}
                      name="Confidence Interval"
                    />
                    {/* Forecast line + fill under it */}
                    <Area
                      type="monotone"
                      dataKey="forecast"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fill="url(#gradForecast)"
                      dot={false}
                      activeDot={{ r: 5, fill: "#3b82f6" }}
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
