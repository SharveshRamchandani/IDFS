import { useQuery } from "@tanstack/react-query";
import { forecastingApi } from "@/lib/forecastingApi";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";

export default function ForecastAccuracy() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['forecast-accuracy'],
        queryFn: forecastingApi.getAccuracy
    });

    if (isLoading) {
        return (
            <DashboardLayout title="Forecast Accuracy">
                <div className="flex h-96 items-center justify-center">
                    <p>Loading validation metrics...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !data) {
        return (
            <DashboardLayout title="Forecast Accuracy">
                <Alert variant="destructive">
                    <IconAlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Failed to load accuracy metrics. {error?.message}
                    </AlertDescription>
                </Alert>
            </DashboardLayout>
        );
    }

    if (data.status === "not_evaluated") {
        return (
            <DashboardLayout title="Forecast Accuracy">
                <Alert>
                    <IconAlertCircle className="h-4 w-4" />
                    <AlertTitle>Not Evaluated</AlertTitle>
                    <AlertDescription>
                        {data.message || "Model has not been validated yet."}
                    </AlertDescription>
                </Alert>
            </DashboardLayout>
        );
    }

    const metrics = data.metrics!;

    // Parse MAPE string "12.5%" -> 12.5
    const mapeValue = typeof metrics.MAPE === 'string'
        ? parseFloat(metrics.MAPE.replace('%', ''))
        : (metrics.MAPE || 0);

    // Calculate accuracy score (100 - MAPE), clamped between 0 and 100
    const accuracyScore = Math.max(0, Math.min(100, 100 - mapeValue));

    return (
        <DashboardLayout title="Forecast Accuracy">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
                        <IconCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{accuracyScore.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            100% - MAPE
                        </p>
                        <Progress value={accuracyScore} className="mt-3" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MAPE</CardTitle>
                        <IconCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.MAPE}</div>
                        <p className="text-xs text-muted-foreground">
                            Mean Absolute Percentage Error
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">RMSE</CardTitle>
                        <IconCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics.RMSE !== undefined && metrics.RMSE !== null
                                ? (typeof metrics.RMSE === 'number' ? metrics.RMSE.toFixed(2) : metrics.RMSE)
                                : 'N/A'
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Root Mean Squared Error
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MAE</CardTitle>
                        <IconCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics.MAE !== undefined && metrics.MAE !== null
                                ? (typeof metrics.MAE === 'number' ? metrics.MAE.toFixed(2) : metrics.MAE)
                                : 'N/A'
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Mean Absolute Error
                        </p>
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
        </DashboardLayout>
    );
}
