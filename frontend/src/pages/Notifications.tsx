import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBell } from "@tabler/icons-react";

export default function Notifications() {
    return (
        <DashboardLayout title="Notifications">
            <div className="max-w-3xl mx-auto space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="items-center flex font-bold text-lg"><IconBell className="mr-2" /> Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-200">
                            <h4 className="font-semibold">Low Stock Triggered</h4>
                            <p className="text-sm">SKU-001234 (KALLAX Shelf Unit) is below threshold.</p>
                            <span className="text-xs opacity-70">2 hours ago</span>
                        </div>
                        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-200">
                            <h4 className="font-semibold">Shipment Arrived</h4>
                            <p className="text-sm">Shipment TRK-55102 from Shanghai has arrived at the warehouse.</p>
                            <span className="text-xs opacity-70">Yesterday</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
