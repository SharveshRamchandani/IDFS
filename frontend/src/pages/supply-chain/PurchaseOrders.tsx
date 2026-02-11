import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, Calendar, DollarSign, Plus } from "lucide-react";
import { getOrders, createOrder, getSuppliers } from "@/lib/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PurchaseOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // New Order State
    const [newOrder, setNewOrder] = useState({
        po_number: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        supplier_id: "",
        total_amount: 0
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersData, suppliersData] = await Promise.all([
                getOrders(),
                getSuppliers()
            ]);
            setOrders(ordersData);
            setSuppliers(suppliersData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async () => {
        if (!newOrder.supplier_id) {
            toast.error("Please select a supplier");
            return;
        }
        try {
            await createOrder({
                ...newOrder,
                supplier_id: parseInt(newOrder.supplier_id)
            });
            toast.success("Order created successfully");
            setOpen(false);
            fetchData(); // Refresh list
            // Reset form
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
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Create Order
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Purchase Order</DialogTitle>
                                <DialogDescription>Create a new PO for a supplier.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="po_number" className="text-right">PO Number</Label>
                                    <Input
                                        id="po_number"
                                        value={newOrder.po_number}
                                        onChange={(e) => setNewOrder({ ...newOrder, po_number: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="supplier" className="text-right">Supplier</Label>
                                    <Select
                                        value={newOrder.supplier_id}
                                        onValueChange={(val) => setNewOrder({ ...newOrder, supplier_id: val })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select Supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map(s => (
                                                <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="amount" className="text-right">Total Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={newOrder.total_amount}
                                        onChange={(e) => setNewOrder({ ...newOrder, total_amount: parseFloat(e.target.value) })}
                                        className="col-span-3"
                                    />
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
                    {/* ... other cards can remain static or be calculated ... */}
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
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">Loading orders...</TableCell>
                                    </TableRow>
                                ) : (
                                    orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.po_number}</TableCell>
                                            <TableCell>{order.date}</TableCell>
                                            <TableCell>{order.supplier_name}</TableCell>
                                            <TableCell>${order.total_amount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={order.status === "Delivered" ? "secondary" : order.status === "Approved" ? "default" : "outline"}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">View</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default PurchaseOrders;
