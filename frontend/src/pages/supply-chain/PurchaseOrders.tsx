import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, Calendar, Plus, MapPin, Banknote } from "lucide-react";
import { TrackingTimeline } from "@/components/TrackingTimeline";
import { getOrders, createOrder, getSuppliers } from "@/lib/api";
import { toast } from "sonner";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const ORDER_STAGES = [
    { key: "Pending", label: "Order Placed", description: "Purchase order submitted and awaiting approval." },
    { key: "Approved", label: "Approved", description: "Order approved by procurement. Sent to supplier." },
    { key: "Shipped", label: "Shipped", description: "Supplier has dispatched the goods." },
    { key: "In Transit", label: "In Transit", description: "Shipment is on the way to the warehouse." },
    { key: "Delivered", label: "Delivered", description: "Goods received at the warehouse." },
];

function getStageIndex(status: string) {
    const idx = ORDER_STAGES.findIndex(s => s.key === status);
    return idx === -1 ? 0 : idx;
}

function statusColor(status: string): "default" | "secondary" | "outline" {
    if (status === "Delivered") return "secondary";
    if (status === "Approved" || status === "Shipped" || status === "In Transit") return "default";
    return "outline";
}

function OrderTracker({ order, open, onClose }: { order: any; open: boolean; onClose: () => void }) {
    const currentIdx = getStageIndex(order?.status ?? "Pending");
    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        Order Tracking — {order?.po_number}
                    </DialogTitle>
                    <DialogDescription>
                        Live status for order from <span className="font-medium">{order?.supplier_name}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
                    <div>
                        <p className="text-xs text-muted-foreground">PO Number</p>
                        <p className="font-medium">{order?.po_number}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium">{order?.date}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-medium">${order?.total_amount?.toLocaleString()}</p>
                    </div>
                </div>

                {/* 🎬 Animated timeline — key forces remount on every open */}
                <TrackingTimeline
                    key={`${order?.id}-${open}`}
                    stages={ORDER_STAGES}
                    currentIndex={currentIdx}
                />

                <Separator />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{currentIdx + 1} of {ORDER_STAGES.length} stages complete</span>
                    <Badge variant={statusColor(order?.status)}>{order?.status}</Badge>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const PurchaseOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [trackOrder, setTrackOrder] = useState<any | null>(null);
    const [trackOpen, setTrackOpen] = useState(false);
    const [newOrder, setNewOrder] = useState({
        po_number: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        supplier_id: "",
        total_amount: 0
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersData, suppliersData] = await Promise.all([getOrders(), getSuppliers()]);
            setOrders(ordersData);
            setSuppliers(suppliersData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async () => {
        if (!newOrder.supplier_id) { toast.error("Please select a supplier"); return; }
        try {
            await createOrder({ ...newOrder, supplier_id: parseInt(newOrder.supplier_id) });
            toast.success("Order created successfully");
            setOpen(false);
            fetchData();
            setNewOrder({
                po_number: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
                supplier_id: "",
                total_amount: 0
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to create order");
        }
    };

    return (
        <DashboardLayout title="Supply Chain > Purchase Orders">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Create Order</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Purchase Order</DialogTitle>
                                <DialogDescription>Create a new PO for a supplier.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="po_number" className="text-right">PO Number</Label>
                                    <Input id="po_number" value={newOrder.po_number} onChange={e => setNewOrder({ ...newOrder, po_number: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="supplier" className="text-right">Supplier</Label>
                                    <Select value={newOrder.supplier_id} onValueChange={val => setNewOrder({ ...newOrder, supplier_id: val })}>
                                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="amount" className="text-right">Total Amount</Label>
                                    <Input id="amount" type="number" value={newOrder.total_amount} onChange={e => setNewOrder({ ...newOrder, total_amount: parseFloat(e.target.value) })} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreate}>Create Order</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'Pending').length}</div>
                            <p className="text-xs text-muted-foreground">Orders awaiting approval</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{orders.length}</div>
                            <p className="text-xs text-muted-foreground">Total orders in system</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'In Transit' || o.status === 'Shipped').length}</div>
                            <p className="text-xs text-muted-foreground">Shipments en route</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${orders.reduce((s, o) => s + (o.total_amount || 0), 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Across all orders</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Purchase Orders</CardTitle>
                        <CardDescription>Manage your procurement and supplier orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center">Loading orders...</TableCell></TableRow>
                                ) : (
                                    orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.po_number}</TableCell>
                                            <TableCell>{order.date}</TableCell>
                                            <TableCell>{order.supplier_name}</TableCell>
                                            <TableCell>${order.total_amount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusColor(order.status)}>{order.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline" size="sm"
                                                        className="gap-1.5 text-primary border-primary/40 hover:bg-primary/5"
                                                        onClick={() => { setTrackOrder(order); setTrackOpen(true); }}
                                                    >
                                                        <Truck className="h-3.5 w-3.5" /> Track
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedOrder(order); setDetailsOpen(true); }}>
                                                        Details
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {trackOrder && <OrderTracker order={trackOrder} open={trackOpen} onClose={() => setTrackOpen(false)} />}

                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Purchase Order Details</DialogTitle>
                            <DialogDescription>Detailed view of purchase order</DialogDescription>
                        </DialogHeader>
                        {selectedOrder && (
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><span className="text-sm text-muted-foreground">Order ID</span><p className="font-medium">{selectedOrder.po_number}</p></div>
                                    <div className="space-y-1"><span className="text-sm text-muted-foreground">Status</span><div><Badge variant={statusColor(selectedOrder.status)}>{selectedOrder.status}</Badge></div></div>
                                    <div className="space-y-1"><span className="text-sm text-muted-foreground">Supplier</span><p className="font-medium">{selectedOrder.supplier_name}</p></div>
                                    <div className="space-y-1"><span className="text-sm text-muted-foreground">Date</span><p className="font-medium">{selectedOrder.date}</p></div>
                                    <div className="space-y-1"><span className="text-sm text-muted-foreground">Total Amount</span><p className="font-medium">${selectedOrder.total_amount.toLocaleString()}</p></div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default PurchaseOrders;
