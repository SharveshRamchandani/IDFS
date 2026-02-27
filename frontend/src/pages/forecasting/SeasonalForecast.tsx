import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { forecastingApi } from "@/lib/forecastingApi";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@tabler/icons-react";
import { exportToCSV } from "@/lib/exportCsv";
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine,
} from "recharts";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function insightBadge(val: number, mean: number) {
    const pct = ((val - mean) / Math.abs(mean || 1)) * 100;
    if (pct > 10) return <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-[10px]">+{pct.toFixed(0)}% above avg</Badge>;
    if (pct < -10) return <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px]">{pct.toFixed(0)}% below avg</Badge>;
    return <Badge variant="outline" className="text-[10px]">Near average</Badge>;
}

export default function SeasonalForecast() {
    const { data, isLoading } = useQuery({
        queryKey: ["global-forecast-detailed"],
        queryFn: () => forecastingApi.getGlobalForecast(365, true),
    });

    if (isLoading) {
        return (
            <DashboardLayout title="Seasonal Analysis">
                <div className="flex h-96 items-center justify-center text-muted-foreground animate-pulse">
                    Loading seasonal components…
                </div>
            </DashboardLayout>
        );
    }

    const components = data?.components;

    if (!components) {
        return (
            <DashboardLayout title="Seasonal Analysis">
                <Card>
                    <CardContent className="pt-6 text-muted-foreground">
                        No seasonal components available. Ensure the model is trained with seasonality enabled.
                    </CardContent>
                </Card>
            </DashboardLayout>
        );
    }

    // ── Weekly bar data ──────────────────────────────────────────────────────
    const weeklyRaw: { ds: string; weekly: number }[] = components.weekly?.slice(0, 7) ?? [];
    const weeklyData = weeklyRaw.map((d, i) => ({
        day: DAY_NAMES[new Date(d.ds).getDay()] ?? `D${i}`,
        value: d.weekly,
    }));
    const weeklyMean = weeklyData.reduce((s, d) => s + d.value, 0) / (weeklyData.length || 1);
    const peakDay = weeklyData.reduce((a, b) => a.value > b.value ? a : b, weeklyData[0]);
    const troughDay = weeklyData.reduce((a, b) => a.value < b.value ? a : b, weeklyData[0]);

    // ── Monthly bar data ─────────────────────────────────────────────────────
    const yearlyRaw: { ds: string; yearly: number }[] = components.yearly ?? [];
    // Group by month (take first occurrence of each month)
    const monthMap = new Map<string, number>();
    yearlyRaw.forEach(d => {
        const m = MONTH_NAMES[new Date(d.ds).getMonth()];
        if (m && !monthMap.has(m)) monthMap.set(m, d.yearly);
    });
    const monthlyData = MONTH_NAMES
        .filter(m => monthMap.has(m))
        .map(m => ({ month: m, value: monthMap.get(m)! }));
    const monthlyMean = monthlyData.reduce((s, d) => s + d.value, 0) / (monthlyData.length || 1);
    const peakMonth = monthlyData.reduce((a, b) => a.value > b.value ? a : b, monthlyData[0]);
    const troughMonth = monthlyData.reduce((a, b) => a.value < b.value ? a : b, monthlyData[0]);

    // ── Trend line data ───────────────────────────────────────────────────────
    const trendData = (components.trend ?? []).map((d: { ds: string; trend: number }) => ({
        ds: new Date(d.ds).toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
        trend: d.trend,
    })).filter((_: unknown, i: number) => i % 7 === 0); // sample every 7th point for performance

    return (
        <DashboardLayout title="Seasonal Analysis">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Seasonal Analysis</h2>
                        <p className="text-muted-foreground mt-1">Decomposed demand patterns across weekly and yearly cycles.</p>
                    </div>
                    <Button variant="outline" onClick={() => exportToCSV("seasonal_patterns", [
                        ...weeklyData.map(d => ({ Type: "Weekly", Label: d.day, "Seasonal Effect": d.value.toFixed(4) })),
                        ...monthlyData.map(d => ({ Type: "Monthly", Label: d.month, "Seasonal Effect": d.value.toFixed(4) })),
                        ...trendData.map(d => ({ Type: "Trend", Label: d.ds, "Seasonal Effect": d.trend.toFixed(4) })),
                    ])} disabled={weeklyData.length === 0}>
                        <IconDownload className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                {/* ── KPI insight cards ───────────────────────────────────── */}
                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        { label: "Peak Day", value: peakDay?.day, sub: `Highest weekly demand` },
                        { label: "Slowest Day", value: troughDay?.day, sub: `Lowest weekly demand` },
                        { label: "Peak Month", value: peakMonth?.month, sub: `Strongest seasonal month` },
                        { label: "Slow Month", value: troughMonth?.month, sub: `Weakest seasonal month` },
                    ].map(card => (
                        <Card key={card.label}>
                            <CardHeader className="pb-2">
                                <CardDescription>{card.label}</CardDescription>
                                <CardTitle className="text-2xl">{card.value ?? "—"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">{card.sub}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* ── Weekly seasonality bar chart ── */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Demand Pattern</CardTitle>
                            <CardDescription>Day-of-week seasonal effect on demand</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-56">
                                {weeklyData.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">No weekly data.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 11 }} />
                                            <Tooltip formatter={(v: number) => [v.toFixed(2), "Seasonal Effect"]} />
                                            <ReferenceLine y={weeklyMean} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: "avg", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                            {/* Day-level insights */}
                            {weeklyData.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {weeklyData.map(d => (
                                        <div key={d.day} className="flex items-center gap-1.5 text-xs">
                                            <span className="font-medium w-7">{d.day}</span>
                                            {insightBadge(d.value, weeklyMean)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── Monthly seasonality bar chart ── */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Demand Pattern</CardTitle>
                            <CardDescription>Month-of-year seasonal effect on demand</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-56">
                                {monthlyData.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">No yearly data.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} />
                                            <Tooltip formatter={(v: number) => [v.toFixed(2), "Seasonal Effect"]} />
                                            <ReferenceLine y={monthlyMean} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: "avg", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                                            <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Long-term trend ── */}
                {trendData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Long-Term Demand Trend</CardTitle>
                            <CardDescription>Overall direction of demand after removing seasonality</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="ds" minTickGap={40} tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip labelFormatter={d => d} formatter={(v: number) => [v.toFixed(1), "Trend"]} />
                                        <Line type="monotone" dataKey="trend" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
