import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { forecastingApi } from "@/lib/forecastingApi";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

type ViewType = "overall" | "week" | "month";

const VIEW_CONFIG: Record<ViewType, {
    label: string;
    description: string;
    dataKey: string;
    color: string;
    xFormatter: (d: string) => string;
    dot: boolean;
}> = {
    overall: {
        label: "Overall Trend",
        description: "Long-term direction of the demand",
        dataKey: "trend",
        color: "hsl(var(--primary))",
        xFormatter: (d) => new Date(d).toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
        dot: false,
    },
    week: {
        label: "Weekly Seasonality",
        description: "Pattern of demand throughout the week",
        dataKey: "weekly",
        color: "#82ca9d",
        xFormatter: (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short" }),
        dot: true,
    },
    month: {
        label: "Monthly Seasonality",
        description: "Pattern of demand throughout the year",
        dataKey: "yearly",
        color: "#ff7300",
        xFormatter: (d) => new Date(d).toLocaleDateString("en-US", { month: "short" }),
        dot: false,
    },
};

export default function SeasonalForecast() {
    const [view, setView] = useState<ViewType>("overall");

    const { data, isLoading } = useQuery({
        queryKey: ["global-forecast-detailed"],
        queryFn: () => forecastingApi.getGlobalForecast(365, true),
    });

    if (isLoading) {
        return <DashboardLayout title="Seasonal Analysis">Loading...</DashboardLayout>;
    }

    const components = data?.components;

    if (!components) {
        return (
            <DashboardLayout title="Seasonal Analysis">
                <Card>
                    <CardContent className="pt-6">
                        <p>No seasonal components available. Ensure the model is trained with seasonality enabled.</p>
                    </CardContent>
                </Card>
            </DashboardLayout>
        );
    }

    const chartDataMap: Record<ViewType, any[] | undefined> = {
        overall: components.trend,
        week: components.weekly?.slice(0, 7),
        month: components.yearly,
    };

    const config = VIEW_CONFIG[view];
    const chartData = chartDataMap[view] ?? [];

    return (
        <DashboardLayout title="Seasonal Analysis">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                        <CardTitle>{config.label}</CardTitle>
                        <CardDescription className="mt-1">{config.description}</CardDescription>
                    </div>
                    <Select value={view} onValueChange={(v) => setView(v as ViewType)}>
                        <SelectTrigger className="w-48">
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
                    <div className="h-[380px]">
                        {chartData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                No data available for this view.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="ds"
                                        tickFormatter={config.xFormatter}
                                        minTickGap={view === "week" ? 0 : 30}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        labelFormatter={(d) => new Date(d).toLocaleDateString()}
                                        formatter={(value: number) => [value.toFixed(2), config.label]}
                                    />
                                    <Line
                                        key={view}
                                        type="monotone"
                                        dataKey={config.dataKey}
                                        stroke={config.color}
                                        strokeWidth={2}
                                        dot={config.dot ? { r: 4 } : false}
                                        isAnimationActive={true}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
