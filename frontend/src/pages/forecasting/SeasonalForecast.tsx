import { useQuery } from "@tanstack/react-query";
import { forecastingApi } from "@/lib/forecastingApi";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function SeasonalForecast() {
    const { data, isLoading } = useQuery({
        queryKey: ['global-forecast-detailed'],
        queryFn: () => forecastingApi.getGlobalForecast(365, true)
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

    return (
        <DashboardLayout title="Seasonal Analysis">
            <div className="space-y-6">
                {/* Trend Component */}
                {components.trend && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Trend</CardTitle>
                            <CardDescription>Long-term direction of the demand</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={components.trend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="ds"
                                            tickFormatter={(d) => new Date(d).toLocaleDateString()}
                                            minTickGap={30}
                                        />
                                        <YAxis />
                                        <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                                        <Line type="monotone" dataKey="trend" stroke="#8884d8" dot={false} strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Weekly Seasonality */}
                {components.weekly && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Seasonality</CardTitle>
                            <CardDescription>Pattern of demand throughout the week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={components.weekly.slice(0, 7)}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="ds"
                                            tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}
                                        />
                                        <YAxis />
                                        <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                                        <Line type="monotone" dataKey="weekly" stroke="#82ca9d" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Yearly Seasonality */}
                {components.yearly && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Yearly Seasonality</CardTitle>
                            <CardDescription>Pattern of demand throughout the year</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={components.yearly}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="ds"
                                            tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short' })}
                                            minTickGap={30}
                                        />
                                        <YAxis />
                                        <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                                        <Line type="monotone" dataKey="yearly" stroke="#ff7300" dot={false} strokeWidth={2} />
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
