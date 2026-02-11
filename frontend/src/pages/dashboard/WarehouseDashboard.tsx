import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconTruck, IconPackage, IconClock, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getOrders, getShipments } from "@/lib/api";

const statusStyles: Record<string, string> = {
  "Pending": "bg-muted text-muted-foreground",
  "Processing": "bg-info/10 text-info border-info/20",
  "Approved": "bg-success/10 text-success border-success/20",
  "Delivered": "bg-success/10 text-success border-success/20",
  "In Transit": "bg-info/10 text-info border-info/20",
  "Arrived": "bg-success/10 text-success border-success/20",
  "Delayed": "bg-destructive/10 text-destructive border-destructive/20",
  "Customs": "bg-warning/10 text-warning-foreground border-warning/20",
};

export default function WarehouseDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, shipmentsData] = await Promise.all([
          getOrders(),
          getShipments()
        ]);
        setOrders(ordersData);
        setShipments(shipmentsData);
      } catch (error) {
        console.error("Failed to fetch warehouse data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate KPIs
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const inTransit = shipments.filter(s => s.status === "In Transit").length;
  const receivedToday = shipments.filter(s => s.status === "Arrived" || s.status === "Delivered").length; // Simplified logic
  const delayed = shipments.filter(s => s.status === "Delayed").length;

  const kpiData = [
    { title: "Pending Orders", value: pendingOrders.toString(), icon: IconClock, color: "text-warning" },
    { title: "In Transit", value: inTransit.toString(), icon: IconTruck, color: "text-info" },
    { title: "Received / Arrived", value: receivedToday.toString(), icon: IconCheck, color: "text-success" },
    { title: "Delayed", value: delayed.toString(), icon: IconAlertTriangle, color: "text-destructive" },
  ];

  return (
    <DashboardLayout title="Warehouse Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiData.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{kpi.title}</CardDescription>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Purchase Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Purchase Orders</CardTitle>
              <CardDescription>Track and manage incoming orders</CardDescription>
            </div>
            <Button size="sm">View All Orders</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : orders.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.po_number}</TableCell>
                    <TableCell>{order.supplier_name}</TableCell>
                    <TableCell>${order.total_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[order.status] || "bg-secondary"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Inbound Shipments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Inbound Shipments</CardTitle>
              <CardDescription>Active shipments arriving at warehouses</CardDescription>
            </div>
            <Button size="sm" variant="outline">Track All</Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {loading ? <div>Loading...</div> : shipments.slice(0, 4).map((shipment) => (
                <div key={shipment.id} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconTruck className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{shipment.tracking_number}</span>
                      <Badge variant="outline" className={statusStyles[shipment.status] || "bg-secondary"}>
                        {shipment.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {shipment.carrier} • {shipment.origin} → {shipment.destination}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded">
                      ETA: {shipment.eta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
