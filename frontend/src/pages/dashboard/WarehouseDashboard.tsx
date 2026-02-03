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

const kpiData = [
  { title: "Pending Orders", value: "23", icon: IconClock, color: "text-warning" },
  { title: "In Transit", value: "15", icon: IconTruck, color: "text-info" },
  { title: "Received Today", value: "8", icon: IconCheck, color: "text-success" },
  { title: "Delayed", value: "3", icon: IconAlertTriangle, color: "text-destructive" },
];

const purchaseOrders = [
  { id: "PO-2024-0892", supplier: "Nordic Supply Co.", items: 45, value: "$12,450", status: "in-transit", eta: "Jan 18, 2024", progress: 75 },
  { id: "PO-2024-0891", supplier: "Euro Furniture Ltd.", items: 23, value: "$8,920", status: "pending", eta: "Jan 20, 2024", progress: 25 },
  { id: "PO-2024-0890", supplier: "Global Wood Partners", items: 67, value: "$23,100", status: "in-transit", eta: "Jan 17, 2024", progress: 90 },
  { id: "PO-2024-0889", supplier: "Nordic Supply Co.", items: 34, value: "$9,870", status: "delayed", eta: "Jan 15, 2024", progress: 60 },
  { id: "PO-2024-0888", supplier: "Asian Imports LLC", items: 89, value: "$34,500", status: "received", eta: "Jan 14, 2024", progress: 100 },
];

const inboundShipments = [
  { id: "SHP-001", carrier: "DHL Express", origin: "Stockholm", destination: "Warehouse A", status: "arriving-today", items: 156 },
  { id: "SHP-002", carrier: "FedEx Freight", origin: "Berlin", destination: "Warehouse B", status: "in-transit", items: 89 },
  { id: "SHP-003", carrier: "Maersk Line", origin: "Shanghai", destination: "Warehouse A", status: "customs", items: 342 },
  { id: "SHP-004", carrier: "UPS Ground", origin: "Warsaw", destination: "Warehouse C", status: "delayed", items: 67 },
];

const statusStyles: Record<string, string> = {
  "pending": "bg-muted text-muted-foreground",
  "in-transit": "bg-info/10 text-info border-info/20",
  "received": "bg-success/10 text-success border-success/20",
  "delayed": "bg-destructive/10 text-destructive border-destructive/20",
  "arriving-today": "bg-success/10 text-success border-success/20",
  "customs": "bg-warning/10 text-warning-foreground border-warning/20",
};

export default function WarehouseDashboard() {
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
              <CardTitle>Purchase Orders</CardTitle>
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
                  <TableHead>Items</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.supplier}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>{order.value}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[order.status]}>
                        {order.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.eta}</TableCell>
                    <TableCell>
                      <div className="w-24">
                        <Progress value={order.progress} className="h-2" />
                      </div>
                    </TableCell>
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
              {inboundShipments.map((shipment) => (
                <div key={shipment.id} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconTruck className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{shipment.id}</span>
                      <Badge variant="outline" className={statusStyles[shipment.status]}>
                        {shipment.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {shipment.carrier} • {shipment.origin} → {shipment.destination}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <IconPackage className="h-4 w-4" />
                      {shipment.items} items
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
