import { useQuery } from "@tanstack/react-query";
import { forecastingApi } from "@/lib/forecastingApi";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IconCheck, IconAlertCircle, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";


// Letter grade based on MAPE
function getGrade(mape: number): { grade: string; color: string; label: string } {
    if (mape < 5) return { grade: "A+", color: "text-green-500", label: "Excellent" };
    if (mape < 10) return { grade: "A", color: "text-green-400", label: "Very Good" };
    if (mape < 15) return { grade: "B", color: "text-blue-400", label: "Good" };
    if (mape < 25) return { grade: "C", color: "text-yellow-500", label: "Acceptable" };
    if (mape < 40) return { grade: "D", color: "text-orange-500", label: "Poor" };
    return { grade: "F", color: "text-red-500", label: "Needs Retraining" };
}

export default function ForecastAccuracy() {
    const { data: accuracyData, isLoading: accLoading, error } = useQuery({
        queryKey: ["forecast-accuracy"],
        queryFn: forecastingApi.getAccuracy,
    });

    // Pull forecast data to build predicted vs actual chart
    const { data: forecastData, isLoading: fcLoading } = useQuery({
        queryKey: ["global-forecast-90"],
        queryFn: () => forecastingApi.getGlobalForecast(90),
    });

    const isLoading = accLoading || fcLoading;

    if (isLoading) {
        return (
            <DashboardLayout title="Forecast Accuracy">
                <div className="flex h-96 items-center justify-center text-muted-foreground animate-pulse">
                    Loading validation metrics…
                </div>
            </DashboardLayout>
        );
    }

    if (error || !accuracyData) {
        return (
            <DashboardLayout title="Forecast Accuracy">
                <Alert variant="destructive">
                    <IconAlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Failed to load accuracy metrics. {(error as Error)?.message}</AlertDescription>
                </Alert>
            </DashboardLayout>
        );
    }

    if (accuracyData.status === "not_evaluated") {
        return (
            <DashboardLayout title="Forecast Accuracy">
                <Alert>
                    <IconAlertCircle className="h-4 w-4" />
                    <AlertTitle>Not Evaluated Yet</AlertTitle>
                    <AlertDescription>{accuracyData.message ?? "Run an evaluation to see accuracy metrics."}</AlertDescription>
                </Alert>
            </DashboardLayout>
        );
    }

    const metrics = accuracyData.metrics!;

    const mapeValue = typeof metrics.MAPE === "string"
        ? parseFloat(metrics.MAPE.replace("%", ""))
        : (metrics.MAPE || 0);
    const accuracyScore = Math.max(0, Math.min(100, 100 - mapeValue));
    const grade = getGrade(mapeValue);

    // Build predicted vs actual chart from forecast data
    // forecastData.forecast contains { ds, yhat, yhat_lower, yhat_upper, y? }
    const chartData = (forecastData?.forecast ?? [])
        .filter((d): d is typeof d & { y: number } =>
            d.y !== undefined && d.y !== null
        )
        .map((d) => ({
            date: new Date(d.ds).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            Actual: Math.round(d.y),
            Predicted: Math.round(d.yhat),
            error: Math.abs(d.y - d.yhat),
        }))
        .slice(-60); // last 60 data points with actuals

    const kpiCards = [
        {
            title: "Model Accuracy",

            value: `${accuracyScore.toFixed(1)}%`,
            sub: "100% − MAPE",
            icon: <IconCheck className="h-4 w-4 text-muted-foreground" />,
            progress: accuracyScore,
            progressColor: accuracyScore > 85 ? "bg-green-500" : accuracyScore > 70 ? "bg-yellow-500" : "bg-red-500",
        },
        {
            title: "MAPE",
            value: metrics.MAPE,
            sub: "Mean Abs. % Error",
            icon: mapeValue < 15
                ? <IconTrendingUp className="h-4 w-4 text-green-500" />
                : <IconTrendingDown className="h-4 w-4 text-red-500" />,
        },
        {
            title: "RMSE",
            value: metrics.RMSE != null ? Number(metrics.RMSE).toFixed(2) : "N/A",
            sub: "Root Mean Squared Error",
            icon: <IconCheck className="h-4 w-4 text-muted-foreground" />,
        },
        {
            title: "MAE",
            value: metrics.MAE != null ? Number(metrics.MAE).toFixed(2) : "N/A",
            sub: "Mean Absolute Error",
            icon: <IconCheck className="h-4 w-4 text-muted-foreground" />,
        },
    ];

    return (
        <DashboardLayout title="Forecast Accuracy">
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Forecast Accuracy</h2>
                        <p className="text-muted-foreground mt-1">Cross-validation metrics from historical data.</p>
                    </div>
                    {/* Letter grade badge */}
                    <div className="flex flex-col items-center rounded-xl border bg-card px-6 py-3 shadow-sm">
                        <span className={`text-5xl font-black ${grade.color}`}>{grade.grade}</span>
                        <Badge variant="outline" className="mt-1 text-xs">{grade.label}</Badge>
                    </div>
                </div>

                {/* KPI cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {kpiCards.map(card => (
                        <Card key={card.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                {card.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
                                {card.progress !== undefined && (
                                    <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${card.progressColor}`}
                                            style={{ width: `${card.progress}%` }}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Predicted vs Actual chart */}
                {chartData.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Predicted vs Actual Demand</CardTitle>
                            <CardDescription>
                                Comparing model predictions against real historical sales — last {chartData.length} data points with actuals.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" minTickGap={20} tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{ fontSize: 12 }}
                                            formatter={(v: number, name: string) => [v.toLocaleString(), name]}
                                        />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Line type="monotone" dataKey="Actual" stroke="#94a3b8" strokeWidth={1.5} dot={false} />
                                        <Line type="monotone" dataKey="Predicted" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Predicted vs Actual Demand</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Historical actuals not available in the forecast data. Chart will appear once the model has been evaluated with actuals.
                        </CardContent>
                    </Card>
                )}

                {/* Metric explanations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Metric Definitions</CardTitle>
                        <CardDescription>How each score is calculated and what it means.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
                        <div className="rounded-lg border p-3">
                            <p className="font-semibold text-foreground mb-1">MAPE</p>
                            Average % error between predicted and actual. &lt;10% is excellent, &gt;25% suggests retraining.
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="font-semibold text-foreground mb-1">RMSE</p>
                            Penalizes large errors heavily. Lower is better. Compare against the scale of your demand values.
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="font-semibold text-foreground mb-1">MAE</p>
                            Average absolute error in the same units as demand. Easier to interpret than RMSE.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
