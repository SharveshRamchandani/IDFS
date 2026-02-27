import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  IconTrendingUp, IconCalendar, IconTarget, IconDownload,
  IconCheck, IconAlertCircle, IconX
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
  LineChart,
  ComposedChart,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { forecastingApi } from "@/lib/forecastingApi";
import { getGlobalForecast, getSalesDates } from "@/lib/api";
import { DateRange } from "react-day-picker";
import { exportToCSV } from "@/lib/exportCsv";

type SeasonalView = "overall" | "week" | "month";

const SEASONAL_VIEW_CONFIG: Record<SeasonalView, {
  label: string;
  description: string;
  dataKey: string;
  xFormatter: (d: string) => string;
  dot: boolean;
}> = {
  overall: {
    label: "Overall Trend",
    description: "Long-term direction of demand",
    dataKey: "trend",
    xFormatter: (d) => new Date(d).toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
    dot: false,
  },
  week: {
    label: "Weekly Seasonality",
    description: "Pattern of demand throughout the week",
    dataKey: "weekly",
    xFormatter: (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short" }),
    dot: true,
  },
  month: {
    label: "Monthly Seasonality",
    description: "Pattern of demand throughout the year",
    dataKey: "yearly",
    xFormatter: (d) => new Date(d).toLocaleDateString("en-US", { month: "short" }),
    dot: false,
  },
};

function formatDateLabel(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function DemandForecast() {
  const [seasonalView, setSeasonalView] = useState<SeasonalView>("overall");
  const [showHistory, setShowHistory] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Date range state — undefined means "use preset"
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Preset days — used when dateRange is not set
  const [presetDays, setPresetDays] = useState("90");

  // Fetch a wide window (365 days) once; all filtering is local — no re-fetches on date change
  const { data, isLoading, error } = useQuery({
    queryKey: ["global-forecast-wide", showHistory],
    queryFn: () => getGlobalForecast(365, false, showHistory),
  });

  const { data: accuracyData, isLoading: accuracyLoading, error: accuracyError } = useQuery({
    queryKey: ["forecast-accuracy"],
    queryFn: forecastingApi.getAccuracy,
  });

  const { data: seasonalData, isLoading: seasonalLoading } = useQuery({
    queryKey: ["global-forecast-detailed"],
    queryFn: () => forecastingApi.getGlobalForecast(365, true),
  });

  // ── All raw forecast rows ──────────────────────────────────────────────
  const allForecast: any[] = data?.forecast ?? [];

  // ── Fetch actual sales dates directly from the DB (not from the ML model)
  // This always reflects live data, regardless of the ML training cutoff.
  const { data: salesDatesRaw } = useQuery({
    queryKey: ["sales-dates"],
    queryFn: getSalesDates,
    staleTime: 60_000, // Re-fetch every minute
  });

  const salesDates = useMemo<Date[]>(() => {
    if (!salesDatesRaw) return [];
    return salesDatesRaw.map((d) => new Date(d + "T00:00:00"));
  }, [salesDatesRaw]);

  // ── Effective viewing window ───────────────────────────────────────────
  const effectiveRange = useMemo<{ from: Date; to: Date }>(() => {
    const today = new Date();
    if (dateRange?.from && dateRange?.to) {
      return { from: dateRange.from, to: dateRange.to };
    }
    const futureDays = parseInt(presetDays);
    const from = new Date(today);
    from.setDate(from.getDate() - 90);
    const to = new Date(today);
    to.setDate(to.getDate() + futureDays);
    return { from, to };
  }, [dateRange, presetDays]);

  // ── Chart data filtered to the active window ───────────────────────────
  const chartData = useMemo(() => {
    const { from, to } = effectiveRange;
    return allForecast.filter((r) => {
      const d = new Date(r.ds);
      return d >= from && d <= to;
    });
  }, [allForecast, effectiveRange]);

  const today = new Date();

  // ── KPI: predicted future demand inside the window ────────────────────
  const totalDemand = allForecast
    .filter((item: any) => new Date(item.ds) > today && new Date(item.ds) <= effectiveRange.to)
    .reduce((sum: number, item: any) => sum + (item.yhat || 0), 0);

  // ── Accuracy metrics ──────────────────────────────────────────────────
  const metrics = accuracyData?.metrics;
  const mapeValue = metrics
    ? typeof metrics.MAPE === "string"
      ? parseFloat(metrics.MAPE.replace("%", ""))
      : metrics.MAPE || 0
    : 0;
  const accuracyScore = Math.max(0, Math.min(100, 100 - mapeValue));

  // ── Seasonal chart data ───────────────────────────────────────────────
  const seasonalComponents = seasonalData?.components;
  const seasonalChartDataMap: Record<SeasonalView, any[]> = {
    overall: seasonalComponents?.trend ?? [],
    week: seasonalComponents?.weekly?.slice(0, 7) ?? [],
    month: seasonalComponents?.yearly ?? [],
  };
  const seasonalConfig = SEASONAL_VIEW_CONFIG[seasonalView];
  const seasonalChartData = seasonalChartDataMap[seasonalView];

  const clearRange = () => setDateRange(undefined);
  const isCustomRange = !!(dateRange?.from && dateRange?.to);

  return (
    <DashboardLayout title="Demand Forecast">
      <div className="space-y-4">

        {/* ── Controls bar ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">ML-Powered Demand Predictions</h2>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading predictions..." : "Using Facebook Prophet model"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* History toggle */}
            <div className="flex items-center space-x-2">
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

            {/* ── Custom date-range picker ─────────────────────────────── */}
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`gap-2 min-w-[220px] justify-start ${isCustomRange ? "border-primary/60 bg-primary/5" : ""}`}
                >
                  <IconCalendar className="h-4 w-4 shrink-0" />
                  {isCustomRange ? (
                    <span className="truncate text-sm">
                      {formatDateLabel(dateRange!.from)} → {formatDateLabel(dateRange!.to)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">Pick custom date range</span>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="end">
                {/* Quick presets row */}
                <div className="p-3 border-b flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Quick presets
                  </span>
                  {["30", "60", "90"].map((d) => (
                    <Badge
                      key={d}
                      variant={!isCustomRange && presetDays === d ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => { setPresetDays(d); clearRange(); setCalendarOpen(false); }}
                    >
                      {d}d
                    </Badge>
                  ))}
                  {isCustomRange && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto h-6 px-2 text-xs gap-1"
                      onClick={clearRange}
                    >
                      <IconX className="h-3 w-3" /> Clear
                    </Button>
                  )}
                </div>

                {/* Calendar legend */}
                <div className="px-3 pt-2 pb-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                    Days with sales data
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                    Today
                  </span>
                </div>

                {/* Range calendar with sales-data dots */}
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    if (range?.from && range?.to) setCalendarOpen(false);
                  }}
                  numberOfMonths={2}
                  modifiers={{ hasSalesData: salesDates }}
                  modifiersClassNames={{ hasSalesData: "has-sales-dot" }}
                  className="p-3"
                />
              </PopoverContent>
            </Popover>

            {/* Preset quick-select (hidden when a custom range is active) */}
            {!isCustomRange && (
              <Select value={presetDays} onValueChange={(v) => { setPresetDays(v); clearRange(); }}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Next 30 days</SelectItem>
                  <SelectItem value="60">Next 60 days</SelectItem>
                  <SelectItem value="90">Next 90 days</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button variant="outline" onClick={() =>
              exportToCSV("demand_forecast", chartData.map((r: any) => ({
                Date: r.ds,
                Forecast: r.yhat != null ? Math.round(r.yhat) : "",
                "Actual Sales": r.y != null ? Math.round(r.y) : "",
                "Upper Bound": r.yhat_upper != null ? Math.round(r.yhat_upper) : "",
                "Lower Bound": r.yhat_lower != null ? Math.round(r.yhat_lower) : "",
              })))
            } disabled={chartData.length === 0}>
              <IconDownload className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Active custom range banner */}
        {isCustomRange && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconCalendar className="h-4 w-4" />
            Showing:{" "}
            <span className="font-medium text-foreground">
              {formatDateLabel(dateRange!.from)} — {formatDateLabel(dateRange!.to)}
            </span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearRange}>
              <IconX className="h-3 w-3 mr-1" /> Clear range
            </Button>
            <Badge variant="secondary">{chartData.length} data points</Badge>
          </div>
        )}

        {/* ── ROW 1: KPI cards + Forecast chart ─────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.5fr_2fr]">

          {/* Left — KPI cards */}
          <div className="flex flex-col gap-4">
            <Card className="bg-sidebar-background flex-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Predicted Demand</CardDescription>
                <IconTrendingUp className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(totalDemand).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isCustomRange
                    ? `${formatDateLabel(dateRange!.from)} → ${formatDateLabel(dateRange!.to)}`
                    : `Next ${presetDays} days`}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-sidebar-background flex-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Model Status</CardDescription>
                <IconTarget className="h-5 w-5 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data ? "Active" : "Loading..."}</div>
                <p className="text-xs text-muted-foreground mt-1">{data?.method || "Prophet"}</p>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>Sales Data Points</CardDescription>
                <IconCalendar className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesDates.length.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Days with historical data</p>
              </CardContent>
            </Card>
          </div>

          {/* Right — Main forecast chart */}
          <Card>
            <CardHeader>
              <CardTitle>Demand Forecast with Confidence Intervals</CardTitle>
              <CardDescription>
                {isCustomRange
                  ? `Custom range: ${formatDateLabel(dateRange!.from)} → ${formatDateLabel(dateRange!.to)}`
                  : `Predicted demand vs Actual History (next ${presetDays} days)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[340px]">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Loading Data...
                  </div>
                ) : error ? (
                  <div className="flex h-full items-center justify-center text-destructive">
                    Failed to load forecast data
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <IconCalendar className="h-8 w-8 opacity-40" />
                    <p>No data in selected date range.</p>
                    <Button variant="outline" size="sm" onClick={clearRange}>Reset range</Button>
                  </div>
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
                        tickFormatter={(d) =>
                          new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                        }
                        minTickGap={30}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(d) =>
                          new Date(d).toLocaleDateString(undefined, {
                            weekday: "short", day: "numeric", month: "short", year: "numeric"
                          })
                        }
                        formatter={(value: number, name: string) => [
                          Math.round(value).toLocaleString(),
                          name === "y" ? "Actual Sales" : name,
                        ]}
                      />
                      <Legend />
                      {/* "Today" reference line */}
                      <ReferenceLine
                        x={today.toISOString().split("T")[0]}
                        stroke="hsl(var(--warning))"
                        strokeDasharray="4 2"
                        label={{
                          value: "Today",
                          position: "insideTopRight",
                          fontSize: 11,
                          fill: "hsl(var(--warning))",
                        }}
                      />
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
                        stroke="hsl(var(--success))"
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

        {/* ── ROW 2: Seasonal chart + Accuracy cards ─────────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{seasonalConfig.label}</CardTitle>
                <CardDescription className="mt-1">{seasonalConfig.description}</CardDescription>
              </div>
              <Select value={seasonalView} onValueChange={(v) => setSeasonalView(v as SeasonalView)}>
                <SelectTrigger className="w-44 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall Trend</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {seasonalLoading ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Loading trend data...
                  </div>
                ) : seasonalChartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No data available for this view.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={seasonalChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="ds"
                        tickFormatter={seasonalConfig.xFormatter}
                        minTickGap={seasonalView === "week" ? 0 : 30}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(d) => new Date(d).toLocaleDateString()}
                        formatter={(value: number) => [value.toFixed(2), seasonalConfig.label]}
                      />
                      <Line
                        key={seasonalView}
                        type="monotone"
                        dataKey={seasonalConfig.dataKey}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={seasonalConfig.dot ? { r: 4 } : false}
                        isAnimationActive={true}
                        name={seasonalConfig.label}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <div>
            {accuracyLoading ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Loading accuracy metrics...
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
              <div className="grid grid-cols-2 gap-4 h-full">
                <Card className="flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
                    <IconCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="text-2xl font-bold">{accuracyScore.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">100% − MAPE</p>
                    <Progress value={accuracyScore} className="mt-3" />
                  </CardContent>
                </Card>

                <Card className="flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">MAPE</CardTitle>
                    <IconCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="text-2xl font-bold">{metrics?.MAPE}</div>
                    <p className="text-xs text-muted-foreground">Mean Abs. % Error</p>
                  </CardContent>
                </Card>

                <Card className="flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">RMSE</CardTitle>
                    <IconCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="text-2xl font-bold">
                      {metrics?.RMSE != null
                        ? typeof metrics.RMSE === "number" ? metrics.RMSE.toFixed(2) : metrics.RMSE
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">Root Mean Sq. Error</p>
                  </CardContent>
                </Card>

                <Card className="flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">MAE</CardTitle>
                    <IconCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="text-2xl font-bold">
                      {metrics?.MAE != null
                        ? typeof metrics.MAE === "number" ? metrics.MAE.toFixed(2) : metrics.MAE
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">Mean Absolute Error</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* ── ROW 3: Evaluation Details ─────────────────────────────────── */}
        {accuracyData && accuracyData.status !== "not_evaluated" && metrics && (
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Details</CardTitle>
              <CardDescription>
                Performance metrics calculated using cross-validation on historical data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>MAPE (Mean Absolute Percentage Error):</strong> The average percentage
                  difference between predicted and actual values. Lower is better.
                </p>
                <p>
                  <strong>RMSE (Root Mean Squared Error):</strong> Standard deviation of the
                  prediction errors. Penalizes large errors more heavily.
                </p>
                <p>
                  <strong>MAE (Mean Absolute Error):</strong> The average absolute difference
                  between predicted and actual values.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
}
